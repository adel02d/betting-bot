import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "bot.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT DEFAULT '',
    first_name TEXT DEFAULT '',
    balance REAL DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    is_banned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER NOT NULL,
    method TEXT NOT NULL,
    amount_cup REAL NOT NULL,
    amount_credit REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    phone_number TEXT DEFAULT '',
    ref TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER NOT NULL,
    method TEXT NOT NULL,
    amount_credit REAL NOT NULL,
    amount_cup REAL NOT NULL,
    destination TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_by INTEGER DEFAULT NULL,
    processed_at DATETIME DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER NOT NULL,
    fixture_id INTEGER NOT NULL,
    league_name TEXT DEFAULT '',
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    bet_selection TEXT NOT NULL,
    odds REAL NOT NULL,
    amount REAL NOT NULL,
    potential_win REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    settled_at DATETIME DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    telegram_id INTEGER PRIMARY KEY,
    fixture_id INTEGER DEFAULT NULL,
    selection TEXT DEFAULT '',
    odds REAL DEFAULT 0
  );
`);

export default db;
