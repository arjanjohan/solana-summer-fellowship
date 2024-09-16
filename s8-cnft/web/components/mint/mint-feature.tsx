'use client';

import { useState, ChangeEvent } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import {
  createTree,
  findLeafAssetIdPda,
  mintV1,
  mintToCollectionV1,
  mplBubblegum,
  parseLeafFromMintV1Transaction,
  verifyCollection,
  
} from '@metaplex-foundation/mpl-bubblegum';
import {
  createNft,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';


export default function MintFeature() {

  const studentAddresses = [

    ,'EUeadynFkrBwsWrf1jDjzN6fUewzNERz8v6yztBhGgqh', // DELETE THIS: testing wallet




    
    '7jQFJLS3QRGJyshYkLgp4QQH8D5c9qym2LQzkhag38UD',
    '8J9Hz2tfFLDhE5vcdbinCMug4xqyBCfQCoi4QYfVapEn',
    'A1mq3dn2tUBfJB6WjnL4XtVQgGLGAUD3FeiMLuUQoRMu',
    'HjJQdfTHgC3EBX3471w4st8BXbBmtbaMyCAXNgcUb7dq',
    'BtSTqq27A7xTMaCPWEhNwdf4eHsLWiWZvhQS2ABMd1Y4',
    '9riZWGcTFTLoBpmRM5xfYXCrHsxoqL4ynqBYtNxskYHV',
    'H3QFot1G5Xe8wAjkQbLLt5dEYsHBsicKLHL1aSBv2H2d',
    'G1ZRP9Sz87SZJ6ZdsqaK8QxbXGTwCFv1SYnheRtY63DW',
    '8MgdhXTpfWp5k2m1Q2CxMkETgenkYasNqGW88nUANRkR',
    '6X4G9p5kiE6tDXkBHfpqispJ2B6YfAA3tBGcKvaXaht2',
    '8HWXSHAngoGE9dudeZUcvnP7xRr9Wb4gy7H8VS5GRo7N',
    '9BbWp6tcX9MEGSUEpNXfspYxYsWCxE9FgRkAc3RpftkT',
    '3dfxtPdadK4CdHC1HjcD6Fc2J3x3REy55RyDxAfYuf1d',
    'Fhrr8gFyNAASoCM2GprrjaNahgCJyb5SVV6V5oHr72Fj',
    'DVxLfD4BFF3dLUtpvDZ5jbZExjknE1m2WwH2axz2J6ge',
    '3o5cfcL9VS31T9N5ZbQgLTHokpxiWbTtjoAMjUp2SNey',
    '9unenHYtwUowNkWdZmSYTwzGxxdzKVJh7npk6W6uqRF3',
    '3dTSLCGStegkuoU6dc75DbRdJk4rKV3d5ZCZdSWbTcQv',
    '6ggGtCSpE6moyjDhQQ7MfQ8cw89DcgtYJhaKZaKJ59CQ',
    '9riZWGcTFTLoBpmRM5xfYXCrHsxoqL4ynqBYtNxskYHV',
    'JCsFjtj6tem9Dv83Ks4HxsL7p8GhdLtokveqW7uWjGyi',
    'DH9oe9rfZWkRfBVWvib11ihrgCaYP1jGrD9fXcvhun37',
    '7jQFJLS3QRGJyshYkLgp4QQH8D5c9qym2LQzkhag38UD',
    'HdaKENyK8fxod85QipFYZffC82PmsM8XEW4prcZbeQiK',
    'EcrHvqa5Vh4NhR3bitRZVrdcUGr1Z3o6bXHz7xgBU2FB',
    'GyETGp22PjuTTiQJQ2P9oAe7oioFjJ7tbTBr1qiXZoa8',
    'frae7AtwagcebTnNNFaobGH2haFUGNpFniKELbuBi2z',
    '38rc27bLd73QUDKmiDBQjsmbXpxinx8metaPFsRPSCWi',
    '4syk2oXfU7kgpAPAxsyBv47FHeNuVz5WGc2x8atGNDd2',
    'HFJEhqTUPKKWvhwVeQS5qjSP373kMUFpNuiqMMyXZ2Gr',
    '72hBoHW3TDBHH8vASheaqwVAb8ez3SJAhwtegN5UQvJ9',
    'CxjawXnJxAyb7Zx3xCkSD3nxamdpcfSikvnnC7C8RMHh',
    'A1mq3dn2tUBfJB6WjnL4XtVQgGLGAUD3FeiMLuUQoRMu',
    'ji1E9W3P4Yesmwcv6m5rgBs6dGnshaTcfaFoRW6qcjL',
    'HT8DNntQe2ZN1v763zUqPou5wwNGTg6xBPCDg31vhjrv',
    'BsdgGRzDmVTM8FBepRXrQixMZgjP6smsSbuDb1Y7VJB6'
  ];
  

  const { wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const createCnft = async () => {
    if (!wallet) {
      setStatus('Please connect your wallet.');
      return;
    }
    console.log('Creating cNFT...', selectedFile);

    if (!selectedFile) {
      setStatus('Please select an image file.');
      return;
    }

    setLoading(true);
    setStatus('Minting in progress...');

    try {
      const umi = createUmi('https://api.devnet.solana.com')
        .use(mplBubblegum())
        .use(mplTokenMetadata())
        .use(
          irysUploader()
        );

        umi.use(walletAdapterIdentity(wallet.adapter));

      const merkleTree = generateSigner(umi);
      const createTreeTx = await createTree(umi, {
        merkleTree,
        maxDepth: 7,
        maxBufferSize: 16,
        canopyDepth: 4,
      });
      await createTreeTx.sendAndConfirm(umi);


      console.log('uploading Image...');
      // Convert the selected file to a format that can be uploaded
      const fileData = await selectedFile.arrayBuffer();
      const genericNftImageFile = createGenericFile(new Uint8Array(fileData), selectedFile.name);
      const nftImageUri = await umi.uploader.upload([genericNftImageFile]);
      console.log('Image uploaded:', nftImageUri);
      
      // create collection
      const collectionId = generateSigner(umi)

      const collectionMetadata = {
        name: 'Solana Summer Fellowship: arjanjohan',
        image: nftImageUri[0],
        externalUrl: 'https://twitter.com/arjanjohan',
        properties: {
          files: [
            {
              uri: nftImageUri[0],
              type: selectedFile.type,
            },
          ],
        },
      }

      const collectionMetadataUri = await umi.uploader.uploadJson(collectionMetadata)

      for (const student of studentAddresses) {
        await createNft(umi, {
          mint: collectionId,
          name: 'arjanjohan cNFT',
          uri: 'https://www.example.com/collection.json',
          isCollection: true,
          sellerFeeBasisPoints: percentAmount(0),
        }).sendAndConfirm(umi);
     
          console.log('Uploading metadata...');
          const nftMetadata = {
            name: 'arjanjohan cNFT',
            image: nftImageUri[0],
            externalUrl: 'https://twitter.com/arjanjohan',
            attributes: [
              { trait_type: 'twitter', value: 'https://twitter.com/arjanjohan' },
              { trait_type: 'github', value: 'https://github.com/arjanjohan/' },
            ],
            properties: {
              files: [{ uri: nftImageUri[0], type: selectedFile.type }],
            },
          };
    
          const nftMetadataUri = await umi.uploader.uploadJson(nftMetadata);
          console.log('Metadata uploaded:', nftMetadataUri);
          const newOwner = publicKey(student);
    
          console.log('Minting cNFT...');
          const { signature } = await mintToCollectionV1(umi, {
            leafOwner: newOwner,
            merkleTree: merkleTree.publicKey,
            collectionMint: collectionId.publicKey,
            metadata: {
              name: 'arjanjohan cNFT',
              uri: nftMetadataUri,
              sellerFeeBasisPoints: 500,
              collection: { key: collectionId.publicKey, verified: false },
              creators: [
                { address: umi.identity.publicKey, verified: true, share: 100 },
              ],
            },
          }).sendAndConfirm(umi);

        }


      setStatus('Minting completed successfully!');
    } catch (error) {
      console.error(error);
      setStatus('Minting failed. See console for details.');
    }

    setLoading(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
  };

  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        {wallet ? (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-4"
            />
            <button
              className="btn btn-primary mt-4"
              onClick={createCnft}
              disabled={loading}
            >
              {loading ? 'Minting...' : 'Mint NFT'}
            </button>
          </>
        ) : (
          <p>Please connect your wallet to mint</p>
        )}
        {status && <p>{status}</p>}
      </div>
    </div>
  );
}