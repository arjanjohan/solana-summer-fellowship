import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenVault } from "../target/types/token_vault";

describe("TokenVault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TokenVault as Program<TokenVault>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initializeVault().rpc();
    console.log("Your transaction signature", tx);
  });
});
