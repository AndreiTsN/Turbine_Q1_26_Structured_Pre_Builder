import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../turbin3-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint_address = "2aKMuo3xdcnVgzN6CFzRJVoRWdgQ4bQQJSr7GjWzSxaM";
const mint = new PublicKey(mint_address);
// Recipient address
const recipient_pubkey =  "";  // !!!!! add here recipient PubkicKey !!!!! 
const to = new PublicKey(recipient_pubkey);

const token_decimals = 1_000_000n;
const amount = 15n * token_decimals;

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const fromWalletAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey   //// PublicKey of sender
        );
        
        // Get the token account of the toWallet address, and if it does not exist, create it
        const toWalletAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to           // PublicKey of recipient
        );

        // Transfer the new token to the "toTokenAccount" we just created
        const transfer_token = await transfer(
            connection,
            keypair,                //payer
            fromWalletAta.address,
            toWalletAta.address,
            keypair,               // owner fromWalletAta
            amount
        );
        console.log("Sender ATA:", fromWalletAta.address.toBase58());
        console.log("Recipient ATA:", toWalletAta.address.toBase58());
        console.log("Transfer sig:", transfer_token);


    } catch(error) {
        console.error(`Oops, something went wrong: ${error}`)
    }
})();