# Week 3.1 — NFT Minting & Trading on Solana (Devnet)

## Objective
Mint and trade NFTs on Solana Devnet using the provided Solana starter code.

The goal of this task is to:
- create and mint NFTs (image + metadata),
- trade NFTs with other participants,
- analyze limitations of manual NFT trading,
- propose an on-chain solution.

---

## NFT Assets (Local Preview)

The following NFT images are stored directly in this repository and used as source assets.
Small previews are shown below for reference.

<img src="ts/cluster1/metadata/assets/nft/core_bee_worker.png" width="180" />
<img src="ts/cluster1/metadata/assets/nft/core_bee_worker_002.png" width="180" />
<img src="ts/cluster1/metadata/assets/nft/core_bee_worker_003.png" width="180" />

> These images were uploaded to decentralized storage and referenced from NFT metadata.

---

## Image & Metadata Storage (Off-chain)

Both **images** and **metadata JSON** are stored off-chain using decentralized storage.

- Image storage: **Irys (Bundlr-compatible, Arweave-backed)** ->  //https://arveave.net/
- Metadata JSON: stored on the same infrastructure
- Solana stores only the **URI** pointing to metadata

Example image URI:
https://gateway.irys.xyz/79yWjcv3cJhSHoP4CjkYddvDFiaweo8qtx5zyp7HzboX

Example metadata URI: 
https://gateway.irys.xyz/321LPTtwd9wv8ikbgPat3n7mVfRgFSKZGvQVgsX3RXiK

For faster iteration on devnet, the following gateway was used:
https://devnet.irys.xyz/


> Off-chain storage is a standard NFT design choice that improves scalability and reduces on-chain costs while preserving verifiability.

---

## Minted NFTs (Devnet)

### Mint #1
- Mint address:  
  `JxjPtZKhesWJtgRwPPzFC7m4mD86zxJYeqczvV1sKB5`
- Mint transaction:  
  https://explorer.solana.com/tx/52CY7UCd56KZ1PJsYjYWyqg8m9QfLMeFYqs3MdTw8hJUyGBvHzZFrqqkdrfTY7qDtnyV48rtzB2uGEBf9Di9Z3MX?cluster=devnet

### Mint #2
- Mint address:  
  `BfV51N4qfJq17mxZaDkRvFrvHbbsewXYpGxy16LY1Cd4`
- Mint transaction:  
  https://explorer.solana.com/tx/2ynMLQEhvEy73ayyLXtVxi4bv3aW9MgpyX3i9Eyi9aAZE6gbUJTEimvJHCTiKUDH72qrCLmUbamUyPqJneDh6DDS?cluster=devnet

### Mint #3
- Mint address:  
  `8a5goUWnMq3T3W77vtHn9eqJXwa5rgmzah99p4eQ98my`
- Mint transaction:  
  https://explorer.solana.com/tx/zP6R6GM6KGRPd7gAbVBmSUYbgxokNWWYLQ682nTydLdU1f6UCNPCWAUPd18PtVLJjwnRjJfvtBYtFT9whBE6w3V?cluster=devnet

---

## NFT Trading

NFTs were traded manually with other participants using **Solana Devnet wallets**.

- Negotiation was done off-chain (Discord)
- Transfers were executed via **Associated Token Accounts (ATA)**
- NFT transfer amount was fixed to `1` (non-fungible)

---

## Reflection: Problems & Solutions

### Problems Identified
- NFT trading required constant manual coordination.
- One party could receive an NFT and fail to send the counter-asset.
- The process relies on trust and off-chain communication.

### Proposed Solution
An on-chain **escrow smart contract** can solve these issues.

With escrow:
- both parties lock assets into a program,
- conditions are enforced on-chain,
- the swap executes atomically or fails.

This removes counterparty risk and eliminates manual monitoring.

---

## Project Files & Implementation

The task was implemented using the provided Solana starter code and extended as follows:

- `nft_image.ts`  
  - Load local image  
  - Convert image to a generic file  
  - Upload image to decentralized storage

- `nft_metadata.ts`  
  - Generate metadata JSON  
  - Upload metadata to off-chain storage

- `nft_mint.ts`  
  - Create and mint the NFT on Solana Devnet

- `spl_transfer.ts`  
  - Transfer NFT (amount = 1) between ATAs  
  - Updated SPL transfer logic adapted for NFTs

---

## Submission
This repository contains:
- NFT assets
- Minting & transfer scripts
- Transaction hashes
- This README with reflections and analysis

## Addition - NFT Flow Overview

```text
Local Image (PNG)
        |
        v
[nft_image.ts]
Upload image to decentralized storage (Irys / Arweave)
        |
        v
Image URI
        |
        v
[nft_metadata.ts]
Create metadata JSON
(name, symbol, description, image, attributes)
        |
        v
Metadata URI
        |
        v
[nft_mint.ts]
Mint NFT on Solana (Devnet)
        |
        v
NFT Mint Account
        |
        v
[spl_transfer.ts]
Trade NFT (amount = 1)
via Associated Token Accounts (ATA)
```
