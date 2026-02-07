import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../turbin3-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint addres
const mint_address = "8a5goUWnMq3T3W77vtHn9eqJXwa5rgmzah99p4eQ98my"  // nft core_bee_worker_003
// const mint_address = "2aKMuo3xdcnVgzN6CFzRJVoRWdgQ4bQQJSr7GjWzSxaM"; // spl_mint_address
const mint = new PublicKey(mint_address);
// Recipient address - wallet 
const recipient_pubkey =  "61cT4TxVoDZ3Sga4fU8CjpEqwkPuDwYSSH63rJzFResJ"; 
const to = new PublicKey(recipient_pubkey);

// const token_decimals = 1_000_000n;    // for spl_tokens
const amount = 1n;  // for nft
// const amount = 10n * token_decimals;  // for spl_tokens

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
