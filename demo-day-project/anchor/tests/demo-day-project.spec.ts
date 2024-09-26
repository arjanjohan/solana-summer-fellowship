import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { DemoDayProject } from '../target/types/demo_day_project';

describe('demo-day-project', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.DemoDayProject as Program<DemoDayProject>;

  const demoDayProjectKeypair = Keypair.generate();

  it('Initialize DemoDayProject', async () => {
    await program.methods
      .initialize()
      .accounts({
        demoDayProject: demoDayProjectKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([demoDayProjectKeypair])
      .rpc();

    const currentCount = await program.account.demoDayProject.fetch(
      demoDayProjectKeypair.publicKey
    );

    expect(currentCount.count).toEqual(0);
  });

  it('Increment DemoDayProject', async () => {
    await program.methods
      .increment()
      .accounts({ demoDayProject: demoDayProjectKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.demoDayProject.fetch(
      demoDayProjectKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Increment DemoDayProject Again', async () => {
    await program.methods
      .increment()
      .accounts({ demoDayProject: demoDayProjectKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.demoDayProject.fetch(
      demoDayProjectKeypair.publicKey
    );

    expect(currentCount.count).toEqual(2);
  });

  it('Decrement DemoDayProject', async () => {
    await program.methods
      .decrement()
      .accounts({ demoDayProject: demoDayProjectKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.demoDayProject.fetch(
      demoDayProjectKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Set demoDayProject value', async () => {
    await program.methods
      .set(42)
      .accounts({ demoDayProject: demoDayProjectKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.demoDayProject.fetch(
      demoDayProjectKeypair.publicKey
    );

    expect(currentCount.count).toEqual(42);
  });

  it('Set close the demoDayProject account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        demoDayProject: demoDayProjectKeypair.publicKey,
      })
      .rpc();

    // The account should no longer exist, returning null.
    const userAccount = await program.account.demoDayProject.fetchNullable(
      demoDayProjectKeypair.publicKey
    );
    expect(userAccount).toBeNull();
  });
});
