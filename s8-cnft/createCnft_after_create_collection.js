const { mintToCollectionV1, createTree, findLeafAssetIdPda, getAssetWithProof, mintV1, mplBubblegum, parseLeafFromMintV1Transaction, verifyCollection } = require('@metaplex-foundation/mpl-bubblegum');
const { createNft, mplTokenMetadata } = require('@metaplex-foundation/mpl-token-metadata');
const { createGenericFile, generateSigner, keypairIdentity, percentAmount, publicKey, sol } = require('@metaplex-foundation/umi');
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { irysUploader } = require('@metaplex-foundation/umi-uploader-irys');
const fs = require('fs');

// Create the wrapper function
const createCnft = async () => {


  const studentAddresses = [
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


  //
  // ** Set Up Umi **
  //

  // In this instance we are using a locally stored wallet. This can be replaced
  // with the code from 'generating a new wallet' if need be but make sure you
  // airdrop/send at least 7.7 SOL to the new wallet.

  const umi = createUmi('https://api.mainnet-beta.solana.com')
  // const umi = createUmi('https://api.devnet.solana.com')
    .use(mplBubblegum())
    .use(mplTokenMetadata())
    .use(
      irysUploader()
    )

  // Generate a new keypair signer.
  const signer = generateSigner(umi)

  // You will need to us fs and navigate the filesystem to
  // load the wallet you wish to use via relative pathing.
  const walletFile = fs.readFileSync('./keypair.json', 'utf8');
  const secretKey = new Uint8Array(JSON.parse(walletFile));  // Parse and convert to Uint8Array

  console.log('Secret Key:', secretKey)
  let keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);


  // Load the keypair into umi.
  umi.use(keypairIdentity(keypair))


  //   Create a tree with the following parameters.
  //   This tree will cost approximately 7.7 SOL to create with a maximum
  //   capacity of 1,000,000 leaves/nfts. You may have to airdrop some SOL
  //   to the umi identity account before running this script.

  console.log('Creating Merkle Tree...')
  // const createTreeTx = await createTree(umi, {
  //   merkleTree,
  //   maxDepth: 14,
  //   maxBufferSize: 64,
  //   canopyDepth: 0,
  // })


  const nftImageUri = ["https://www.miladymaker.net/milady/2208.png"];


  const nftMetadata = {
    name: 'arjanjohan',
    image: nftImageUri[0],
    externalUrl: 'https://twitter.com/arjanjohan',
    attributes: [
      { trait_type: 'twitter', value: 'https://twitter.com/arjanjohan' },
      { trait_type: 'github', value: 'https://github.com/arjanjohan/' },
    ],
    properties: {
      files: [{ uri: nftImageUri[0], 
        type: 'image/png',
       }],
    },
  };


  console.log('Uploading cNFT metadata...')
  const nftMetadataUri = await umi.uploader.uploadJson(nftMetadata)

  //
  // ** Mint a Compressed NFT to the Merkle Tree **
  //

  // The owner of the cNFT being minted.
  for (const student of studentAddresses) {
  // const student = studentAddresses[0];
  console.log('Student Address:', student);
    const newOwner = publicKey(student)

    // MAINNET
    const collectionMintPublicKey = publicKey('7AMCjnQNjeiY7k8LXJ9apVjqgctyGGFVqR363DEaEncZ');  // Collection Mint Address
    const merkleTreePublicKey = publicKey('7YWh3mCmY1gmkRVsDAUWAKcyGMFpR2XNuQKU1rmUq4H5');  // Merkle Tree Public Key
    
    // // DEVNET
    // const collectionMintPublicKey = publicKey('Ax1Z635D4w6jnhpqsqWm3tcqCD1XFhJgcsDz71e4Ay2P');  // Collection Mint Address
    // const merkleTreePublicKey = publicKey('AAP11k9pwjGKgcKkwsbXG6mcGD5QQgu357hF2hqT2dmy');  // Merkle Tree Public Key

    console.log('Minting Compressed NFT to Merkle Tree...')

    // const { signature } = await mintV1(umi, {
      const { signature } = await mintToCollectionV1(umi, {
      leafOwner: newOwner,
      merkleTree: merkleTreePublicKey,
      collectionMint: collectionMintPublicKey,
      metadata: {
        name: 'arjanjohan',
        uri: nftMetadataUri, // Either use `nftMetadataUri` or a previously uploaded uri.
        sellerFeeBasisPoints: 500, // 5%
        collection: { key: collectionMintPublicKey, verified: false },
        creators: [
          { address: umi.identity.publicKey, verified: true, share: 100 },
        ],
      },
    }).sendAndConfirm(umi, { send: { commitment: 'finalized' } })

    
    console.log('Waiting for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

  }


}

// run the wrapper function
createCnft()