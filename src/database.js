const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) { fs.mkdirSync(dataDir, { recursive: true }); }

const db = new Database(path.join(dataDir, "bot.db"));
db.pragma("journal_mode = WAL");

db.exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT DEFAULT '', first_name TEXT DEFAULT '', balance REAL DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);");
db.exec("CREATE TABLE IF NOT EXISTS deposits (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, method TEXT NOT NULL CHECK(method IN ('transferencia', 'saldo_movil')), amount_cup REAL NOT NULL, credits REAL NOT NULL, reference TEXT DEFAULT '', phone TEXT DEFAULT '', status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')), admin_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, resolved_at DATETIME);");
db.exec("CREATE TABLE IF NOT EXISTS withdrawals (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, method TEXT NOT NULL CHECK(method IN ('transferencia', 'saldo_movil')), amount_credits REAL NOT NULL, amount_cup REAL NOT NULL, destination TEXT DEFAULT '', status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')), admin_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, resolved_at DATETIME);");
db.exec("CREATE TABLE IF NOT EXISTS bets (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, fixture_id INTEGER NOT NULL, fixture_name TEXT NOT NULL, bet_type TEXT NOT NULL, bet_label TEXT NOT NULL, odds REAL NOT NULL, stake REAL NOT NULL, potential_win REAL NOT NULL, status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'won', 'lost', 'void')), result TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, settled_at DATETIME);");
db.exec("CREATE TABLE IF NOT EXISTS user_states (user_id INTEGER PRIMARY KEY, state TEXT NOT NULL, data TEXT DEFAULT '{}', updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);");

function ensureUser(userId, username, firstName) {
  const e = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
  if (!e) db.prepare("INSERT INTO users (id, username, first_name) VALUES (?, ?, ?)").run(userId, username || "", firstName || "");
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
}

function getUserBalance(userId) {
  const r = db.prepare("SELECT balance FROM users WHERE id = ?").get(userId);
  return r ? r.balance : 0;
}

function addBalance(userId, amount) {
  db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(amount, userId);
}

function subtractBalance(userId, amount) {
  if (getUserBalance(userId) < amount) return false;
  db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amount, userId);
  return true;
}

function setUserState(userId, state, data) {
  data = data || {};
  db.prepare("INSERT INTO user_states (user_id, state, data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET state = ?, data = ?, updated_at = CURRENT_TIMESTAMP").run(userId, state, JSON.stringify(data), state, JSON.stringify(data));
}

function getUserState(userId) {
  const r = db.prepare("SELECT state, data FROM user_states WHERE user_id = ?").get(userId);
  if (!r) return null;
  return { state: r.state, data: JSON.parse(r.data || "{}") };
}

function clearUserState(userId) {
  db.prepare("DELETE FROM user_states WHERE user_id = ?").run(userId);
}

function createDeposit(userId, method, amountCup, credits, reference, phone) {
  return Number(db.prepare("INSERT INTO deposits (user_id, method, amount_cup, credits, reference, phone) VALUES (?, ?, ?, ?, ?, ?)").run(userId, method, amountCup, credits, reference, phone).lastInsertRowid);
}

function getPendingDeposits() { return db.prepare("SELECT * FROM deposits WHERE status = 'pending' ORDER BY created_at DESC").all(); }

function approveDeposit(depositId, adminId) {
  const d = db.prepare("SELECT * FROM deposits WHERE id = ?").get(depositId);
  if (!d || d.status !== "pending") return null;
  db.prepare("UPDATE deposits SET status = 'approved', admin_id = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(adminId, depositId);
  addBalance(d.user_id, d.credits);
  return d;
}

function rejectDeposit(depositId, adminId) {
  const d = db.prepare("SELECT * FROM deposits WHERE id = ?").get(depositId);
  if (!d || d.status !== "pending") return null;
  db.prepare("UPDATE deposits SET status = 'rejected', admin_id = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(adminId, depositId);
  return d;
}

function createWithdrawal(userId, method, amountCredits, amountCup, destination) {
  if (!subtractBalance(userId, amountCredits)) return null;
  return Number(db.prepare("INSERT INTO withdrawals (user_id, method, amount_credits, amount_cup, destination) VALUES (?, ?, ?, ?, ?)").run(userId, method, amountCredits, amountCup, destination).lastInsertRowid);
}

function getPendingWithdrawals() { return db.prepare("SELECT * FROM withdrawals WHERE status = 'pending' ORDER BY created_at DESC").all(); }

function approveWithdrawal(withdrawalId, adminId) {
  const w = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(withdrawalId);
  if (!w || w.status !== "pending") return null;
  db.prepare("UPDATE withdrawals SET status = 'approved', admin_id = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(adminId, withdrawalId);
  return w;
}

function rejectWithdrawal(withdrawalId, adminId) {
  const w = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(withdrawalId);
  if (!w || w.status !== "pending") return null;
  db.prepare("UPDATE withdrawals SET status = 'rejected', admin_id = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(adminId, withdrawalId);
  addBalance(w.user_id, w.amount_credits);
  return w;
}

function createBet(userId, fixtureId, fixtureName, betType, betLabel, odds, stake) {
  if (!subtractBalance(userId, stake)) return null;
  const pw = Math.round(stake * odds * 100) / 100;
  const betId = Number(db.prepare("INSERT INTO bets (user_id, fixture_id, fixture_name, bet_type, bet_label, odds, stake, potential_win) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(userId, fixtureId, fixtureName, betType, betLabel, odds, stake, pw).lastInsertRowid);
  return { betId: betId, potentialWin: pw };
}

function getPendingBets() { return db.prepare("SELECT * FROM bets WHERE status = 'pending' ORDER BY created_at DESC").all(); }

function settleBet(betId, status, result) {
  const b = db.prepare("SELECT * FROM bets WHERE id = ?").get(betId);
  if (!b || b.status !== "pending") return null;
  db.prepare("UPDATE bets SET status = ?, result = ?, settled_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, result, betId);
  if (status === "won") addBalance(b.user_id, b.potential_win);
  else if (status === "void") addBalance(b.user_id, b.stake);
  return b;
}

function getUserBets(userId, limit) { return db.prepare("SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC LIMIT ?").all(userId, limit || 10); }

function getBetById(betId) { return db.prepare("SELECT * FROM bets WHERE id = ?").get(betId); }

module.exports = {
  ensureUser, getUserBalance, addBalance, subtractBalance,
  setUserState, getUserState, clearUserState,
  createDeposit, getPendingDeposits, approveDeposit, rejectDeposit,
  createWithdrawal, getPendingWithdrawals, approveWithdrawal, rejectWithdrawal,
  createBet, getPendingBets, settleBet, getUserBets, getBetById
};
