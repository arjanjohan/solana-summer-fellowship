// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import DemoDayProjectIDL from '../target/idl/demo_day_project.json';
import type { DemoDayProject } from '../target/types/demo_day_project';

// Re-export the generated IDL and type
export { DemoDayProject, DemoDayProjectIDL };

// The programId is imported from the program IDL.
export const DEMO_DAY_PROJECT_PROGRAM_ID = new PublicKey(
  DemoDayProjectIDL.address
);

// This is a helper function to get the DemoDayProject Anchor program.
export function getDemoDayProjectProgram(provider: AnchorProvider) {
  return new Program(DemoDayProjectIDL as DemoDayProject, provider);
}

// This is a helper function to get the program ID for the DemoDayProject program depending on the cluster.
export function getDemoDayProjectProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return DEMO_DAY_PROJECT_PROGRAM_ID;
  }
}
