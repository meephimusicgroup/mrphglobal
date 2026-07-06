import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { config } from "./config.js";
import { decryptSecret } from "./crypto.js";
import type { StoredWallet } from "./storage.js";

const WEBSITE_URL = "http://167.233.230.221:8080/landing.html";
const EXPLORER_HOME = "http://167.233.230.221:8080/ping/mrphglobal";
const FEE_BASE = 200000n;

export interface NetworkStatus {
  chainId: string;
  height: string;
  catchingUp: boolean;
}

export interface TxSummary {
  hash: string;
  direction: "in" | "out";
  amount: string;
  counterparty: string;
}

export interface IbcChannel {
  state: string;
  portId: string;
  channelId: string;
  counterpartyPort: string;
  counterpartyChannel: string;
}

export function formatAmount(baseAmount: string): string {
  const decimals = config.denomDecimals;
  const padded = baseAmount.padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals) || "0";
  const fraction = padded.slice(-decimals).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

export function parseDisplayAmount(input: string): string {
  const trimmed = input.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("INVALID_AMOUNT");
  }
  const [whole, fraction = ""] = trimmed.split(".");
  if (fraction.length > config.denomDecimals) {
    throw new Error("INVALID_AMOUNT");
  }
  const base =
    whole + fraction.padEnd(config.denomDecimals, "0").slice(0, config.denomDecimals);
  if (base === "0".repeat(base.length)) {
    throw new Error("INVALID_AMOUNT");
  }
  return BigInt(base).toString();
}

export function isValidAddress(address: string): boolean {
  const prefix = config.addrPrefix;
  if (!address.startsWith(prefix)) {
    return false;
  }
  const body = address.slice(prefix.length);
  return body.length >= 20 && body.length <= 90 && /^[a-z0-9]+$/.test(body);
}

export async function createWallet(): Promise<{ address: string; mnemonic: string }> {
  const wallet = await DirectSecp256k1HdWallet.generate(24, {
    prefix: config.addrPrefix,
  });
  const [account] = await wallet.getAccounts();
  const mnemonic = wallet.mnemonic;
  if (!mnemonic) {
    throw new Error("Failed to generate mnemonic");
  }
  return { address: account.address, mnemonic };
}

export async function importFromMnemonic(mnemonic: string): Promise<{ address: string }> {
  const normalized = mnemonic.trim().toLowerCase().replace(/\s+/g, " ");
  const words = normalized.split(" ");
  if (words.length !== 12 && words.length !== 24) {
    throw new Error("INVALID_MNEMONIC");
  }
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(normalized, {
    prefix: config.addrPrefix,
  });
  const [account] = await wallet.getAccounts();
  return { address: account.address };
}

async function walletFromStored(stored: StoredWallet): Promise<DirectSecp256k1HdWallet> {
  const mnemonic = decryptSecret(stored.encryptedMnemonic, config.encryptionKey);
  return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: config.addrPrefix });
}

export async function getBalance(address: string): Promise<string> {
  const client = await StargateClient.connect(config.rpcUrl);
  try {
    const balance = await client.getBalance(address, config.denom);
    return balance.amount;
  } finally {
    client.disconnect();
  }
}

export async function getNetworkStatus(): Promise<NetworkStatus> {
  const res = await fetch(`${config.rpcUrl}/status`);
  if (!res.ok) {
    throw new Error(`RPC ${res.status}`);
  }
  const data = (await res.json()) as {
    result: {
      node_info: { network: string };
      sync_info: { latest_block_height: string; catching_up: boolean };
    };
  };
  return {
    chainId: data.result.node_info.network,
    height: data.result.sync_info.latest_block_height,
    catchingUp: data.result.sync_info.catching_up,
  };
}

async function lcdFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${config.lcdUrl}${path}`);
  if (!res.ok) {
    throw new Error(`LCD ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getIbcChannels(): Promise<IbcChannel[]> {
  try {
    const data = await lcdFetch<{
      channels: Array<{
        state: string;
        port_id: string;
        channel_id: string;
        counterparty: { port_id: string; channel_id: string };
      }>;
    }>("/ibc/core/channel/v1/channels");
    return (data.channels ?? []).map((ch) => ({
      state: ch.state,
      portId: ch.port_id,
      channelId: ch.channel_id,
      counterpartyPort: ch.counterparty.port_id,
      counterpartyChannel: ch.counterparty.channel_id,
    }));
  } catch {
    return [];
  }
}

function parseTransferFromTx(
  tx: {
    body: { messages: Array<{ "@type": string; from_address?: string; to_address?: string; amount?: Array<{ denom: string; amount: string }> }> };
  },
  address: string,
): TxSummary | null {
  for (const msg of tx.body.messages) {
    if (!msg["@type"]?.includes("MsgSend")) {
      continue;
    }
    const coin = msg.amount?.find((c) => c.denom === config.denom);
    if (!coin || !msg.from_address || !msg.to_address) {
      continue;
    }
    if (msg.from_address === address) {
      return {
        hash: "",
        direction: "out",
        amount: coin.amount,
        counterparty: msg.to_address,
      };
    }
    if (msg.to_address === address) {
      return {
        hash: "",
        direction: "in",
        amount: coin.amount,
        counterparty: msg.from_address,
      };
    }
  }
  return null;
}

export async function getRecentTxs(address: string, limit = 5): Promise<TxSummary[]> {
  const event = `transfer.recipient='${address}'`;
  const seen = new Set<string>();
  const results: TxSummary[] = [];

  try {
    const data = await lcdFetch<{
      tx_responses: Array<{
        txhash: string;
        tx: {
          body: {
            messages: Array<{
              "@type": string;
              from_address?: string;
              to_address?: string;
              amount?: Array<{ denom: string; amount: string }>;
            }>;
          };
        };
      }>;
    }>(
      `/cosmos/tx/v1beta1/txs?events=${encodeURIComponent(event)}&order_by=ORDER_BY_DESC&pagination.limit=${limit}`,
    );

    for (const item of data.tx_responses ?? []) {
      if (seen.has(item.txhash)) {
        continue;
      }
      const parsed = parseTransferFromTx(item.tx, address);
      if (!parsed) {
        continue;
      }
      seen.add(item.txhash);
      results.push({ ...parsed, hash: item.txhash });
    }
  } catch {
    // LCD query may be empty for new wallets
  }

  if (results.length < limit) {
    try {
      const eventOut = `transfer.sender='${address}'`;
      const data = await lcdFetch<{
        tx_responses: Array<{
          txhash: string;
          tx: {
            body: {
              messages: Array<{
                "@type": string;
                from_address?: string;
                to_address?: string;
                amount?: Array<{ denom: string; amount: string }>;
              }>;
            };
          };
        }>;
      }>(
        `/cosmos/tx/v1beta1/txs?events=${encodeURIComponent(eventOut)}&order_by=ORDER_BY_DESC&pagination.limit=${limit}`,
      );
      for (const item of data.tx_responses ?? []) {
        if (seen.has(item.txhash)) {
          continue;
        }
        const parsed = parseTransferFromTx(item.tx, address);
        if (!parsed) {
          continue;
        }
        seen.add(item.txhash);
        results.push({ ...parsed, hash: item.txhash });
      }
    } catch {
      // ignore
    }
  }

  return results.slice(0, limit);
}

export async function sendTokens(
  stored: StoredWallet,
  toAddress: string,
  baseAmount: string,
): Promise<{ txHash: string }> {
  const wallet = await walletFromStored(stored);
  const client = await SigningStargateClient.connectWithSigner(config.rpcUrl, wallet);
  try {
    const result = await client.sendTokens(
      stored.address,
      toAddress,
      [{ denom: config.denom, amount: baseAmount }],
      {
        amount: [{ denom: config.denom, amount: "200000" }],
        gas: String(config.gasLimit),
      },
      `MRPH Global transfer`,
    );
    if (result.code !== 0) {
      throw new Error(result.rawLog || `tx failed with code ${result.code}`);
    }
    return { txHash: result.transactionHash };
  } finally {
    client.disconnect();
  }
}

export function estimateFeeBase(): bigint {
  return FEE_BASE;
}

export function explorerTxUrl(txHash: string): string {
  return `${EXPLORER_HOME.replace("/ping/mrphglobal", "")}/ping/mrphglobal/tx/${txHash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${EXPLORER_HOME.replace("/ping/mrphglobal", "")}/ping/mrphglobal/account/${address}`;
}

export function websiteUrl(): string {
  return WEBSITE_URL;
}

export function explorerHomeUrl(): string {
  return EXPLORER_HOME;
}
