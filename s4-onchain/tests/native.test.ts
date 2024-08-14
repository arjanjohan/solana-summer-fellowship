enum InstructionType {
    CpiTransfer = 0,
  }
  
  class TransferInstruction {
    instruction: InstructionType;
    amount: number;
  
    constructor(props: { instruction: InstructionType; amount: number }) {
      this.instruction = props.instruction;
      this.amount = props.amount;
    }
  
    toBuffer() {
      return Buffer.from(borsh.serialize(TransferInstructionSchema, this));
    }
  
    static fromBuffer(buffer: Buffer) {
      return borsh.deserialize(
        TransferInstructionSchema,
        TransferInstruction,
        buffer
      );
    }
  }
  
  const TransferInstructionSchema = new Map([
    [
      TransferInstruction,
      {
        kind: "struct",
        fields: [
          ["instruction", "u8"],
          ["amount", "u64"],
        ],
      },
    ],
  ]);
  
  function createTransferInstruction(
    payerPubkey: web3.PublicKey,
    recipientPubkey: web3.PublicKey,
    programId: web3.PublicKey,
    instruction: InstructionType,
    amount: number
  ): web3.TransactionInstruction {
    const instructionObject = new TransferInstruction({
      instruction,
      amount,
    });
  
    const ix = new web3.TransactionInstruction({
      keys: [
        { pubkey: payerPubkey, isSigner: true, isWritable: true },
        { pubkey: recipientPubkey, isSigner: false, isWritable: true },
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId,
      data: instructionObject.toBuffer(),
    });
  
    return ix;
  }
  
  describe("transfer-sol", async () => {
    const client = pg.connection;
    const payer = pg.wallet;
  
    const transferAmount = 0.001 * web3.LAMPORTS_PER_SOL;
    const test1Recipient = web3.Keypair.generate();
  
    it("Transfer between accounts", async () => {
      await getBalances(payer.publicKey, test1Recipient.publicKey, "Beginning");
  
      console.log("Program ID: ", pg.PROGRAM_ID.toBase58());
      const ix = createTransferInstruction(
        payer.publicKey,
        test1Recipient.publicKey,
        pg.PROGRAM_ID,
        InstructionType.CpiTransfer,
        transferAmount
      );
  
      const tx = new web3.Transaction();
      tx.add(ix);
      tx.feePayer = pg.wallet.publicKey;
      const blockhashRes = await client.getLatestBlockhash();
      tx.recentBlockhash = blockhashRes.blockhash;
      const signedTx = await pg.wallet.signTransaction(tx);
      const sig = await client.sendRawTransaction(signedTx.serialize());
      console.log(sig);
      await getBalances(payer.publicKey, test1Recipient.publicKey, "Resulting");
    });
  
    async function getBalances(
      payerPubkey: web3.PublicKey,
      recipientPubkey: web3.PublicKey,
      timeframe: string
    ) {
      const payerBalance = await client.getBalance(payerPubkey);
      const recipientBalance = await client.getBalance(recipientPubkey);
  
      console.log(`${timeframe} balances:`);
      console.log(`   Payer: ${payerBalance}`);
      console.log(`   Recipient: ${recipientBalance}`);
    }
  });
  