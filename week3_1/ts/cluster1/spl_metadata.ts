import wallet from "../turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args, 
    findMetadataPda,  
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";


// Define our Mint address
const mint_address = "2aKMuo3xdcnVgzN6CFzRJVoRWdgQ4bQQJSr7GjWzSxaM";
const mint = publicKey(mint_address);

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com')   //'https://rpc.ankr.com/solana_devnet'
    .use(mplTokenMetadata());  // register Metaplex Token Metadata programId in Umi

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer)); 

(async () => {
    try {
        // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            metadata: findMetadataPda(umi, { mint }),  // PDA
            mint,
            mintAuthority: signer,
            payer: signer,
            updateAuthority: signer,
        }

        let data: DataV2Args = {
            name: "Sweet Hive Caretaker",
            symbol: "SHC",
            // uri is off-chain JSON metadata
            uri: "https://raw.githubusercontent.com/AndreiTsN/Turbine_Q1_26_Structured_Pre_Builder/main/week2/ts/cluster1/metadata/shc_spl_metadata.json",
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
        };

        let args: CreateMetadataAccountV3InstructionArgs = {
            data,
            isMutable: true,   // here we can forbid the DataV2Args to ever be changed if set to false
            collectionDetails: null,
        };

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        );

        let result = await tx.sendAndConfirm(umi);
        console.log("sig:", bs58.encode(result.signature));
    } catch(error) {
        console.error(`Oops, something went wrong: ${error}`)
    }
})();
