import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { createQR } from '@solana/pay';
import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { encodeURL, findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';

// CONSTANTS
const myWallet = '8hutE9EgX28yW4V2zdLG48cMc4kYQLMqtEqobsDQdsRK';
const recipient = new PublicKey(myWallet);
const label = 'Solana Summer Fellowship Shop';
const memo = 'Memo: Fellowship Demo';
const quicknodeEndpoint = 'https://example.solana-devnet.quiknode.pro/123456/'; 

const items = [
  { id: 1, name: 'Mug', price: '0.1', image: '/assets/mug.jpeg' },
  { id: 2, name: 'Shirt', price: '0.3', image: '/assets/longsleeve.jpeg' },
  { id: 3, name: 'Cap', price: '0.2', image: '/assets/cap.jpeg' },
];

export default function Home() {
  const [qrCode, setQrCode] = useState<string>();
  const [reference, setReference] = useState<string>();

  const handleBuyClick = async (price: string) => {
    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: price }),
    });
    const { url, ref } = await res.json();
    console.log(url);
    const qr = createQR(url);
    const qrBlob = await qr.getRawData('png');
    if (!qrBlob) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setQrCode(event.target.result);
      }
    };
    reader.readAsDataURL(qrBlob);
    setReference(ref);
  };

  const handleVerifyClick = async () => {
    const res = await fetch(`/api/pay?reference=${reference}`);
    const { status } = await res.json();
    if (status === 'verified') {
      alert('Transaction verified');
      setQrCode(undefined);
      setReference(undefined);
    } else {
      alert('Transaction not found');
    }
  };

  return (
    <>
      <Head>
        <title>Solana Fellowship Shop</title>
        <meta name="description" content="Solana Fellowship: Solana Pay" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex ">
          <h1 className='text-2xl font-semibold'>Solana Fellowship Shop</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col items-center border p-4 rounded">
              <Image
                src={item.image}
                alt={item.name}
                width={200}
                height={200}
                priority
              />
              <h2 className="mt-2 text-lg font-semibold">{item.name}</h2>
              <p className="mt-1 text-gray-500">{item.price} SOL</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
                onClick={() => handleBuyClick(item.price)}
              >
                Buy
              </button>
            </div>
          ))}
        </div>
        {qrCode && (
          <div className="mt-10">
            <Image
              src={qrCode}
              style={{ position: "relative", background: "white" }}
              alt="QR Code"
              width={200}
              height={200}
              priority
            />
          </div>
        )}
        {reference && (
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
            onClick={handleVerifyClick}
          >
            Verify Transaction
          </button>
        )}
      </main>
    </>
  );
}

// API handler function
export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { amount: amountInput } = req.body;
      if (!amountInput) {
        return res.status(400).json({ error: 'Missing amount' });
      }
      const amount = new BigNumber(amountInput);
      const reference = new Keypair().publicKey;
      const message = `Fellowship Demo - Order #0${Math.floor(Math.random() * 999999) + 1}`;
      const urlData = await generateUrl(
        recipient,
        amount,
        reference,
        label,
        message,
        memo
      );
      const ref = reference.toBase58();
      paymentRequests.set(ref, { recipient, amount, memo });
      const { url } = urlData;
      res.status(200).json({ url: url.toString(), ref });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    const reference = req.query.reference;
    if (!reference) {
      res.status(400).json({ error: 'Missing reference query parameter' });
      return;
    }
    try {
      const referencePublicKey = new PublicKey(reference as string);
      const response = await verifyTransaction(referencePublicKey);
      if (response) {
        res.status(200).json({ status: 'verified' });
      } else {
        res.status(404).json({ status: 'not found' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

async function generateUrl(
  recipient: PublicKey,
  amount: BigNumber,
  reference: PublicKey,
  label: string,
  message: string,
  memo: string,
) {
  const url: URL = encodeURL({
    recipient,
    amount,
    reference,
    label,
    message,
    memo,
  });
  return { url };
}

const paymentRequests = new Map<string, { recipient: PublicKey; amount: BigNumber; memo: string }>();

async function verifyTransaction(reference: PublicKey) {
  const paymentData = paymentRequests.get(reference.toBase58());
  if (!paymentData) {
    throw new Error('Payment request not found');
  }
  const { recipient, amount, memo } = paymentData;
  const connection = new Connection(quicknodeEndpoint, 'confirmed');
  const found = await findReference(connection, reference);
  const response = await validateTransfer(
    connection,
    found.signature,
    {
      recipient,
      amount,
      splToken: undefined,
      reference,
    },
    { commitment: 'confirmed' }
  );
  if (response) {
    paymentRequests.delete(reference.toBase58());
  }
  return response;
}
