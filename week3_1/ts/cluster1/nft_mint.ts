import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../turbin3-wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    let tx = createNft(umi, {
        mint,
        name: "Hive Core Worker 003",
        symbol: "HCW",        
        uri: "https://gateway.irys.xyz/8VPrzpB3tTVQjQir7hwSgr3LK7V6byzP4PGhk2V25U8v",
        sellerFeeBasisPoints: percentAmount(5)
    });
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);
    
    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint.publicKey);
})();

// mint1 core_bee_worker
//  
// min2 core_bee_worker
// https://explorer.solana.com/tx/2ynMLQEhvEy73ayyLXtVxi4bv3aW9MgpyX3i9Eyi9aAZE6gbUJTEimvJHCTiKUDH72qrCLmUbamUyPqJneDh6DDS?cluster=devnet
// Mint Address:  BfV51N4qfJq17mxZaDkRvFrvHbbsewXYpGxy16LY1Cd4

// mint3 core_bee_worker_002
// https://explorer.solana.com/tx/2PRjMre7opVsN2noFHZVrw7KzTj4gBB2S2Lvo9C53UbfhCatDArQEso24TGUFAHSpk3NknuiMB4EZBcY5ybPJdpC?cluster=devnet
// Mint Address:  DTsm34byoDyvv3hsUahBt4jYP9Qzxv5fh4jCTjUqs2H2

// mint3 core_bee_worker_003  -->  mistake in name --> need to fix
// https://explorer.solana.com/tx/3uTrbKc9PSDF1Vp9ZCZaB6xa79Aeows2LoP4wzreHh7QHk8xoLnZuLWjNiyeVEkGvX8ki9y91nAEqELt2m9HfF3j?cluster=devnet
// Mint Address:  NZ7sg3eA4NbLDGBEQX4EyNnBjgYqN9HAQokKNzaE2eZ

// mint3 core_bee_worker_003
// https://explorer.solana.com/tx/zP6R6GM6KGRPd7gAbVBmSUYbgxokNWWYLQ682nTydLdU1f6UCNPCWAUPd18PtVLJjwnRjJfvtBYtFT9whBE6w3V?cluster=devnet
// Mint Address:  8a5goUWnMq3T3W77vtHn9eqJXwa5rgmzah99p4eQ98my