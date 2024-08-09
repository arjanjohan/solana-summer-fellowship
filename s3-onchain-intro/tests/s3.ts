import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { S3 } from "../target/types/s3";

describe("s3", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.S3 as Program<S3>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
