import { PublicKey } from "@solana/web3.js";
import { resolveAssetConfig } from "@/lib/asset-config";
import { withRpcFailover } from "@/lib/solana-rpc";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const PLATFORM_FEE_RATE = 0.003;
const USDC_DECIMALS = 6;
const CHAIN_TIME_SKEW_SECONDS = 120;

type SupportedCurrency = "SOL" | "USDC";

type VerificationInput = {
  signature: string;
  amount: number;
  currency: SupportedCurrency;
  merchantWallet: string;
  createdAt: Date;
  expiresAt: Date;
};

export type VerificationFailureCode =
  | "CHAIN_TX_NOT_FOUND"
  | "CHAIN_TX_FAILED"
  | "CHAIN_TIME_WINDOW_MISMATCH"
  | "CHAIN_PAYER_MISMATCH"
  | "CHAIN_AMOUNT_MISMATCH"
  | "CHAIN_DESTINATION_MISMATCH"
  | "CHAIN_MINT_MISMATCH";

type VerificationSuccess = {
  ok: true;
  buyerWallet: string;
  verificationSource: "rpc.getParsedTransaction";
  verifiedAt: string;
  verifiedSlot: number;
};

type VerificationFailure = {
  ok: false;
  code: VerificationFailureCode;
  message: string;
};

export type VerificationResult = VerificationSuccess | VerificationFailure;

function getAtaAddress(mint: PublicKey, owner: PublicKey) {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return ata.toBase58();
}

function roundedAmount(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor);
}

function parseLamports(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseInt(value, 10);
  return 0;
}

export async function verifyCheckoutPaymentOnChain(input: VerificationInput): Promise<VerificationResult> {
  const tx = await withRpcFailover("confirm.getParsedTransaction", async (connection) =>
    connection.getParsedTransaction(input.signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    }),
  );

  if (!tx) {
    return { ok: false, code: "CHAIN_TX_NOT_FOUND", message: "Transaction signature is not found on chain." };
  }

  if (tx.meta?.err) {
    return { ok: false, code: "CHAIN_TX_FAILED", message: "Transaction exists but failed on-chain." };
  }

  const blockTime = tx.blockTime;
  if (!blockTime) {
    return { ok: false, code: "CHAIN_TIME_WINDOW_MISMATCH", message: "Transaction block time is unavailable." };
  }

  const txTime = blockTime * 1000;
  const minTime = input.createdAt.getTime() - CHAIN_TIME_SKEW_SECONDS * 1000;
  const maxTime = input.expiresAt.getTime() + CHAIN_TIME_SKEW_SECONDS * 1000;
  if (txTime < minTime || txTime > maxTime) {
    return { ok: false, code: "CHAIN_TIME_WINDOW_MISMATCH", message: "Transaction is outside checkout time window." };
  }

  const accountKeys = tx.transaction.message.accountKeys.map((key) => key.pubkey.toBase58());
  const buyerWallet = accountKeys[0];
  if (!buyerWallet) {
    return { ok: false, code: "CHAIN_PAYER_MISMATCH", message: "Cannot resolve transaction payer wallet." };
  }

  const feeUnits = Math.round(input.amount * PLATFORM_FEE_RATE * (input.currency === "SOL" ? 1_000_000_000 : 1_000_000));
  if (input.currency === "SOL") {
    const totalLamports = roundedAmount(input.amount, 9);
    const expectedMerchant = totalLamports - feeUnits;
    const expectedTreasury = feeUnits;
    const treasuryWallet = (process.env.NEXT_PUBLIC_TREASURY_WALLET || "").trim();
    if (!treasuryWallet) {
      return { ok: false, code: "CHAIN_DESTINATION_MISMATCH", message: "Treasury wallet is not configured." };
    }

    let merchantLamports = 0;
    let treasuryLamports = 0;
    for (const instruction of tx.transaction.message.instructions) {
      const parsed = "parsed" in instruction ? instruction.parsed : null;
      const program = "program" in instruction ? instruction.program : "";
      if (!parsed || program !== "system" || parsed.type !== "transfer") continue;

      const info = parsed.info as { source?: string; destination?: string; lamports?: number | string };
      if (info.source !== buyerWallet) continue;
      const lamports = parseLamports(info.lamports);
      if (info.destination === input.merchantWallet) merchantLamports += lamports;
      if (info.destination === treasuryWallet) treasuryLamports += lamports;
    }

    if (merchantLamports !== expectedMerchant || treasuryLamports !== expectedTreasury) {
      return { ok: false, code: "CHAIN_AMOUNT_MISMATCH", message: "SOL transfer amounts do not match invoice split." };
    }
  } else {
    const usdcConfig = resolveAssetConfig("USDC", "server");
    const merchantAta = getAtaAddress(new PublicKey(usdcConfig.mint), new PublicKey(input.merchantWallet));
    const expectedTotal = roundedAmount(input.amount, USDC_DECIMALS);
    const expectedMerchant = expectedTotal - feeUnits;
    const expectedTreasury = feeUnits;

    let merchantUnits = 0;
    let treasuryUnits = 0;
    let seenWrongMint = false;

    for (const instruction of tx.transaction.message.instructions) {
      const parsed = "parsed" in instruction ? instruction.parsed : null;
      const program = "program" in instruction ? instruction.program : "";
      if (!parsed || (program !== "spl-token" && program !== "spl-token-2022")) continue;
      if (parsed.type !== "transferChecked" && parsed.type !== "transfer") continue;

      const info = parsed.info as {
        authority?: string;
        mint?: string;
        destination?: string;
        tokenAmount?: { amount?: string };
        amount?: string;
      };
      if (info.authority !== buyerWallet) continue;
      if (info.mint && info.mint !== usdcConfig.mint) {
        seenWrongMint = true;
        continue;
      }

      const raw = info.tokenAmount?.amount ?? info.amount ?? "0";
      const units = Number.parseInt(raw, 10);
      if (info.destination === merchantAta) merchantUnits += units;
      if (info.destination === usdcConfig.treasuryAta) treasuryUnits += units;
    }

    if (seenWrongMint) {
      return { ok: false, code: "CHAIN_MINT_MISMATCH", message: "Token mint does not match configured USDC mint." };
    }

    if (merchantUnits !== expectedMerchant || treasuryUnits !== expectedTreasury) {
      return { ok: false, code: "CHAIN_AMOUNT_MISMATCH", message: "USDC transfer amounts do not match invoice split." };
    }

    if (merchantUnits === 0 && treasuryUnits === 0) {
      return { ok: false, code: "CHAIN_DESTINATION_MISMATCH", message: "Expected merchant/treasury token accounts were not credited." };
    }
  }

  return {
    ok: true,
    buyerWallet,
    verificationSource: "rpc.getParsedTransaction",
    verifiedAt: new Date().toISOString(),
    verifiedSlot: tx.slot,
  };
}
