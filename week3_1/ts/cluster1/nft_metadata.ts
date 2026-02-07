import wallet from "../turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({address: "https://devnet.irys.xyz/",}));
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
        
        // core_bee_worker
        // mint1 const image = 'https://gateway.irys.xyz/79yWjcv3cJhSHoP4CjkYddvDFiaweo8qtx5zyp7HzboX'
        // mint2 const image = 'https://gateway.irys.xyz/EEhETrirySJACbd9xScsARG4JmuMxsSV6vfbpbGD6W3k'
        // mint3 core_bee_worker_002 'https://gateway.irys.xyz/6h8hrmh8GNhd33SBVHcYBn4mpnEt92vqvPbyjmuoWs5N'
        // mint4 core_bee_worker_003 https://gateway.irys.xyz/4nr5vPMz8sBXrCexUo3pLzEXupjoWX9N5CMAnrBz7U7d

        const image = 'https://gateway.irys.xyz/4nr5vPMz8sBXrCexUo3pLzEXupjoWX9N5CMAnrBz7U7d'
        const metadata = {
             name: "Hive Core Worker 003",
             symbol: "HCW",
             description: "A core worker bee 003.",
             image: image,
             attributes: [
                 {trait_type: 'Role', value: 'Worker'}
             ],
             properties: {
                 files: [
                     {
                         type: "image/png",
                         uri: image
                     },
                 ]
             },
             creators: []
        };
        const myUri = await umi.uploader.uploadJson(metadata);
        console.log("Your metadata URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();

// mint1 core_bee_worker Your metadata URI:  https://gateway.irys.xyz/321LPTtwd9wv8ikbgPat3n7mVfRgFSKZGvQVgsX3RXiK
// mint2 core_bee_worker Your metadata URI:  https://gateway.irys.xyz/D3QBCwJnnMXJpupE4Ys9H9oPJexYVo2aEuFjfjgeLpvm
// mint3 core_bee_worker_002 Your metadata URI:  https://gateway.irys.xyz/3jsogZy68FFfvT73Bqq1NoDgqqHUTTZUiKaJCFP3NfBr
// mint4 core_bee_worker_003 Your metadata URI: https://gateway.irys.xyz/8VPrzpB3tTVQjQir7hwSgr3LK7V6byzP4PGhk2V25U8v