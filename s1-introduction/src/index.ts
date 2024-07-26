#! /usr/bin/env node

import { Command } from "commander";
import figlet from "figlet";
import fs from "fs";
import { Keypair, Connection, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

const program = new Command();

console.log(figlet.textSync("S O L A M I"));

const solana_endpoint = "http://127.0.0.1:8899";
// const solana_endpoint = " https://api.devnet.solana.com";


program
  .version("1.0.0")
  .description("A simple CLI to interact with the Solana blockchain");

program
  .command("generate")
  .description("Generate a new Solana keypair and save it to keypair.json")
  .action(generateKeypair);

program
  .command("airdrop")
  .description("Request an airdrop of 2 SOL from the faucet")
  .action(airdrop);

program
  .command("send <receiver> <amount>")
  .description("Send SOL from the keypair in keypair.json to another address")
  .action(send);

program
  .command("balance")
  .description("View SOL balance of the keypair in keypair.json")
  .action(balance);

program.parse(process.argv);


const options = program.opts();

figlet("S O L A M I", function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
});


async function generateKeypair() {
  const keypairFile = "keypair.json";
  
  
  const keypair = Keypair.generate();
  const keypairData = {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Array.from(keypair.secretKey)
  };

  fs.writeFileSync(keypairFile, JSON.stringify(keypairData, null, 2));
  console.log("Keypair generated and saved to keypair.json");
}

async function airdrop() {
  try {
    console.log("Requesting airdrop...");
    const connection = new Connection(solana_endpoint);
    const secretKey = readKeypair().secretKey;
    const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);

    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: airdropSignature,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight
    });

    console.log("Airdrop complete");
  } catch (error) {
    console.error("Airdrop failed:", error);
  }
}

async function send(receiver: string, amount: number) {
  try {
    console.log("Sending SOL...");
    const connection = new Connection(solana_endpoint);
    const secretKey = readKeypair().secretKey;
    const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));
    const receiverPublicKey = readKeypair().publicKey;
    const lamports = parseFloat(amount.toString()) * LAMPORTS_PER_SOL;
    console.log(`Sending ${lamports} lamports to ${receiverPublicKey}`);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: receiverPublicKey,
        lamports: lamports,
      })
    );

    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    
    transaction.partialSign(payer);

    const signature = await connection.sendRawTransaction(transaction.serialize());
    console.log(`Transaction complete with signature: ${signature}`);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}

async function balance() {
  const keypair = Keypair.fromSecretKey(new Uint8Array(readKeypair().secretKey));
  const address = keypair.publicKey;
  const connection = new Connection(solana_endpoint);
  const balance = await connection.getBalance(address);
  console.log(`Balance for address ${address}} = ${balance}`);
  
}

function readKeypair() {
  const keypairData = JSON.parse(fs.readFileSync("keypair.json", "utf-8"));
  return keypairData;
}
