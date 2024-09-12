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
          irysUploader({
            address: 'https://devnet.irys.xyz',
          })
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
        name: 'arjanjohan',
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
      const newOwner = publicKey('GTM68MEW8XcLWo36rF2HjMe1DfzB8cnpq8YnWSfNU3on');

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