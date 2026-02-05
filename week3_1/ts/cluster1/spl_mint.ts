import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import wallet from "../turbin3-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_000n;
const amount = 100n * token_decimals;

// Mint address
const mint = new PublicKey("2aKMuo3xdcnVgzN6CFzRJVoRWdgQ4bQQJSr7GjWzSxaM");

(async () => {
    try {
        // Create an ATA
        const ata = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,             //payer
            mint,                // mint PublicKey
            keypair.publicKey    // owner of ata  PublicKey
        );
        console.log(`Your ata is: ${ata.address.toBase58()}`);
       
        // Mint to ATA
        const mintTx = await mintTo(
            connection,
            keypair,            // payer
            mint,               // mint PublicKey
            ata.address,        // destination PublicKey
            keypair,            // authority
            amount
        );
        console.log(`Your mint txid: ${mintTx}`);
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
