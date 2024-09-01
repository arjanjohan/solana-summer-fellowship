import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { createQR } from '@solana/pay';
import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { encodeURL, findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';

// CONSTANTS
const myWallet = 'DemoKMZWkk483hX4mUrcJoo3zVvsKhm8XXs28TuwZw9H'; // Replace with your wallet address (this is the destination where the payment will be sent)
const recipient = new PublicKey(myWallet);
const label = 'Solana Summer Fellowship Shop';
const memo = 'Memo: Fellowship Demo';
const quicknodeEndpoint = 'https://example.solana-devnet.quiknode.pro/123456/'; // Replace with your QuickNode endpoint

export default function Home() {
  const [qrCode, setQrCode] = useState<string>();
  const [reference, setReference] = useState<string>();
  const [amount, setAmount] = useState<string>(''); // State to store the input amount

  const handleGenerateClick = async () => {
    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }), // Send the amount to the backend
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
        <title>Fellowship Solana Pay Demo</title>
        <meta name="description" content="Solana Fellowship: Solana Pay" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <h1 className='text-2xl font-semibold'>Solana Pay Demo</h1>
        </div>
        {qrCode && (
          <Image
            src={qrCode}
            style={{ position: "relative", background: "white" }}
            alt="QR Code"
            width={200}
            height={200}
            priority
          />
        )}
        <div>
          <input
            type="number"
            placeholder="Enter amount in SOL"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ marginBottom: '10px', padding: '10px' }}
          />
          <div>
            <button
              style={{ cursor: 'pointer', padding: '10px', marginRight: '10px' }}
              onClick={handleGenerateClick}
            >
              Generate Solana Pay Order
            </button>
            {reference && <button
              style={{ cursor: 'pointer', padding: '10px' }}
              onClick={handleVerifyClick}
            >
              Verify Transaction
            </button>}
          </div>
        </div>
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
