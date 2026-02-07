import wallet from "../turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({address: "https://devnet.irys.xyz/",}));
umi.use(signerIdentity(signer));

//https://arveave.net/<hash>
//https://devnet.irys.xyz/<hash>

(async () => {
    try {
        //1. Load image
        //2. Convert image to generic file.
        //3. Upload image

        const image = await readFile(
            "./metadata/assets/nft/core_bee_worker_003.png" 
            );

        const file = createGenericFile(
            image, 
            "core_bee_worker_003.png", 
            {contentType: "image/png"}
        );

        const myUri = await umi.uploader.upload([file]);
        console.log("Your image URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();


// core_bee_worker image uri 'https://gateway.irys.xyz/79yWjcv3cJhSHoP4CjkYddvDFiaweo8qtx5zyp7HzboX'
// core_bee_worker image 'https://gateway.irys.xyz/EEhETrirySJACbd9xScsARG4JmuMxsSV6vfbpbGD6W3k'
// core_bee_worker_002 'https://gateway.irys.xyz/6h8hrmh8GNhd33SBVHcYBn4mpnEt92vqvPbyjmuoWs5N'
// core_bee_worker_003 https://gateway.irys.xyz/4nr5vPMz8sBXrCexUo3pLzEXupjoWX9N5CMAnrBz7U7d