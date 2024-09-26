'use client';

import {
  getDemoDayProjectProgram,
  getDemoDayProjectProgramId,
} from '@demo-day-project/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useDemoDayProjectProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getDemoDayProjectProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getDemoDayProjectProgram(provider);

  const accounts = useQuery({
    queryKey: ['demo-day-project', 'all', { cluster }],
    queryFn: () => program.account.demoDayProject.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['demo-day-project', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ demoDayProject: keypair.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useDemoDayProjectProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useDemoDayProjectProgram();

  const accountQuery = useQuery({
    queryKey: ['demo-day-project', 'fetch', { cluster, account }],
    queryFn: () => program.account.demoDayProject.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['demo-day-project', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ demoDayProject: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['demo-day-project', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ demoDayProject: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['demo-day-project', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ demoDayProject: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['demo-day-project', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ demoDayProject: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  };
}
