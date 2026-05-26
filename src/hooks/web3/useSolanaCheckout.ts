// src/hooks/web3/useSolanaCheckout.ts
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { WalletError } from "@solana/wallet-adapter-base";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from "@solana/web3.js";
import { withRpcFailover } from "@/lib/solana-rpc";
import { throwApiResponseError } from "@/lib/client-api-error";
import { resolveAssetConfig } from "@/lib/asset-config";

export interface CheckoutTransaction {
  id: string;
  amount: number;
  currency: "SOL" | "USDC";
  merchant: {
    walletAddress: string;
  };
}

const PLATFORM_FEE_PERCENTAGE = 0.003; // 0.3%
const DEFAULT_TREASURY_ERROR = "System Configuration Error: Treasury wallet is missing.";
const GENERAL_PAYMENT_ERROR = "Payment failed or was cancelled by the user.";
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const USDC_DECIMALS = 6;

function getAtaAddress(mint: PublicKey, owner: PublicKey) {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return ata;
}

function createAssociatedTokenAccountIx(payer: PublicKey, ata: PublicKey, owner: PublicKey, mint: PublicKey) {
  return new TransactionInstruction({
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: ata, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.alloc(0),
  });
}

function createTransferCheckedIx(
  sourceAta: PublicKey,
  mint: PublicKey,
  destinationAta: PublicKey,
  owner: PublicKey,
  amount: bigint,
  decimals: number,
) {
  const data = Buffer.alloc(10);
  data.writeUInt8(12, 0); // TransferChecked instruction enum
  data.writeBigUInt64LE(amount, 1);
  data.writeUInt8(decimals, 9);

  return new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: sourceAta, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: destinationAta, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    data,
  });
}

export function useSolanaCheckout(transaction: CheckoutTransaction) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connection } = useConnection();
  const { publicKey, wallet, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handlePayment = async () => {
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_WALLET;
      if (!treasuryAddress) {
        throw new Error(DEFAULT_TREASURY_ERROR);
      }

      const merchantPubKey = new PublicKey(transaction.merchant.walletAddress);
      const treasuryPubKey = new PublicKey(treasuryAddress);
      const tx = new Transaction();

      if (transaction.currency === "SOL") {
        const totalLamports = Math.round(transaction.amount * LAMPORTS_PER_SOL);
        const feeLamports = Math.round(totalLamports * PLATFORM_FEE_PERCENTAGE);
        const merchantLamports = totalLamports - feeLamports;

        tx.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: merchantPubKey,
            lamports: merchantLamports,
          })
        );

        if (feeLamports > 0) {
          tx.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: treasuryPubKey,
              lamports: feeLamports,
            })
          );
        }
      } else {
        const assetConfig = resolveAssetConfig("USDC", "client");
        const mint = new PublicKey(assetConfig.mint);
        const treasuryAta = new PublicKey(assetConfig.treasuryAta);

        const payerUsdcAta = getAtaAddress(mint, publicKey);
        const merchantUsdcAta = getAtaAddress(mint, merchantPubKey);

        const payerTokenAccountInfo = await withRpcFailover("checkout.getPayerUsdcAta", async (rpcConnection) => {
          return rpcConnection.getAccountInfo(payerUsdcAta, "confirmed");
        });

        if (!payerTokenAccountInfo) {
          throw new Error("USDC token account not found for payer wallet on current network.");
        }

        const treasuryAccountInfo = await withRpcFailover("checkout.getTreasuryUsdcAta", async (rpcConnection) => {
          return rpcConnection.getAccountInfo(treasuryAta, "confirmed");
        });

        if (!treasuryAccountInfo) {
          throw new Error("Treasury USDC token account is not found for current network.");
        }

        const merchantAccountInfo = await withRpcFailover("checkout.getMerchantUsdcAta", async (rpcConnection) => {
          return rpcConnection.getAccountInfo(merchantUsdcAta, "confirmed");
        });

        if (!merchantAccountInfo) {
          tx.add(
            createAssociatedTokenAccountIx(publicKey, merchantUsdcAta, merchantPubKey, mint)
          );
        }

        const totalUnits = Math.round(transaction.amount * 1_000_000);
        const feeUnits = Math.round(totalUnits * PLATFORM_FEE_PERCENTAGE);
        const merchantUnits = totalUnits - feeUnits;

        tx.add(
          createTransferCheckedIx(
            payerUsdcAta,
            mint,
            merchantUsdcAta,
            publicKey,
            BigInt(merchantUnits),
            USDC_DECIMALS,
          ),
        );

        if (feeUnits > 0) {
          tx.add(
            createTransferCheckedIx(
              payerUsdcAta,
              mint,
              treasuryAta,
              publicKey,
              BigInt(feeUnits),
              USDC_DECIMALS,
            ),
          );
        }
      }

      const latestBlockhash = await withRpcFailover("checkout.getLatestBlockhash", async (rpcConnection) => {
        return rpcConnection.getLatestBlockhash("confirmed");
      });
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);

      const confirmation = await withRpcFailover("checkout.confirmTransaction", async (rpcConnection) => {
        return rpcConnection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed",
        );
      });

      if (confirmation.value.err) {
        throw new Error("Transaction confirmed but resulted in an error on-chain.");
      }

      const res = await fetch("/api/internal/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: transaction.id,
          signature: signature,
          buyerWallet: publicKey.toBase58(),
          walletProvider: wallet?.adapter?.name || "Unknown",
        }),
      });

      if (!res.ok) {
        await throwApiResponseError(
          res,
          "Transaction recorded on the blockchain, but failed to sync with the server.",
        );
      }

      setSuccess(true);

    } catch (err: unknown) {
      let displayMessage = GENERAL_PAYMENT_ERROR;

      if (err instanceof WalletError) {
        displayMessage = err.message || displayMessage;
      } else if (err instanceof Error) {
        displayMessage = err.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("[Solana Checkout Error]:", err);
      }

      setError(displayMessage); 
    } finally {
      setLoading(false);
    }
  };

  return { loading, success, error, connected, handlePayment };
}
