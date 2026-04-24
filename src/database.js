// ================================================
// 📦 Base de Datos - Bot de Apuestas v2.0
// ================================================
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Crear carpeta data si no existe
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "betting.db"));
db.pragma("journal_mode = WAL");

// ========== CREAR TABLAS ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    first_name TEXT,
    username TEXT,
    balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount_cup REAL,
    credits REAL,
    method TEXT,
    screenshot_file_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount_credits REAL,
    amount_cup REAL,
    method TEXT,
    destination TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    fixture_id INTEGER,
    home_team TEXT,
    away_team TEXT,
    pick TEXT,
    pick_name TEXT,
    odds REAL,
    amount REAL,
    potential_win REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    settled_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS user_states (
    user_id INTEGER PRIMARY KEY,
    state TEXT,
    data TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ========== USUARIOS ==========
function ensureUser(userId, firstName, username) {
  return db.prepare(
    "INSERT OR IGNORE INTO users (user_id, first_name, username) VALUES (?, ?, ?)"
  ).run(userId, firstName, username || null);
}

function getUserBalance(userId) {
  const row = db.prepare("SELECT balance FROM users WHERE user_id = ?").get(userId);
  return row ? row.balance : 0;
}

function addBalance(userId, amount) {
  return db.prepare("UPDATE users SET balance = balance + ? WHERE user_id = ?").run(amount, userId);
}

function subtractBalance(userId, amount) {
  return db.prepare("UPDATE users SET balance = balance - ? WHERE user_id = ?").run(amount, userId);
}

// ========== ESTADOS ==========
function setUserState(userId, state, data = {}) {
  return db.prepare(
    "INSERT OR REPLACE INTO user_states (user_id, state, data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
  ).run(userId, state, JSON.stringify(data));
}

function getUserState(userId) {
  const row = db.prepare("SELECT state, data FROM user_states WHERE user_id = ?").get(userId);
  if (!row) return null;
  return { state: row.state, data: row.data ? JSON.parse(row.data) : {} };
}

function clearUserState(userId) {
  return db.prepare("DELETE FROM user_states WHERE user_id = ?").run(userId);
}

// ========== DEPÓSITOS ==========
function createDeposit(userId,
