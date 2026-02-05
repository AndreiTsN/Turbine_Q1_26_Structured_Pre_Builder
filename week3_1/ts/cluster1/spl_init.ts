import { Keypair, Connection, Commitment } from "@solana/web3.js";
import { createMint } from '@solana/spl-token';
import wallet from "../turbin3-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

(async () => {
    try {
        // Start here
        const mint = await createMint(
            connection,
            keypair,                // payer
            keypair.publicKey,      // mintAthority PublicKey
            null,                   // freezeAthority PublicKey
            6
        );
        console.log(`Successfully created mint: ${mint.toBase58()}`)
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})();

// mint address = "2aKMuo3xdcnVgzN6CFzRJVoRWdgQ4bQQJSr7GjWzSxaM"