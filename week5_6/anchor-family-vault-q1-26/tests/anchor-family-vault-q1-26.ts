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

  // Derive PDAs (MUST match Rust seeds)
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

  before(async () => {
    const sig = await provider.connection.requestAirdrop(
      authority,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig, "confirmed");
  });

  // ----------------------------
  // VALID INIT
  // ----------------------------
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

    // --- Check state ---
    const state = await program.account.vaultState.fetch(vaultStatePda);

    expect(state.vaultAuthority.toBase58()).to.equal(
      authority.toBase58()
    );
    expect(state.locked).to.equal(false);
    expect(state.vaultBump).to.equal(vaultBump);
    expect(state.stateBump).to.equal(stateBump);

    // --- Check vault account ---
    const info = await provider.connection.getAccountInfo(vaultPda);

    expect(info).to.not.equal(null);
    expect(info!.owner.toBase58()).to.equal(
      anchor.web3.SystemProgram.programId.toBase58()
    );
    expect(info!.data.length).to.equal(0);
  });

  // ----------------------------
  // DOUBLE INIT SHOULD FAIL
  // ----------------------------
  it("Initialize: invalid (double init should fail)", async () => {
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

      expect.fail("Second initialize() should have failed");
    } catch (e: any) {
      expect(e).to.exist;
    }
  });

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

  // ----------------------------
  // DEPOSIT: VALID (owner deposits)
  // ----------------------------
  it("Deposit: valid (owner deposits into own vault)", async () => {
    const depositAmount = 1 * anchor.web3.LAMPORTS_PER_SOL;

    const vaultBefore = await provider.connection.getBalance(vaultPda);
    const ownerBefore = await provider.connection.getBalance(authority);

    await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accountsStrict({
        depositor: authority,
        vault: vaultPda,
        vaultState: vaultStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const vaultAfter = await provider.connection.getBalance(vaultPda);
    const ownerAfter = await provider.connection.getBalance(authority);

    expect(vaultAfter).to.equal(vaultBefore + depositAmount);
    // owner pays deposit + fee, so balance must decrease at least by depositAmount
    expect(ownerAfter).to.be.lessThan(ownerBefore - depositAmount + 1);
  });

  it("Deposit: valid (anyone can deposit into owner's vault)", async () => {
    const depositor = anchor.web3.Keypair.generate();
  
    const sig = await provider.connection.requestAirdrop(
      depositor.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await confirmSig(sig);
  
    const depositAmount = 0.5 * anchor.web3.LAMPORTS_PER_SOL;
  
    const vaultBefore = await provider.connection.getBalance(vaultPda);
    const depositorBefore = await provider.connection.getBalance(depositor.publicKey);
  
    await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accountsStrict({
        depositor: depositor.publicKey,
        vault: vaultPda,
        vaultState: vaultStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([depositor])
      .rpc();
  
    const vaultAfter = await provider.connection.getBalance(vaultPda);
    const depositorAfter = await provider.connection.getBalance(depositor.publicKey);
  
    expect(vaultAfter).to.equal(vaultBefore + depositAmount);
    expect(depositorAfter).to.be.lessThan(depositorBefore - depositAmount + 1);
  });
  
  it("Deposit: invalid (wrong vault PDA for given vault_state)", async () => {
    const depositor = anchor.web3.Keypair.generate();
  
    const sig = await provider.connection.requestAirdrop(
      depositor.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await confirmSig(sig);
  
    const fakeVaultState = anchor.web3.Keypair.generate().publicKey;
    const [wrongVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), fakeVaultState.toBuffer()],
      program.programId
    );
  
    try {
      await program.methods
        .deposit(new anchor.BN(100_000))
        .accountsStrict({
          depositor: depositor.publicKey,
          vault: wrongVaultPda,
          vaultState: vaultStatePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([depositor])
        .rpc();
  
      expect.fail("Deposit should have failed due to seeds constraint");
    } catch (e: any) {
      expect(e).to.exist;
    }
  });
  
});