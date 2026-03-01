import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorFamilyVaultQ126 } from "../target/types/anchor_family_vault_q1_26";
import { expect } from "chai";

describe("anchor-family-vault-q1-26", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .anchorFamilyVaultQ126 as Program<AnchorFamilyVaultQ126>;

  const authority = provider.wallet.publicKey;

  // ----------------------------
  // PDAs
  // ----------------------------
  const [vaultStatePda, stateBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state"), authority.toBuffer()],
      program.programId
    );

  const [vaultPda, vaultBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vaultStatePda.toBuffer()],
      program.programId
    );

  function deriveMemberStatePda(member: anchor.web3.PublicKey) {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("member"), vaultStatePda.toBuffer(), member.toBuffer()],
      program.programId
    );
  }

  async function confirmSig(signature: string) {
    const latest = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction(
      {
        signature,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
      },
      "confirmed"
    );
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ----------------------------
  // MEMBER REGISTRY (IMPORTANT)
  // ----------------------------
  const createdMembers: {
    member: anchor.web3.Keypair;
    memberState: anchor.web3.PublicKey;
  }[] = [];

  async function freezeAndDelete(
    member: anchor.web3.Keypair,
    memberState: anchor.web3.PublicKey
  ) {
    await program.methods
      .setMemberFrozen(true)
      .accountsStrict({
        vaultAuthority: authority,
        vaultState: vaultStatePda,
        member: member.publicKey,
        memberState,
      })
      .rpc();

    await program.methods
      .deleteMember()
      .accountsStrict({
        vaultAuthority: authority,
        vaultState: vaultStatePda,
        member: member.publicKey,
        memberState,
      })
      .rpc();
  }

  async function cleanupAllCreatedMembers() {
    for (let i = createdMembers.length - 1; i >= 0; i--) {
      const { member, memberState } = createdMembers[i];
      try {
        await freezeAndDelete(member, memberState);
      } catch (e) {
        // ignore if already deleted
      }
    }
    createdMembers.length = 0;
  }

  // ----------------------------
  // Shared vars
  // ----------------------------
  let member1: anchor.web3.Keypair;
  let member1StatePda: anchor.web3.PublicKey;

  let wMember: anchor.web3.Keypair;
  let wMemberStatePda: anchor.web3.PublicKey;

  // ----------------------------
  // Airdrop authority
  // ----------------------------
  before(async () => {
    const sig = await provider.connection.requestAirdrop(
      authority,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig, "confirmed");
  });

  // ============================
  // INIT
  // ============================

  it("Initialize: valid", async () => {
    await program.methods
      .initialize()
      .accountsStrict({
        vaultAuthority: authority,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const state = await program.account.vaultState.fetch(vaultStatePda);

    expect(state.vaultAuthority.toBase58()).to.equal(authority.toBase58());
    expect(state.locked).to.equal(false);
    expect(state.vaultBump).to.equal(vaultBump);
    expect(state.stateBump).to.equal(stateBump);
  });

  it("Initialize: invalid (double init)", async () => {
    try {
      await program.methods
        .initialize()
        .accountsStrict({
          vaultAuthority: authority,
          vaultState: vaultStatePda,
          vault: vaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      expect.fail("Second initialize should fail");
    } catch (e) {
      expect(e).to.exist;
    }
  });

  // ============================
  // DEPOSIT
  // ============================

  it("Deposit: valid", async () => {
    const amount = 1 * anchor.web3.LAMPORTS_PER_SOL;

    await program.methods
      .deposit(new anchor.BN(amount))
      .accountsStrict({
        depositor: authority,
        vault: vaultPda,
        vaultState: vaultStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const vaultBalance = await provider.connection.getBalance(vaultPda);
    expect(vaultBalance).to.be.greaterThan(0);
  });

  // ============================
  // MEMBERS BASIC
  // ============================

  it("AddMember: valid", async () => {
    member1 = anchor.web3.Keypair.generate();
    [member1StatePda] = deriveMemberStatePda(member1.publicKey);

    await program.methods
      .addMember(new anchor.BN(1))
      .accountsStrict({
        vaultAuthority: authority,
        vaultState: vaultStatePda,
        member: member1.publicKey,
        memberState: member1StatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    createdMembers.push({ member: member1, memberState: member1StatePda });

    const vs = await program.account.vaultState.fetch(vaultStatePda);
    expect(vs.membersCount).to.equal(1);
  });

  it("DeleteMember: valid cleanup", async () => {
    await cleanupAllCreatedMembers();

    const vs = await program.account.vaultState.fetch(vaultStatePda);
    expect(vs.membersCount).to.equal(0);
  });

  // ============================
  // WITHDRAW
  // ============================

  it("Withdraw: setup", async () => {
    wMember = anchor.web3.Keypair.generate();
    [wMemberStatePda] = deriveMemberStatePda(wMember.publicKey);

    const sig = await provider.connection.requestAirdrop(
      wMember.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await confirmSig(sig);

    await program.methods
      .addMember(new anchor.BN(1))
      .accountsStrict({
        vaultAuthority: authority,
        vaultState: vaultStatePda,
        member: wMember.publicKey,
        memberState: wMemberStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    createdMembers.push({ member: wMember, memberState: wMemberStatePda });
  });

  it("Withdraw: valid", async () => {
    const amount = 0.05 * anchor.web3.LAMPORTS_PER_SOL;

    await program.methods
      .withdraw(new anchor.BN(amount))
      .accountsStrict({
        member: wMember.publicKey,
        vaultState: vaultStatePda,
        vault: vaultPda,
        memberState: wMemberStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wMember])
      .rpc();
  });

  it("Withdraw: invalid (cooldown)", async () => {
    try {
      await program.methods
        .withdraw(new anchor.BN(1_000_000))
        .accountsStrict({
          member: wMember.publicKey,
          vaultState: vaultStatePda,
          vault: vaultPda,
          memberState: wMemberStatePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([wMember])
        .rpc();

      expect.fail("Cooldown should block");
    } catch (e) {
      expect(e).to.exist;
    }
  });

  it("Withdraw: valid after cooldown", async () => {
    await sleep(6000);

    await program.methods
      .withdraw(new anchor.BN(1_000_000))
      .accountsStrict({
        member: wMember.publicKey,
        vaultState: vaultStatePda,
        vault: vaultPda,
        memberState: wMemberStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wMember])
      .rpc();
  });

  // ============================
  // MAX MEMBERS TEST (ISOLATED)
  // ============================

  it("AddMember: invalid (exceed MAX_MEMBERS)", async () => {
    await cleanupAllCreatedMembers();

    const limit = new anchor.BN(1);

    const m1 = anchor.web3.Keypair.generate();
    const m2 = anchor.web3.Keypair.generate();
    const m3 = anchor.web3.Keypair.generate();
    const m4 = anchor.web3.Keypair.generate();

    const [ms1] = deriveMemberStatePda(m1.publicKey);
    const [ms2] = deriveMemberStatePda(m2.publicKey);
    const [ms3] = deriveMemberStatePda(m3.publicKey);
    const [ms4] = deriveMemberStatePda(m4.publicKey);

    await program.methods.addMember(limit).accountsStrict({
      vaultAuthority: authority,
      vaultState: vaultStatePda,
      member: m1.publicKey,
      memberState: ms1,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    createdMembers.push({ member: m1, memberState: ms1 });

    await program.methods.addMember(limit).accountsStrict({
      vaultAuthority: authority,
      vaultState: vaultStatePda,
      member: m2.publicKey,
      memberState: ms2,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    createdMembers.push({ member: m2, memberState: ms2 });

    await program.methods.addMember(limit).accountsStrict({
      vaultAuthority: authority,
      vaultState: vaultStatePda,
      member: m3.publicKey,
      memberState: ms3,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    createdMembers.push({ member: m3, memberState: ms3 });

    try {
      await program.methods.addMember(limit).accountsStrict({
        vaultAuthority: authority,
        vaultState: vaultStatePda,
        member: m4.publicKey,
        memberState: ms4,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      expect.fail("Should exceed max members");
    } catch (e) {
      expect(e).to.exist;
    }

    await cleanupAllCreatedMembers();
  });
});