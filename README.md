# Solana Summer Fellowship 2024 homework.


## s1-introduction

Build a CLI wallet that generates a keypair and can handle airdrop/sending sol.

[Solution code](./s1-introduction)

### Installation
To install the CLI wallet, navigate to the `s1-introduction` directory and run the following commands:
```
npm run build
npm install -g
```

### Solution

```
  ____     ___    _          _      __  __   ___ 
 / ___|   / _ \  | |        / \    |  \/  | |_ _|
 \___ \  | | | | | |       / _ \   | |\/| |  | | 
  ___) | | |_| | | |___   / ___ \  | |  | |  | | 
 |____/   \___/  |_____| /_/   \_\ |_|  |_| |___|
                                                 
Usage: index [options] [command]

A simple CLI to interact with the Solana blockchain

Options:
  -V, --version             output the version number
  -h, --help                display help for command

Commands:
  generate                  Generate a new Solana keypair
  airdrop                   Request an airdrop from the Solana devnet
  send <receiver> <amount>  Send SOL
  balance                   View SOL balance
  help [command]            display help for command
  ```