import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Lang } from "./i18n/locales.js";
import { DEFAULT_LANG } from "./i18n/locales.js";

export interface StoredWallet {
  address: string;
  encryptedMnemonic: string;
  createdAt: string;
}

export interface SendDraft {
  to: string;
  amount?: string;
}

export interface UserRecord {
  wallet?: StoredWallet;
  lang?: Lang;
  sendDraft?: SendDraft;
  awaiting?: "send_address" | "send_amount";
}

interface UserDb {
  users: Record<string, UserRecord>;
}

export class UserStorage {
  private readonly filePath: string;
  private cache: UserDb | null = null;

  constructor(dataDir: string) {
    this.filePath = path.join(dataDir, "users.json");
  }

  private async load(): Promise<UserDb> {
    if (this.cache) {
      return this.cache;
    }
    await mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      const raw = await readFile(this.filePath, "utf8");
      this.cache = JSON.parse(raw) as UserDb;
    } catch {
      this.cache = { users: {} };
    }
    return this.cache;
  }

  private async save(db: UserDb): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(db, null, 2), { mode: 0o600 });
    this.cache = db;
  }

  private async ensure(userId: string): Promise<UserRecord> {
    const db = await this.load();
    if (!db.users[userId]) {
      db.users[userId] = { lang: DEFAULT_LANG };
    }
    return db.users[userId];
  }

  async getWallet(userId: string): Promise<StoredWallet | null> {
    const db = await this.load();
    return db.users[userId]?.wallet ?? null;
  }

  async setWallet(userId: string, wallet: StoredWallet): Promise<void> {
    const db = await this.load();
    const rec = await this.ensure(userId);
    rec.wallet = wallet;
    db.users[userId] = rec;
    await this.save(db);
  }

  async getLang(userId: string): Promise<Lang> {
    const db = await this.load();
    return db.users[userId]?.lang ?? DEFAULT_LANG;
  }

  async setLang(userId: string, lang: Lang): Promise<void> {
    const db = await this.load();
    const rec = await this.ensure(userId);
    rec.lang = lang;
    db.users[userId] = rec;
    await this.save(db);
  }

  async getRecord(userId: string): Promise<UserRecord> {
    await this.ensure(userId);
    const db = await this.load();
    return db.users[userId]!;
  }

  async updateRecord(userId: string, patch: Partial<UserRecord>): Promise<UserRecord> {
    const db = await this.load();
    const rec = await this.ensure(userId);
    Object.assign(rec, patch);
    db.users[userId] = rec;
    await this.save(db);
    return rec;
  }

  async clearSendDraft(userId: string): Promise<void> {
    await this.updateRecord(userId, { sendDraft: undefined, awaiting: undefined });
  }
}

/** Migrate legacy wallets.json into users.json on first read */
export async function migrateLegacyWallets(
  storage: UserStorage,
  dataDir: string,
): Promise<void> {
  const legacyPath = path.join(dataDir, "wallets.json");
  try {
    const raw = await readFile(legacyPath, "utf8");
    const legacy = JSON.parse(raw) as { users: Record<string, StoredWallet> };
    for (const [userId, wallet] of Object.entries(legacy.users)) {
      const existing = await storage.getWallet(userId);
      if (!existing) {
        await storage.setWallet(userId, wallet);
      }
    }
  } catch {
    // no legacy file
  }
}
