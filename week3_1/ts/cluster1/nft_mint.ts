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

 
// min2 core_bee_worker
// https://explorer.solana.com/tx/2ynMLQEhvEy73ayyLXtVxi4bv3aW9MgpyX3i9Eyi9aAZE6gbUJTEimvJHCTiKUDH72qrCLmUbamUyPqJneDh6DDS?cluster=devnet
// Mint Address:  BfV51N4qfJq17mxZaDkRvFrvHbbsewXYpGxy16LY1Cd4
