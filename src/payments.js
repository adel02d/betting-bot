import db from "./database.js";

const TRANSFER_PHONE = process.env.TRANSFER_PHONE || "53000000";
const TRANSFER_CUP_ACCOUNT = process.env.TRANSFER_CUP_ACCOUNT || "922400000000";
const MIN_DEPOSIT = parseInt(process.env.MIN_DEPOSIT || "200");

// Generar referencia única
function generateRef(telegramId) {
  const ts = Date.now().toString(36).toUpperCase();
  const uid = telegramId.toString(36).toUpperCase();
  return `${uid}${ts}`;
}

// Registrar usuario si no existe
export function ensureUser(telegramId, username = "", firstName = "") {
  let user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegramId);
  if (!user) {
    db.prepare(
      "INSERT INTO users (telegram_id, username, first_name) VALUES (?, ?, ?)"
    ).run(telegramId, username, firstName);
    user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegramId);
  }
  return user;
}

// Obtener balance
export function getBalance(telegramId) {
  const user = db.prepare("SELECT balance FROM users WHERE telegram_id = ?").get(telegramId);
  return user?.balance || 0;
}

// Crear depósito
export function createDeposit(telegramId, method, amountCup) {
  if (amountCup < MIN_DEPOSIT) {
    return { success: false, message: `❌ Depósito mínimo: ${MIN_DEPOSIT} CUP` };
  }

  const amountCredit = amountCup; // 1 CUP = 1 crédito
  const ref = generateRef(telegramId);

  db.prepare(
    "INSERT INTO deposits (telegram_id, method, amount_cup, amount_credit, status, ref) VALUES (?, ?, ?, ?, 'pending', ?)"
  ).run(telegramId, method, amountCup, amountCredit, ref);

  let instructions = "";
  if (method === "saldo_movil") {
    instructions =
      `📱 *DEPÓSITO POR SALDO MÓVIL*\n\n` +
      `1️⃣ Envía *${amountCup} CUP* al número:\n📱 *${TRANSFER_PHONE}*\n\n` +
      `2️⃣ Concepto: *${ref}*\n\n` +
      `3️⃣ Después de enviar, confirma con:\n/depositado ${ref}`;
  } else {
    instructions =
      `🏦 *DEPÓSITO POR TRANSFERENCIA*\n\n` +
      `1️⃣ Transfiere *${amountCup} CUP* a:\n💳 *${TRANSFER_CUP_ACCOUNT}*\n\n` +
      `2️⃣ Concepto: *${ref}*\n\n` +
      `3️⃣ Después de transferir, confirma con:\n/depositado ${ref}`;
  }

  return { success: true, message: instructions, ref };
}

// Confirmar depósito (usuario)
export function confirmDeposit(telegramId, ref) {
  const deposit = db
    .prepare("SELECT * FROM deposits WHERE ref = ? AND telegram_id = ? AND status = 'pending'")
    .get(ref, telegramId);

  if (!deposit) {
    return { success: false, message: "❌ Referencia no encontrada o ya procesada" };
  }

  return {
    success: true,
    message: `⏳ Depósito registrado. Ref: *${ref}*\n\nUn admin lo verificará pronto. Recibirás mensaje cuando se acredite.`,
    depositId: deposit.id,
  };
}

// Aprobar depósito (admin)
export function approveDeposit(depositId, adminId) {
  const deposit = db
    .prepare("SELECT * FROM deposits WHERE id = ? AND status = 'pending'")
    .get(depositId);

  if (!deposit) {
    return { success: false, message: "❌ Depósito no encontrado o ya procesado" };
  }

  db.prepare(
    "UPDATE deposits SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(adminId, depositId);

  db.prepare("UPDATE users SET balance = balance + ? WHERE telegram_id = ?")
    .run(deposit.amount_credit, deposit.telegram_id);

  const newBalance = getBalance(deposit.telegram_id);

  return {
    success: true,
    message: `✅ Depósito #${depositId} aprobado\n+${deposit.amount_credit} créditos`,
    telegramId: deposit.telegram_id,
    amount: deposit.amount_credit,
    newBalance,
  };
}

// Rechazar depósito (admin)
export function rejectDeposit(depositId, adminId) {
  const deposit = db
    .prepare("SELECT * FROM deposits WHERE id = ? AND status = 'pending'")
    .get(depositId);

  if (!deposit) {
    return { success: false, message: "❌ Depósito no encontrado o ya procesado" };
  }

  db.prepare(
    "UPDATE deposits SET status = 'rejected', approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(adminId, depositId);

  return {
    success: true,
    message: `❌ Depósito #${depositId} rechazado`,
    telegramId: deposit.telegram_id,
  };
}

// Crear retiro
export function createWithdrawal(telegramId, method, amountCredit, destination) {
  const user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegramId);

  if (!user) return { success: false, message: "❌ Usuario no registrado" };
  if (user.balance < amountCredit) {
    return { success: false, message: `❌ Saldo insuficiente.\nTu saldo: ${user.balance} créditos` };
  }
  if (amountCredit < MIN_DEPOSIT) {
    return { success: false, message: `❌ Retiro mínimo: ${MIN_DEPOSIT} créditos` };
  }

  const amountCup = amountCredit;

  db.prepare("UPDATE users SET balance = balance - ? WHERE telegram_id = ?")
    .run(amountCredit, telegramId);

  db.prepare(
    "INSERT INTO withdrawals (telegram_id, method, amount_credit, amount_cup, destination, status) VALUES (?, ?, ?, ?, ?, 'pending')"
  ).run(telegramId, method, amountCredit, amountCup, destination);

  return {
    success: true,
    message:
      `✅ Retiro solicitado:\n\n` +
      `💵 ${amountCredit} créditos (${amountCup} CUP)\n` +
      `📱 Método: ${method === "saldo_movil" ? "Saldo Móvil" : "Transferencia"}\n` +
      `📍 Destino: ${destination}\n\n` +
      `⏳ Se procesa en máximo 24 horas`,
  };
}

// Aprobar retiro (admin)
export function approveWithdrawal(withdrawalId, adminId) {
  const w = db
    .prepare("SELECT * FROM withdrawals WHERE id = ? AND status = 'pending'")
    .get(withdrawalId);

  if (!w) return { success: false, message: "❌ Retiro no encontrado o ya procesado" };

  db.prepare(
    "UPDATE withdrawals SET status = 'completed', processed_by = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(adminId, withdrawalId);

  return {
    success: true,
    message: `✅ Retiro #${withdrawalId} completado`,
    telegramId: w.telegram_id,
    amount: w.amount_cup,
    method: w.method,
    destination: w.destination,
  };
}
