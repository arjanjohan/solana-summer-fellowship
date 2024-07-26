#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const figlet_1 = __importDefault(require("figlet"));
const fs_1 = __importDefault(require("fs"));
const web3_js_1 = require("@solana/web3.js");
const program = new commander_1.Command();
console.log(figlet_1.default.textSync("S O L A M I"));
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
(0, figlet_1.default)("S O L A M I", function (err, data) {
    if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        return;
    }
    console.log(data);
});
function generateKeypair() {
    return __awaiter(this, void 0, void 0, function* () {
        const keypairFile = "keypair.json";
        const keypair = web3_js_1.Keypair.generate();
        const keypairData = {
            publicKey: keypair.publicKey.toBase58(),
            secretKey: Array.from(keypair.secretKey)
        };
        fs_1.default.writeFileSync(keypairFile, JSON.stringify(keypairData, null, 2));
        console.log("Keypair generated and saved to keypair.json");
    });
}
function airdrop() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Requesting airdrop...");
            const connection = new web3_js_1.Connection(solana_endpoint);
            const secretKey = readKeypair().secretKey;
            const payer = web3_js_1.Keypair.fromSecretKey(new Uint8Array(secretKey));
            const airdropSignature = yield connection.requestAirdrop(payer.publicKey, 2 * web3_js_1.LAMPORTS_PER_SOL);
            const latestBlockHash = yield connection.getLatestBlockhash();
            yield connection.confirmTransaction({
                signature: airdropSignature,
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight
            });
            console.log("Airdrop complete");
        }
        catch (error) {
            console.error("Airdrop failed:", error);
        }
    });
}
function send(receiver, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Sending SOL...");
            const connection = new web3_js_1.Connection(solana_endpoint);
            const secretKey = readKeypair().secretKey;
            const payer = web3_js_1.Keypair.fromSecretKey(new Uint8Array(secretKey));
            const receiverPublicKey = readKeypair().publicKey;
            const lamports = parseFloat(amount.toString()) * web3_js_1.LAMPORTS_PER_SOL;
            console.log(`Sending ${lamports} lamports to ${receiverPublicKey}`);
            const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                fromPubkey: payer.publicKey,
                toPubkey: receiverPublicKey,
                lamports: lamports,
            }));
            transaction.feePayer = payer.publicKey;
            transaction.recentBlockhash = (yield connection.getRecentBlockhash()).blockhash;
            transaction.partialSign(payer);
            const signature = yield connection.sendRawTransaction(transaction.serialize());
            console.log(`Transaction complete with signature: ${signature}`);
        }
        catch (error) {
            console.error("Transaction failed:", error);
        }
    });
}
function balance() {
    return __awaiter(this, void 0, void 0, function* () {
        const keypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(readKeypair().secretKey));
        const address = keypair.publicKey;
        const connection = new web3_js_1.Connection(solana_endpoint);
        const balance = yield connection.getBalance(address);
        console.log(`Balance for address ${address}} = ${balance}`);
    });
}
function readKeypair() {
    const keypairData = JSON.parse(fs_1.default.readFileSync("keypair.json", "utf-8"));
    return keypairData;
}
//# sourceMappingURL=index.js.map