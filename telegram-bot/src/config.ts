import "dotenv/config";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function parseDecimals(raw: string | undefined, fallback: number): number {
  const n = Number(raw ?? fallback);
  if (!Number.isInteger(n) || n < 0 || n > 18) {
    throw new Error(`Invalid DENOM_DECIMALS: ${raw}`);
  }
  return n;
}

export const config = {
  token: required("TELEGRAM_BOT_TOKEN"),
  encryptionKey: required("BOT_ENCRYPTION_KEY"),
  chainId: process.env.CHAIN_ID ?? "mrphglobal-1",
  addrPrefix: process.env.ADDR_PREFIX ?? "mrph",
  denom: process.env.DENOM ?? "umrph",
  displayDenom: process.env.DISPLAY_DENOM ?? "MRPH",
  denomDecimals: parseDecimals(process.env.DENOM_DECIMALS, 6),
  lcdUrl: process.env.LCD_URL ?? "http://127.0.0.1:1317",
  rpcUrl: process.env.RPC_URL ?? "http://127.0.0.1:26657",
  gasPrice: process.env.GAS_PRICE ?? "0.2umrph",
  gasLimit: Number(process.env.GAS_LIMIT ?? "200000"),
  dataDir: process.env.DATA_DIR ?? "/opt/mrph-telegram-bot/data",
};
