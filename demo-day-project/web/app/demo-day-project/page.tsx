"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
import { create, mplCore } from '@metaplex-foundation/mpl-core'
import {
  generateSigner,
} from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { base58 } from '@metaplex-foundation/umi/serializers'

export default function Page() {
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<{ imageUri: string; signature: string } | null>(null);
  const [selectedColor, setSelectedColor] = useState('#000000'); // Default color: black
  const wallet = useWallet();

  const umi = createUmi('https://api.devnet.solana.com')
  .use(mplCore())
  .use(
    irysUploader({
      // mainnet address: "https://node1.irys.xyz"
      // devnet address: "https://devnet.irys.xyz"
      address: 'https://devnet.irys.xyz',
    })
  )
  .use(walletAdapterIdentity(wallet))


  const mintNFT = async () => {
    setIsMinting(true);
    console.log('Starting NFT minting process...');
    const imageUri = `https://singlecolorimage.com/get/${selectedColor.replace('#', '')}/400x400`
    console.log('Image URI:', imageUri);
  
    const metadata = {
      name: 'My Favorite Color',
      description: 'This is my favorite color, minted on Solana',
      image: imageUri,
      external_url: 'https://singlecolorimage.com/',
      attributes: [
        {
          trait_type: 'hex',
          value: selectedColor,
        },
      ],
      properties: {
        files: [
          {
            uri: imageUri,
            type: 'image/png',
          },
        ],
        category: 'image',
      },
    }
    console.log('Metadata prepared:', metadata);
    
    const metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
      console.error('Error uploading metadata:', err);
      throw new Error(err)
    })
    console.log('Metadata uploaded. URI:', metadataUri);

    const asset = generateSigner(umi)
    console.log('Asset signer generated');

    console.log('Creating NFT...');
    const tx = await create(umi, {
      asset,
      name: 'My Favorite Color',
      uri: metadataUri,
    }).sendAndConfirm(umi)

    const signature = base58.deserialize(tx.signature)[0]
    console.log('NFT created successfully. Signature:', signature);

    setMintedNFT({ imageUri, signature });
    setIsMinting(false);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(event.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mint Your Favorite Color</h1>
      <div className="mb-4">
        <label htmlFor="colorPicker" className="block text-sm font-medium text-gray-700">
          Pick your favorite color:
        </label>
        <input
          type="color"
          id="colorPicker"
          value={selectedColor}
          onChange={handleColorChange}
          className="mt-1 block w-full"
        />
      </div>
      {wallet.connected && (
        <button
          onClick={mintNFT}
          disabled={isMinting}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isMinting ? 'Minting...' : 'Mint NFT'}
        </button>
      )}
      {mintedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold mb-4">NFT Minted Successfully!</h2>
            <img src={mintedNFT.imageUri} alt="Minted NFT" className="w-full mb-4 rounded" />
            <p className="mb-4">
              <a
                href={`https://explorer.solana.com/tx/${mintedNFT.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on Solana Explorer
              </a>
            </p>
            <button
              onClick={() => setMintedNFT(null)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
