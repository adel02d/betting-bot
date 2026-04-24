// ============================================
// 📦 DATABASE MODULE - SQLite with better-sqlite3
// ============================================

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "bot.db");
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT DEFAULT '',
    first_name TEXT DEFAULT '',
    balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    method TEXT NOT NULL,
    amount_cup REAL NOT NULL,
    credits REAL NOT NULL,
    screenshot_file_id TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    admin_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    method TEXT NOT NULL,
    amount_credits REAL NOT NULL,
    amount_cup REAL NOT NULL,
    phone TEXT DEFAULT '',
    account TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    admin_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    fixture_id INTEGER,
    home_team TEXT DEFAULT '',
    away_team TEXT DEFAULT '',
    league_name TEXT DEFAULT '',
    prediction TEXT NOT NULL,
    prediction_label TEXT DEFAULT '',
    odds REAL NOT NULL,
    stake REAL NOT NULL,
    potential_win REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    result TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    settled_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS user_states (
    user_id INTEGER PRIMARY KEY,
    action TEXT DEFAULT '',
    step TEXT DEFAULT '',
    data TEXT DEFAULT '{}',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ============ USER OPERATIONS ============

function ensureUser(userId, username, firstName) {
  const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
  if (!existing) {
    db.prepare("INSERT INTO users (id, username, first_name) VALUES (?, ?, ?)").run(
      userId, username || "", firstName || ""
    );
  } else {
    if (username || firstName) {
      db.prepare("UPDATE users SET username = ?, first_name = ? WHERE id = ?").run(
        username || "", firstName || "", userId
      );
    }
  }
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
}

function getUser(userId) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
}

function getUserBalance(userId) {
  const row = db.prepare("SELECT balance FROM users WHERE id = ?").get(userId);
  return row ? row.balance : 0;
}

function addBalance(userId, amount) {
  db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(amount, userId);
}

function subtractBalance(userId, amount) {
  const current = getUserBalance(userId);
  if (current < amount) return false;
  db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amount, userId);
  return true;
}

// ============ STATE OPERATIONS ============

function setUserState(userId, action, step, data) {
  db.prepare(`
    INSERT INTO user_states (user_id, action, step, data, updated_at) 
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET action = ?, step = ?, data = ?, updated_at = CURRENT_TIMESTAMP
  `).run(userId, action, step, JSON.stringify(data || {}), action, step, JSON.stringify(data || {}));
}

function getUserState(userId) {
  const row = db.prepare("SELECT action, step, data FROM user_states WHERE user_id = ?").get(userId);
  if (!row) return null;
  return { action: row.action, step: row.step, data: JSON.parse(row.data || "{}") };
}

function clearUserState(userId) {
  db.prepare("DELETE FROM user_states WHERE user_id = ?").run(userId);
}

// ============ DEPOSIT OPERATIONS ============

function createDeposit(userId, method, amountCup, credits, screenshotFileId, phone) {
  const result = db.prepare(
    "INSERT INTO deposits (user_id, method, amount_cup, credits, screenshot_file_id, phone) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(userId, method, amountCup, credits, screenshotFileId || "", phone || "");
  return Number(result.lastInsertRowid);
}

function getPendingDeposits() {
  return db.prepare(`
    SELECT d.*, u.username, u.first_name 
    FROM deposits d 
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.status = 'pending' 
    ORDER BY d.created_at DESC
  `).all();
}

function getDepositById(depositId) {
  return db.prepare(`
    SELECT d.*, u.username, u.first_name 
    FROM deposits d 
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.id = ?
  `).get(depositId);
}

function approveDeposit(depositId, adminId) {
  const deposit = db.prepare("SELECT * FROM deposits WHERE id = ?").get(depositId);
  if (!deposit || deposit.status !== "pending") return null;
  db.prepare("UPDATE deposits SET status = 'approved', admin_id = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(adminId, depositId);
  addBalance(deposit.user_id, deposit.credits);
  return deposit;
}

function rejectDeposit(depositId, adminId) {
  const deposit = db.prepare("SELECT * FROM deposits WHERE id = ?").get(depositId);
  if (!deposit || deposit.status !== "pending") return null;
  db.prepare("UPDATE deposits SET status = 'rejected', admin_id = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(adminId, depositId);
  return deposit;
}

// ============ WITHDRAWAL OPERATIONS ============

function createWithdrawal(userId, method, amountCredits, amountCup, phone, account) {
  if (!subtractBalance(userId, amountCredits)) return null;
  const result = db.prepare(
    "INSERT INTO withdrawals (user_id, method, amount_credits, amount_cup, phone, account) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(userId, method, amountCredits, amountCup, phone || "", account || "");
  return Number(result.lastInsertRowid);
}

function getPendingWithdrawals() {
  return db.prepare(`
    SELECT w.*, u.username, u.first_name 
    FROM withdrawals w 
    LEFT JOIN users u ON w.user_id = u.id
    WHERE w.status = 'pending' 
    ORDER BY w.created_at DESC
  `).all();
}

function getWithdrawalById(withdrawalId) {
  return db.prepare(`
    SELECT w.*, u.username, u.first_name 
    FROM withdrawals w 
    LEFT JOIN users u ON w.user_id = u.id
    WHERE w.id = ?
  `).get(withdrawalId);
}

function approveWithdrawal(withdrawalId, adminId) {
  const withdrawal = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(withdrawalId);
  if (!withdrawal || withdrawal.status !== "pending") return null;
  db.prepare("UPDATE withdrawals SET status = 'approved', admin_id = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(adminId, withdrawalId);
  return withdrawal;
}

function rejectWithdrawal(withdrawalId, adminId) {
  const withdrawal = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(withdrawalId);
  if (!withdrawal || withdrawal.status !== "pending") return null;
  db.prepare("UPDATE withdrawals SET status = 'rejected', admin_id = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(adminId, withdrawalId);
  addBalance(withdrawal.user_id, withdrawal.amount_credits);
  return withdrawal;
}

// ============ BET OPERATIONS ============

function createBet(userId, fixtureId, homeTeam, awayTeam, leagueName, prediction, predictionLabel, odds, stake) {
  if (!subtractBalance(userId, stake)) return null;
  const potentialWin = Math.round(stake * odds * 100) / 100;
  const result = db.prepare(
    "INSERT INTO bets (user_id, fixture_id, home_team, away_team, league_name, prediction, prediction_label, odds, stake, potential_win) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(userId, fixtureId, homeTeam, awayTeam, leagueName, prediction, predictionLabel, odds, stake, potentialWin);
  return { betId: Number(result.lastInsertRowid), potentialWin };
}

function getPendingBets() {
  return db.prepare(`
    SELECT b.*, u.username, u.first_name 
    FROM bets b 
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.status = 'pending' 
    ORDER BY b.created_at DESC
  `).all();
}

function getBetById(betId) {
  return db.prepare(`
    SELECT b.*, u.username, u.first_name 
    FROM bets b 
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `).get(betId);
}

function settleBet(betId, status, result) {
  const bet = db.prepare("SELECT * FROM bets WHERE id = ?").get(betId);
  if (!bet || bet.status !== "pending") return null;
  db.prepare("UPDATE bets SET status = ?, result = ?, settled_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, result, betId);
  if (status === "won") {
    addBalance(bet.user_id, bet.potential_win);
  } else if (status === "void") {
    addBalance(bet.user_id, bet.stake);
  }
  return bet;
}

function getUserBets(userId, limit) {
  limit = limit || 10;
  return db.prepare("SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC LIMIT ?").all(userId, limit);
}

// ============ STATS OPERATIONS ============

function getStats() {
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  const activeUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE balance > 0").get().count;
  const totalDeposits = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount_cup),0) as total_cup, COALESCE(SUM(credits),0) as total_credits FROM deposits WHERE status = 'approved'").get();
  const pendingDeposits = db.prepare("SELECT COUNT(*) as count FROM deposits WHERE status = 'pending'").get().count;
  const totalWithdrawals = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount_cup),0) as total_cup, COALESCE(SUM(amount_credits),0) as total_credits FROM withdrawals WHERE status = 'approved'").get();
  const pendingWithdrawals = db.prepare("SELECT COUNT(*) as count FROM withdrawals WHERE status = 'pending'").get().count;
  const totalBets = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(stake),0) as total_stake FROM bets").get();
  const pendingBets = db.prepare("SELECT COUNT(*) as count FROM bets WHERE status = 'pending'").get().count;
  const wonBets = db.prepare("SELECT COUNT(*) as count FROM bets WHERE status = 'won'").get().count;
  const lostBets = db.prepare("SELECT COUNT(*) as count FROM bets WHERE status = 'lost'").get().count;
  const totalBalance = db.prepare("SELECT COALESCE(SUM(balance),0) as total FROM users").get().total;

  return {
    totalUsers,
    activeUsers,
    totalDeposits,
    pendingDeposits,
    totalWithdrawals,
    pendingWithdrawals,
    totalBets,
    pendingBets,
    wonBets,
    lostBets,
    totalBalance,
  };
}

function getRecentUsers(limit) {
  limit = limit || 10;
  return db.prepare("SELECT * FROM users ORDER BY created_at DESC LIMIT ?").all(limit);
}

// ============ EXPORTS ============

module.exports = {
  ensureUser,
  getUser,
  getUserBalance,
  addBalance,
  subtractBalance,
  setUserState,
  getUserState,
  clearUserState,
  createDeposit,
  getPendingDeposits,
  getDepositById,
  approveDeposit,
  rejectDeposit,
  createWithdrawal,
  getPendingWithdrawals,
  getWithdrawalById,
  approveWithdrawal,
  rejectWithdrawal,
  createBet,
  getPendingBets,
  getBetById,
  settleBet,
  getUserBets,
  getStats,
  getRecentUsers,
};
