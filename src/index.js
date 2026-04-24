const { Bot, InlineKeyboard } = require("grammy");
const express = require("express");
const { setApiKey, getTodayFixtures, getFixtureOdds, formatFixture } = require("./sports");
const {
  ensureUser, getUserBalance, addBalance,
  setUserState, getUserState, clearUserState,
  createDeposit, updateDepositPhoto, getPendingDeposits, getDepositById, approveDeposit, rejectDeposit,
  createWithdrawal, getPendingWithdrawals, approveWithdrawal, rejectWithdrawal,
  createBet, settleBet, getUserBets, getPendingBets,
} = require("./database");

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const RENDER_URL = process.env.RENDER_URL || "";
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || "";
const ADMIN_IDS = (process.env.ADMIN_IDS || "").split(",").map(Number).filter(Boolean);
const TRANSFER_PHONE = process.env.TRANSFER_PHONE || "";
const TRANSFER_CUP_ACCOUNT = process.env.TRANSFER_CUP_ACCOUNT || "";
const MIN_DEPOSIT_CUP = Number(process.env.MIN_DEPOSIT_CUP) || 100;
const MIN_DEPOSIT_SALDO = Number(process.env.MIN_DEPOSIT_SALDO) || 50;
const CUP_TO_CREDIT = Number(process.env.CUP_TO_CREDIT) || 0.004;
const PORT = Number(process.env.PORT) || 3000;

if (!BOT_TOKEN) { console.error("ERROR: BOT_TOKEN required!"); process.exit(1); }
setApiKey(API_FOOTBALL_KEY);

const bot = new Bot(BOT_TOKEN);

function isAdmin(userId) { return ADMIN_IDS.includes(userId); }
function fmtBal(credits) { return credits.toFixed(2) + " créditos"; }
function cupToCredits(cup) { return Math.round(cup * CUP_TO_CREDIT * 100) / 100; }
function creditsToCup(credits) { return Math.round(credits / CUP_TO_CREDIT * 100) / 100; }

function mainMenu() {
  return new InlineKeyboard()
    .text("⚽ Apostar", "bet_menu").text("💰 Saldo", "balance").row()
    .text("📥 Depositar", "deposit_menu").text("📤 Retirar", "withdraw_menu").row()
    .text("📊 Mis Apuestas", "history").text("❓ Ayuda", "help");
}

function adminMenu() {
  return new InlineKeyboard()
    .text("📥 Depósitos", "admin_deposits").text("📤 Retiros", "admin_withdrawals").row()
    .text("⏳ Apuestas", "admin_bets").text("👤 Añadir Saldo", "admin_addsaldo").row()
    .text("🏠 Menú Usuario", "back_menu");
}

// ============ /START ============
bot.command("start", async (ctx) => {
  ensureUser(ctx.from.id, ctx.from.username, ctx.from.first_name);
  const kb = mainMenu();
  if (isAdmin(ctx.from.id)) { kb.row().text("🔧 Admin", "admin_menu"); }
  await ctx.reply(
    "¡Hola " + ctx.from.first_name + "! 👋\n\nBot de Apuestas Deportivas ⚽🎰\n\n💰 Tu saldo: " + fmtBal(getUserBalance(ctx.from.id)),
    { reply_markup: kb }
  );
});

// ============ ADMIN MENU ============
bot.callbackQuery("admin_menu", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  await ctx.answerCallbackQuery();
  const deps = getPendingDeposits();
  const wds = getPendingWithdrawals();
  const bets = getPendingBets();
  await ctx.editMessageText(
    "🔧 *PANEL DE ADMIN*\n\n📥 Depósitos pendientes: " + deps.length + "\n📤 Retiros pendientes: " + wds.length + "\n⏳ Apuestas pendientes: " + bets.length + "\n\nSelecciona una opción:",
    { parse_mode: "Markdown", reply_markup: adminMenu() }
  );
});

// ============ ADMIN: DEPÓSITOS ============
bot.callbackQuery("admin_deposits", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  await ctx.answerCallbackQuery();
  const deps = getPendingDeposits();
  if (!deps.length) {
    await ctx.editMessageText("📥 *DEPÓSITOS PENDIENTES*\n\n✅ No hay depósitos pendientes.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Admin", "admin_menu") });
    return;
  }
  let msg = "📥 *DEPÓSITOS PENDIENTES*\n\n";
  const kb = new InlineKeyboard();
  for (const d of deps) {
    const method = d.method === "transferencia" ? "🏦" : "📱";
    const hasPhoto = d.photo_file_id ? "📸 SÍ" : "⚠️ SIN FOTO";
    msg += method + " #" + d.id + " | " + d.amount_cup + " CUP → " + fmtBal(d.credits) + " | " + hasPhoto + "\n";
    msg += "   👤 User: " + d.user_id;
    if (d.phone) msg += " | 📱 " + d.phone;
    if (d.reference) msg += "\n   📝 Ref: " + d.reference;
    msg += "\n\n";
    kb.text("📸 Ver #" + d.id, "adep_photo_" + d.id).row();
    kb.text("✅ Aprobar #" + d.id, "adep_" + d.id + "_ok").text("❌ Rechazar #" + d.id, "adep_" + d.id + "_no").row();
  }
  kb.text("🔙 Admin", "admin_menu");
  await ctx.editMessageText(msg, { parse_mode: "Markdown", reply_markup: kb });
});

// Ver foto del depósito
bot.callbackQuery(/^adep_photo_(\d+)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  await ctx.answerCallbackQuery();
  const id = Number(ctx.match[1]);
  const dep = getDepositById(id);
  if (!dep) { await ctx.reply("❌ Depósito no encontrado"); return; }
  if (!dep.photo_file_id) {
    await ctx.reply("⚠️ El usuario #" + id + " no envió captura de pantalla.", { reply_markup: new InlineKeyboard().text("✅ Aprobar", "adep_" + id + "_ok").text("❌ Rechazar", "adep_" + id + "_no") });
    return;
  }
  await bot.api.sendPhoto(ctx.from.id, dep.photo_file_id, {
    caption: "📸 *Comprobante del depósito #" + id + "*\n\n💵 " + dep.amount_cup + " CUP → " + fmtBal(dep.credits) + "\n👤 User: " + dep.user_id + "\n📝 " + (dep.reference || "Sin ref"),
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard().text("✅ Aprobar", "adep_" + id + "_ok").text("❌ Rechazar", "adep_" + id + "_no")
  });
});

// Aprobar depósito
bot.callbackQuery(/^adep_(\d+)_ok$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  const id = Number(ctx.match[1]);
  const dep = approveDeposit(id, ctx.from.id);
  if (!dep) { await ctx.answerCallbackQuery("❌ Ya procesado"); return; }
  await ctx.answerCallbackQuery("✅ Depósito #" + id + " aprobado");
  try { await bot.api.sendMessage(dep.user_id, "✅ *Depósito aprobado*\n📋 #" + id + "\n🪙 +" + fmtBal(dep.credits) + "\n💰 Saldo: " + fmtBal(getUserBalance(dep.user_id)), { parse_mode: "Markdown" }); } catch {}
  ctx.callbackQuery.data = "admin_deposits";
  const deps = getPendingDeposits();
  if (!deps.length) {
    try { await ctx.editMessageText("📥 *DEPÓSITOS*\n\n✅ Todos procesados.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Admin", "admin_menu") }); } catch {}
  } else {
    let msg = "📥 *DEPÓSITOS PENDIENTES*\n\n";
    const kb = new InlineKeyboard();
    for (const d of deps) {
      const method = d.method === "transferencia" ? "🏦" : "📱";
      const hasPhoto = d.photo_file_id ? "📸" : "⚠️";
      msg += method + " #" + d.id + " | " + d.amount_cup + " CUP → " + fmtBal(d.credits) + " | " + hasPhoto + "\n👤 User: " + d.user_id + "\n\n";
      kb.text("📸 Ver #" + d.id, "adep_photo_" + d.id).row();
      kb.text("✅ #" + d.id, "adep_" + d.id + "_ok").text("❌ #" + d.id, "adep_" + d.id + "_no").row();
    }
    kb.text("🔙 Admin", "admin_menu");
    try { await ctx.editMessageText(msg, { parse_mode: "Markdown", reply_markup: kb }); } catch {}
  }
});

// Rechazar depósito
bot.callbackQuery(/^adep_(\d+)_no$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  const id = Number(ctx.match[1]);
  const dep = rejectDeposit(id, ctx.from.id);
  if (!dep) { await ctx.answerCallbackQuery("❌ Ya procesado"); return; }
  await ctx.answerCallbackQuery("❌ Depósito #" + id + " rechazado");
  try { await bot.api.sendMessage(dep.user_id, "❌ *Depósito rechazado*\n📋 #" + id + "\nContacta al admin si es un error.", { parse_mode: "Markdown" }); } catch {}
  const deps = getPendingDeposits();
  if (!deps.length) {
    try { await ctx.editMessageText("📥 *DEPÓSITOS*\n\n✅ Todos procesados.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Admin", "admin_menu") }); } catch {}
  } else {
    let msg = "📥 *DEPÓSITOS PENDIENTES*\n\n";
    const kb = new InlineKeyboard();
    for (const d of deps) {
      const method = d.method === "transferencia" ? "🏦" : "📱";
      const hasPhoto = d.photo_file_id ? "📸" : "⚠️";
      msg += method + " #" + d.id + " | " + d.amount_cup + " CUP → " + fmtBal(d.credits) + " | " + hasPhoto + "\n👤 User: " + d.user_id + "\n\n";
      kb.text("📸 Ver #" + d.id, "adep_photo_" + d.id).row();
      kb.text("✅ #" + d.id, "adep_" + d.id + "_ok").text("❌ #" + d.id, "adep_" + d.id + "_no").row();
    }
    kb.text("🔙 Admin", "admin_menu");
    try { await ctx.editMessageText(msg, { parse_mode: "Markdown", reply_markup: kb }); } catch {}
  }
});

// ============ ADMIN: RETIROS ============
bot.callbackQuery("admin_withdrawals", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  await ctx.answerCallbackQuery();
  const wds = getPendingWithdrawals();
  if (!wds.length) {
    await ctx.editMessageText("📤 *RETIROS PENDIENTES*\n\n✅ No hay retiros pendientes.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Admin", "admin_menu") });
    return;
  }
  let msg = "📤 *RETIROS PENDIENTES*\n\n";
  const kb = new InlineKeyboard();
  for (const w of wds) {
    const method = w.method === "transferencia" ? "🏦" : "📱";
    msg += method + " #" + w.id + " | " + fmtBal(w.amount_credits) + " → " + w.amount_cup + " CUP\n";
    msg += "   👤 User: " + w.user_id + " | 📱 → " + w.destination + "\n\n";
    kb.text("✅ #" + w.id, "aret_" + w.id + "_ok").text("❌ #" + w.id, "aret_" + w.id + "_no").row();
  }
  kb.text("🔙 Admin", "admin_menu");
  await ctx.editMessageText(msg, { parse_mode: "Markdown", reply_markup: kb });
});

bot.callbackQuery(/^aret_(\d+)_ok$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  const id = Number(ctx.match[1]);
  const wd = approveWithdrawal(id, ctx.from.id);
  if (!wd) { await ctx.answerCallbackQuery("❌ Ya procesado"); return; }
  await ctx.answerCallbackQuery("✅ Retiro #" + id + " aprobado");
  try { await bot.api.sendMessage(wd.user_id, "✅ *Retiro aprobado*\n📋 #" + id + "\n💵 " + wd.amount_cup + " CUP → " + wd.destination, { parse_mode: "Markdown" }); } catch {}
  const wds = getPendingWithdrawals();
  if (!wds.length) {
    try { await ctx.editMessageText("📤 *RETIROS*\n\n✅ Todos procesados.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Admin", "admin_menu") }); } catch {}
  } else {
    let msg = "📤 *RETIROS PENDIENTES*\n\n";
    const kb = new InlineKeyboard();
    for (const w of wds) {
      msg += (w.method === "transferencia" ? "🏦" : "📱") + " #" + w.id + " | " + fmtBal(w.amount_credits) + " → " + w.amount_cup + " CUP → " + w.destination + "\n\n";
      kb.text("✅ #" + w.id, "aret_" + w.id + "_ok").text("❌ #" + w.id, "aret_" + w.id + "_no").row();
    }
    kb.text("🔙 Admin", "admin_menu");
    try { await ctx.editMessageText(msg, { parse_mode: "Markdown", reply_markup: kb }); } catch {}
  }
});

bot.callbackQuery(/^aret_(\d+)_no$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  const id = Number(ctx.match[1]);
  const wd = rejectWithdrawal(id, ctx.from.id);
  if (!wd) { await ctx.answerCallbackQuery("❌ Ya procesado"); return; }
  await ctx.answerCallbackQuery("❌ Retiro #" + id + " rechazado");
  try { await bot.api.sendMessage(wd.user_id, "❌ *Retiro rechazado*\n📋 #" + id + "\n🪙 " + fmtBal(wd.amount_credits) + " devueltos\n💰 Saldo: " + fmtBal(getUserBalance(wd.user_id)), { parse_mode: "Markdown" }); } catch {}
  const wds = getPendingWithdrawals();
  if (!wds.length) {
    try { await ctx.editMessageText("📤 *RETIROS*\n\n✅ Todos procesados.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Admin", "admin_menu") }); } catch {}
  } else {
    let msg = "📤 *RETIROS PENDIENTES*\n\n";
    const kb = new InlineKeyboard();
    for (const w of wds) {
      msg += (w.method === "transferencia" ? "🏦" : "📱") + " #" + w.id + " | " + fmtBal(w.amount_credits) + " → " + w.amount_cup + " CUP → " + w.destination + "\n\n";
      kb.text("✅ #" + w.id, "aret_" + w.id + "_ok").text("❌ #" + w.id, "aret_" + w.id + "_no").row();
    }
    kb.text("🔙 Admin", "admin_menu");
    try { await ctx.editMessageText(msg, { parse_mode: "Markdown", reply_markup: kb }); } catch {}
  }
});

// ============ ADMIN: APUESTAS ============
bot.callbackQuery("admin_bets", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  await ctx.answerCallbackQuery();
  const bets = getPendingBets();
  if (!bets.length) {
    await ctx.editMessageText("⏳ *APUESTAS PENDIENTES*\n\n✅ No hay apuestas pendientes.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Admin", "admin_menu") });
    return;
  }
  let msg = "⏳ *APUESTAS PENDIENTES*\n\n";
  const kb = new InlineKeyboard();
  for (const b of bets) {
    msg += "📋 #" + b.id + " | " + b.fixture_name + "\n   " + b.bet_label + " @ " + b.odds + " | " + fmtBal(b.stake) + " → " + fmtBal(b.potential_win) + "\n   👤 User: " + b.user_id + "\n\n";
    kb.text("✅ #" + b.id, "abet_" + b.id + "_won").text("❌ #" + b.id, "abet_" + b.id + "_lost").row();
  }
  kb.text("🔙 Admin", "admin_menu");
  await ctx.editMessageText(msg, { parse_mode: "Markdown", reply_markup: kb });
});

bot.callbackQuery(/^abet_(\d+)_won$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  const id = Number(ctx.match[1]);
  const bet = settleBet(id, "won", "Admin: ganada");
  if (!bet) { await ctx.answerCallbackQuery("❌ Ya resuelta"); return; }
  await ctx.answerCallbackQuery("✅ #" + id + " → GANADA");
  try { await bot.api.sendMessage(bet.user_id, "🎉 *¡GANASTE!*\n📋 #" + id + "\n🏆 +" + fmtBal(bet.potential_win) + "\n💰 Saldo: " + fmtBal(getUserBalance(bet.user_id)), { parse_mode: "Markdown" }); } catch {}
  const bets = getPendingBets();
  if (!bets.length) {
    try { await ctx.editMessageText("⏳ *APUESTAS*\n\n✅ Todas resueltas.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Admin", "admin_menu") }); } catch {}
  } else {
    let msg = "⏳ *APUESTAS PENDIENTES*\n\n";
    const kb2 = new InlineKeyboard();
    for (const b of bets) {
      msg += "📋 #" + b.id + " | " + b.fixture_name + "\n   " + b.bet_label + " @ " + b.odds + " | " + fmtBal(b.stake) + " → " + fmtBal(b.potential_win) + "\n\n";
      kb2.text("✅ #" + b.id, "abet_" + b.id + "_won").text("❌ #" + b.id, "abet_" + b.id + "_lost").row();
    }
    kb2.text("🔙 Admin", "admin_menu");
    try { await ctx.editMessageText(msg, { parse_mode: "Markdown", reply_markup: kb2 }); } catch {}
  }
});

bot.callbackQuery(/^abet_(\d+)_lost$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  const id = Number(ctx.match[1]);
  const bet = settleBet(id, "lost", "Admin: perdida");
  if (!bet) { await ctx.answerCallbackQuery("❌ Ya resuelta"); return; }
  await ctx.answerCallbackQuery("❌ #" + id + " → PERDIDA");
  try { await bot.api.sendMessage(bet.user_id, "😞 *Perdiste*\n📋 #" + id + "\n🪙 -" + fmtBal(bet.stake), { parse_mode: "Markdown" }); } catch {}
  const bets = getPendingBets();
  if (!bets.length) {
    try { await ctx.editMessageText("⏳ *APUESTAS*\n\n✅ Todas resueltas.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Admin", "admin_menu") }); } catch {}
  } else {
    let msg = "⏳ *APUESTAS PENDIENTES*\n\n";
    const kb2 = new InlineKeyboard();
    for (const b of bets) {
      msg += "📋 #" + b.id + " | " + b.fixture_name + "\n   " + b.bet_label + " @ " + b.odds + " | " + fmtBal(b.stake) + " → " + fmtBal(b.potential_win) + "\n\n";
      kb2.text("✅ #" + b.id, "abet_" + b.id + "_won").text("❌ #" + b.id, "abet_" + b.id + "_lost").row();
    }
    kb2.text("🔙 Admin", "admin_menu");
    try { await ctx.editMessageText(msg, { parse_mode: "Markdown", reply_markup: kb2 }); } catch {}
  }
});

// ============ ADMIN: AÑADIR SALDO ============
bot.callbackQuery("admin_addsaldo", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.answerCallbackQuery("❌ No eres admin"); return; }
  await ctx.answerCallbackQuery();
  setUserState(ctx.from.id, "admin_addsaldo");
  await ctx.editMessageText("👤 *AÑADIR SALDO*\n\nEscribe:\n`USER_ID CANTIDAD`\n\nEjemplo: `123456789 5`", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("❌ Cancelar", "admin_menu") });
});

// ============ DEPOSIT FLOW ============
bot.callbackQuery("deposit_menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "📥 *DEPOSITAR SALDO*\n\n🏦 Transferencia: mín " + MIN_DEPOSIT_CUP + " CUP\n📱 Saldo Móvil: mín " + MIN_DEPOSIT_SALDO + " CUP\n\n💰 Tu saldo: " + fmtBal(getUserBalance(ctx.from.id)),
    { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🏦 Transferencia", "dep_transfer").row().text("📱 Saldo Móvil", "dep_saldo").row().text("🔙 Menú", "back_menu") }
  );
});

bot.callbackQuery("dep_transfer", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "📥 *DEPÓSITO POR TRANSFERENCIA*\n\nUsa:\n`/depositar_transfer MONTO`\n\nEj: `/depositar_transfer 500`\n\nMínimo: " + MIN_DEPOSIT_CUP + " CUP\n\n📱 Teléfono: " + TRANSFER_PHONE + "\n🏦 Cuenta: " + TRANSFER_CUP_ACCOUNT + "\n\n⚠️ *IMPORTANTE:* Después de transferir, envía /depositado ID y luego una *captura de pantalla* como comprobante.",
    { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Atrás", "deposit_menu") }
  );
});

bot.callbackQuery("dep_saldo", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "📥 *DEPÓSITO POR SALDO MÓVIL*\n\nUsa:\n`/depositar_saldo MONTO TELÉFONO`\n\nEj: `/depositar_saldo 100 55551234`\n\nMínimo: " + MIN_DEPOSIT_SALDO + " CUP\n\nEnviar saldo a: " + TRANSFER_PHONE + "\n\n⚠️ *IMPORTANTE:* Después de enviar, usa /depositado ID y luego envía una *captura de pantalla* como comprobante.",
    { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Atrás", "deposit_menu") }
  );
});

bot.command("depositar_transfer", async (ctx) => {
  const amountCup = Number(ctx.match.trim());
  if (!amountCup || amountCup < MIN_DEPOSIT_CUP) { await ctx.reply("❌ Mínimo " + MIN_DEPOSIT_CUP + " CUP"); return; }
  const credits = cupToCredits(amountCup);
  const ref = "TXF-" + Date.now() + "-" + ctx.from.id;
  const id = createDeposit(ctx.from.id, "transferencia", amountCup, credits, ref, "");
  await ctx.reply(
    "✅ *Solicitud creada*\n\n📋 ID: #" + id + "\n💵 " + amountCup + " CUP → " + fmtBal(credits) + "\n📝 Ref: " + ref + "\n\nTransfiere a:\n📱 " + TRANSFER_PHONE + "\n🏦 " + TRANSFER_CUP_ACCOUNT + "\n\n1️⃣ Haz la transferencia en Transfermovil\n2️⃣ Envía /depositado " + id + "\n3️⃣ Envía una 📸 *captura de pantalla* del comprobante",
    { parse_mode: "Markdown" }
  );
});

bot.command("depositar_saldo", async (ctx) => {
  const args = ctx.match.trim().split(/\s+/);
  if (!args || args.length < 2) { await ctx.reply("❌ Usa: /depositar_saldo MONTO TELÉFONO"); return; }
  const amountCup = Number(args[0]), phone = args[1];
  if (!amountCup || amountCup < MIN_DEPOSIT_SALDO) { await ctx.reply("❌ Mínimo " + MIN_DEPOSIT_SALDO + " CUP"); return; }
  const credits = cupToCredits(amountCup);
  const ref = "SM-" + Date.now() + "-" + ctx.from.id;
  const id = createDeposit(ctx.from.id, "saldo_movil", amountCup, credits, ref, phone);
  await ctx.reply(
    "✅ *Solicitud creada*\n\n📋 ID: #" + id + "\n💵 " + amountCup + " CUP → " + fmtBal(credits) + "\n📱 Desde: " + phone + "\n\nEnvía saldo a: " + TRANSFER_PHONE + "\n\n1️⃣ Envía el saldo desde tu teléfono\n2️⃣ Envía /depositado " + id + "\n3️⃣ Envía una 📸 *captura de pantalla* del comprobante",
    { parse_mode: "Markdown" }
  );
});

// ============ /DEPOSITADO - Notificar y pedir foto ============
bot.command("depositado", async (ctx) => {
  const depId = ctx.match.trim();
  if (!depId) { await ctx.reply("❌ Usa: /depositado ID\nEjemplo: /depositado 1"); return; }
  const dep = getDepositById(Number(depId));
  if (!dep) { await ctx.reply("❌ Depósito #" + depId + " no encontrado"); return; }
  if (dep.user_id !== ctx.from.id) { await ctx.reply("❌ Este depósito no es tuyo"); return; }
  if (dep.status !== "pending") { await ctx.reply("❌ Este depósito ya fue " + (dep.status === "approved" ? "aprobado" : "rechazado")); return; }

  setUserState(ctx.from.id, "waiting_proof", { depositId: Number(depId) });
  await ctx.reply(
    "📋 *Depósito #" + depId + " notificado*\n\n📸 Ahora envía una *captura de pantalla* del comprobante de pago.\n\n⚠️ Sin captura, el admin NO aprobará tu depósito.",
    { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("❌ Cancelar", "cancel_proof") }
  );
});

bot.callbackQuery("cancel_proof", async (ctx) => {
  await ctx.answerCallbackQuery();
  clearUserState(ctx.from.id);
  await ctx.editMessageText("❌ Notificación cancelada. Tu depósito sigue pendiente pero sin comprobante.", { reply_markup: mainMenu() });
});

// ============ RECIBIR FOTO (comprobante) ============
bot.on("message:photo", async (ctx) => {
  const state = getUserState(ctx.from.id);
  if (!state) return;

  // Usuario enviando comprobante de depósito
  if (state.state === "waiting_proof") {
    const depId = state.data.depositId;
    const photoFileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;

    updateDepositPhoto(depId, photoFileId);
    clearUserState(ctx.from.id);

    const dep = getDepositById(depId);
    await ctx.reply(
      "✅ *¡Comprobante enviado!*\n\n📋 Depósito #" + depId + "\n📸 Captura recibida\n\n⏳ El admin revisará tu depósito y lo aprobará pronto.",
      { parse_mode: "Markdown", reply_markup: mainMenu() }
    );

    // Enviar foto al admin con info
    for (const aid of ADMIN_IDS) {
      try {
        await bot.api.sendPhoto(aid, photoFileId, {
          caption: "📥 *Comprobante de depósito #" + depId + "*\n\n" +
            "💵 " + dep.amount_cup + " CUP → " + fmtBal(dep.credits) + "\n" +
            "👤 " + (ctx.from.username || ctx.from.first_name) + " (ID: " + ctx.from.id + ")\n" +
            "📱 " + (dep.phone || "N/A") + "\n" +
            "📝 " + (dep.reference || "N/A"),
          parse_mode: "Markdown",
          reply_markup: new InlineKeyboard()
            .text("✅ Aprobar", "adep_" + depId + "_ok")
            .text("❌ Rechazar", "adep_" + depId + "_no")
        });
      } catch {}
    }
    return;
  }
});

// ============ WITHDRAW FLOW ============
bot.callbackQuery("withdraw_menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  const bal = getUserBalance(ctx.from.id);
  if (bal <= 0) { await ctx.editMessageText("📤 *RETIRAR*\n\n❌ Sin saldo suficiente.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Menú", "back_menu") }); return; }
  await ctx.editMessageText(
    "📤 *RETIRAR SALDO*\n\n💰 Saldo: " + fmtBal(bal) + " (= " + creditsToCup(bal) + " CUP)",
    { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🏦 Transferencia", "wd_transfer").row().text("📱 Saldo Móvil", "wd_saldo").row().text("🔙 Menú", "back_menu") }
  );
});

bot.callbackQuery("wd_transfer", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("📤 *RETIRO POR TRANSFERENCIA*\n\n`/retirar_transfer CRÉDITOS TELÉFONO`\n\nEj: `/retirar_transfer 2 55551234`", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Atrás", "withdraw_menu") });
});

bot.callbackQuery("wd_saldo", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("📤 *RETIRO POR SALDO MÓVIL*\n\n`/retirar_saldo CRÉDITOS TELÉFONO`\n\nEj: `/retirar_saldo 1 55551234`", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Atrás", "withdraw_menu") });
});

bot.command("retirar_transfer", async (ctx) => {
  const args = ctx.match.trim().split(/\s+/);
  if (!args || args.length < 2) { await ctx.reply("❌ Usa: /retirar_transfer CRÉDITOS TELÉFONO"); return; }
  const credits = Number(args[0]), phone = args[1], bal = getUserBalance(ctx.from.id);
  if (!credits || credits <= 0) { await ctx.reply("❌ Cantidad inválida"); return; }
  if (credits > bal) { await ctx.reply("❌ Saldo insuficiente: " + fmtBal(bal)); return; }
  const cup = creditsToCup(credits);
  const id = createWithdrawal(ctx.from.id, "transferencia", credits, cup, phone);
  if (!id) { await ctx.reply("❌ Error"); return; }
  await ctx.reply("✅ *Retiro creado*\n\n📋 #" + id + "\n🪙 " + fmtBal(credits) + " → " + cup + " CUP\n📱 → " + phone + "\n\n⏳ Admin lo procesará.", { parse_mode: "Markdown" });
  for (const aid of ADMIN_IDS) { try { await bot.api.sendMessage(aid, "📤 *Nuevo retiro*\n👤 " + (ctx.from.username || ctx.from.first_name) + " (ID: " + ctx.from.id + ")\n📋 #" + id + " | " + fmtBal(credits) + " → " + cup + " CUP → " + phone, { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔧 Ver Retiros", "admin_withdrawals") }); } catch {} }
});

bot.command("retirar_saldo", async (ctx) => {
  const args = ctx.match.trim().split(/\s+/);
  if (!args || args.length < 2) { await ctx.reply("❌ Usa: /retirar_saldo CRÉDITOS TELÉFONO"); return; }
  const credits = Number(args[0]), phone = args[1], bal = getUserBalance(ctx.from.id);
  if (!credits || credits <= 0) { await ctx.reply("❌ Cantidad inválida"); return; }
  if (credits > bal) { await ctx.reply("❌ Saldo insuficiente: " + fmtBal(bal)); return; }
  const cup = creditsToCup(credits);
  const id = createWithdrawal(ctx.from.id, "saldo_movil", credits, cup, phone);
  if (!id) { await ctx.reply("❌ Error"); return; }
  await ctx.reply("✅ *Retiro creado*\n\n📋 #" + id + "\n🪙 " + fmtBal(credits) + " → " + cup + " CUP (saldo)\n📱 → " + phone + "\n\n⏳ Admin lo procesará.", { parse_mode: "Markdown" });
  for (const aid of ADMIN_IDS) { try { await bot.api.sendMessage(aid, "📤 *Nuevo retiro (Saldo)*\n👤 " + (ctx.from.username || ctx.from.first_name) + " (ID: " + ctx.from.id + ")\n📋 #" + id + " | " + fmtBal(credits) + " → " + cup + " CUP → " + phone, { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔧 Ver Retiros", "admin_withdrawals") }); } catch {} }
});

// ============ BETTING FLOW ============
bot.callbackQuery("bet_menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  const bal = getUserBalance(ctx.from.id);
  if (bal <= 0) { await ctx.editMessageText("⚽ *APUESTAS*\n\n❌ Sin saldo. Deposita primero.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Menú", "back_menu") }); return; }
  await ctx.editMessageText("⚽ *APUESTAS*\n\n🔄 Cargando partidos...", { parse_mode: "Markdown" });
  try {
    const fixtures = await getTodayFixtures();
    if (!fixtures.length) { await ctx.editMessageText("⚽ *APUESTAS*\n\n😔 No hay partidos hoy.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Menú", "back_menu") }); return; }
    const kb = new InlineKeyboard();
    const show = fixtures.slice(0, 8);
    show.forEach((f, i) => { kb.text(f.teams.home.name + " vs " + f.teams.away.name, "sel_" + f.fixture.id); if (i < show.length - 1) kb.row(); });
    kb.row().text("🔙 Menú", "back_menu");
    let msg = "⚽ *PARTIDOS DE HOY*\n\n💰 Saldo: " + fmtBal(bal) + "\n\n";
    show.forEach((f) => { msg += formatFixture(f) + "\n\n"; });
    msg += "Toca un partido para ver cuotas:";
    await ctx.editMessageText(msg, { parse_mode: "Markdown", reply_markup: kb });
  } catch (e) { await ctx.editMessageText("❌ Error cargando partidos.", { reply_markup: new InlineKeyboard().text("🔙 Menú", "back_menu") }); }
});

bot.callbackQuery(/^sel_(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const fid = Number(ctx.match[1]);
  try {
    const oddsData = await getFixtureOdds(fid);
    let hOdds = 0, dOdds = 0, aOdds = 0, name = "Partido #" + fid;
    if (oddsData.length > 0) {
      const bets = oddsData[0].bookmakers?.[0]?.bets || [];
      const mw = bets.find((b) => b.name === "Match Winner");
      if (mw) for (const v of mw.values) { if (v.value === "Home") hOdds = Number(v.odd); if (v.value === "Draw") dOdds = Number(v.odd); if (v.value === "Away") aOdds = Number(v.odd); }
    }
    if (!hOdds && !dOdds && !aOdds) { hOdds = 1.85; dOdds = 3.20; aOdds = 4.50; }
    await ctx.editMessageText("⚽ *" + name + "*\n\n🏠 Local (" + hOdds + ") | 🤝 Empate (" + dOdds + ") | ✈️ Visitante (" + aOdds + ")\n\n💰 Saldo: " + fmtBal(getUserBalance(ctx.from.id)), { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🏠 " + hOdds, "bet_" + fid + "_1_" + hOdds).text("🤝 " + dOdds, "bet_" + fid + "_X_" + dOdds).row().text("✈️ " + aOdds, "bet_" + fid + "_2_" + aOdds).row().text("🔙 Partidos", "bet_menu") });
  } catch (e) { await ctx.editMessageText("❌ Error", { reply_markup: new InlineKeyboard().text("🔙 Partidos", "bet_menu") }); }
});

bot.callbackQuery(/^bet_(\d+)_(1|X|2)_([\d.]+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const fid = Number(ctx.match[1]), bt = ctx.match[2], odds = Number(ctx.match[3]);
  const labels = { "1": "Local", "X": "Empate", "2": "Visitante" };
  setUserState(ctx.from.id, "enter_stake", { fixtureId: fid, betType: bt, odds: odds, betLabel: labels[bt] });
  await ctx.editMessageText("🎯 *CONFIRMAR APUESTA*\n\n⚽ Partido #" + fid + "\n📌 " + labels[bt] + "\n📊 Cuota: " + odds + "\n\n💰 Saldo: " + fmtBal(getUserBalance(ctx.from.id)) + "\n\nEscribe la cantidad de créditos a apostar:", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("❌ Cancelar", "cancel_bet") });
});

bot.callbackQuery("cancel_bet", async (ctx) => {
  await ctx.answerCallbackQuery();
  clearUserState(ctx.from.id);
  await ctx.editMessageText("❌ Cancelada.", { reply_markup: mainMenu() });
});

// ============ TEXT INPUT ============
bot.on("message:text", async (ctx) => {
  const state = getUserState(ctx.from.id);
  if (!state) return;

  if (state.state === "admin_addsaldo") {
    const args = ctx.message.text.trim().split(/\s+/);
    if (args.length < 2) { await ctx.reply("❌ Usa: USER_ID CANTIDAD"); return; }
    const uid = Number(args[0]), amt = Number(args[1]);
    if (!uid || !amt || amt <= 0) { await ctx.reply("❌ Parámetros inválidos"); return; }
    ensureUser(uid);
    addBalance(uid, amt);
    clearUserState(ctx.from.id);
    await ctx.reply("✅ +" + fmtBal(amt) + " al usuario " + uid, { reply_markup: adminMenu() });
    try { await bot.api.sendMessage(uid, "💰 *Saldo acreditado*\n🪙 +" + fmtBal(amt) + "\n💰 Nuevo saldo: " + fmtBal(getUserBalance(uid)), { parse_mode: "Markdown" }); } catch {}
    return;
  }

  if (state.state === "enter_stake") {
    const stake = Number(ctx.message.text.replace(",", "."));
    if (!stake || stake <= 0) { await ctx.reply("❌ Cantidad inválida."); return; }
    const bal = getUserBalance(ctx.from.id);
    if (stake > bal) { await ctx.reply("❌ Saldo insuficiente: " + fmtBal(bal)); return; }
    const { fixtureId, betType, odds, betLabel } = state.data;
    const result = createBet(ctx.from.id, fixtureId, "Partido #" + fixtureId, betType, betLabel, odds, stake);
    if (!result) { await ctx.reply("❌ Error"); clearUserState(ctx.from.id); return; }
    clearUserState(ctx.from.id);
    await ctx.reply("✅ *¡APUESTA REALIZADA!*\n\n⚽ #" + fixtureId + "\n📌 " + betLabel + " @ " + odds + "\n🪙 Apostado: " + fmtBal(stake) + "\n🏆 Posible: " + fmtBal(result.potentialWin) + "\n📋 ID: #" + result.betId, { parse_mode: "Markdown", reply_markup: mainMenu() });
    for (const aid of ADMIN_IDS) { try { await bot.api.sendMessage(aid, "⚽ *Nueva apuesta*\n👤 " + (ctx.from.username || ctx.from.first_name) + "\n📋 #" + result.betId + " | " + betLabel + " @ " + odds, { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔧 Ver", "admin_bets") }); } catch {} }
  }
});

// ============ BALANCE, HISTORY, HELP ============
bot.callbackQuery("balance", async (ctx) => {
  await ctx.answerCallbackQuery();
  const bal = getUserBalance(ctx.from.id);
  await ctx.editMessageText("💰 *TU SALDO*\n\n🪙 " + fmtBal(bal) + "\n💵 = " + creditsToCup(bal) + " CUP", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Menú", "back_menu") });
});

bot.callbackQuery("history", async (ctx) => {
  await ctx.answerCallbackQuery();
  const bets = getUserBets(ctx.from.id);
  if (!bets.length) { await ctx.editMessageText("📊 *MIS APUESTAS*\n\nNinguna todavía.", { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Menú", "back_menu") }); return; }
  let msg = "📊 *MIS APUESTAS*\n\n";
  const emojis = { pending: "⏳", won: "✅", lost: "❌", void: "↩️" };
  for (const b of bets) msg += (emojis[b.status] || "❓") + " #" + b.id + " " + b.fixture_name + "\n   " + b.bet_label + " @ " + b.odds + " | " + fmtBal(b.stake) + " → " + fmtBal(b.potential_win) + "\n\n";
  await ctx.editMessageText(msg, { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Menú", "back_menu") });
});

bot.callbackQuery("help", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "❓ *AYUDA*\n\n⚽ Apostar → Selecciona partido y apuesta\n📥 Depositar → Transferencia o Saldo Móvil\n📤 Retirar → Transferencia o Saldo Móvil\n\n📝 Comandos:\n/start - Menú\n/depositar_transfer MONTO\n/depositar_saldo MONTO TELÉFONO\n/depositado ID + 📸 captura\n/retirar_transfer CRÉDITOS TELÉFONO\n/retirar_saldo CRÉDITOS TELÉFONO\n/saldo - Ver saldo\n/admin - Panel admin",
    { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Menú", "back_menu") }
  );
});

bot.callbackQuery("back_menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  const kb = mainMenu();
  if (isAdmin(ctx.from.id)) { kb.row().text("🔧 Admin", "admin_menu"); }
  await ctx.editMessageText("⚽🎰 *Bot de Apuestas*\n\n💰 Saldo: " + fmtBal(getUserBalance(ctx.from.id)), { parse_mode: "Markdown", reply_markup: kb });
});

// ============ COMMANDS ============
bot.command("admin", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const deps = getPendingDeposits(), wds = getPendingWithdrawals(), bets = getPendingBets();
  await ctx.reply("🔧 *PANEL DE ADMIN*\n\n📥 Depósitos: " + deps.length + "\n📤 Retiros: " + wds.length + "\n⏳ Apuestas: " + bets.length, { parse_mode: "Markdown", reply_markup: adminMenu() });
});

bot.command("pendientes", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const deps = getPendingDeposits(), wds = getPendingWithdrawals();
  let msg = "📋 *PENDIENTES*\n\n";
  if (deps.length) { msg += "📥 DEPÓSITOS:\n"; deps.forEach(d => { msg += "#" + d.id + " | " + d.amount_cup + " CUP | " + (d.photo_file_id ? "📸" : "⚠️ SIN FOTO") + "\n"; }); msg += "\n"; }
  if (wds.length) { msg += "📤 RETIROS:\n"; wds.forEach(w => { msg += "#" + w.id + " | " + fmtBal(w.amount_credits) + " → " + w.amount_cup + " CUP\n"; }); msg += "\n"; }
  if (!deps.length && !wds.length) msg += "✅ Sin pendientes.";
  await ctx.reply(msg, { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔧 Panel", "admin_menu") });
});

bot.command("aprobar_dep", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const id = Number(ctx.match.trim());
  if (!id) { await ctx.reply("❌ Usa: /aprobar_dep ID"); return; }
  const dep = approveDeposit(id, ctx.from.id);
  if (!dep) { await ctx.reply("❌ No encontrado"); return; }
  await ctx.reply("✅ Depósito #" + id + " aprobado");
  try { await bot.api.sendMessage(dep.user_id, "✅ *Depósito aprobado*\n📋 #" + id + "\n🪙 +" + fmtBal(dep.credits), { parse_mode: "Markdown" }); } catch {}
});

bot.command("rechazar_dep", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const id = Number(ctx.match.trim());
  if (!id) { await ctx.reply("❌ Usa: /rechazar_dep ID"); return; }
  const dep = rejectDeposit(id, ctx.from.id);
  if (!dep) { await ctx.reply("❌ No encontrado"); return; }
  await ctx.reply("❌ Depósito #" + id + " rechazado");
  try { await bot.api.sendMessage(dep.user_id, "❌ *Depósito rechazado*\n📋 #" + id, { parse_mode: "Markdown" }); } catch {}
});

bot.command("aprobar_ret", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const id = Number(ctx.match.trim());
  const wd = approveWithdrawal(id, ctx.from.id);
  if (!wd) { await ctx.reply("❌ No encontrado"); return; }
  await ctx.reply("✅ Retiro #" + id + " aprobado");
  try { await bot.api.sendMessage(wd.user_id, "✅ *Retiro aprobado*\n📋 #" + id + "\n💵 " + wd.amount_cup + " CUP → " + wd.destination, { parse_mode: "Markdown" }); } catch {}
});

bot.command("rechazar_ret", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const id = Number(ctx.match.trim());
  const wd = rejectWithdrawal(id, ctx.from.id);
  if (!wd) { await ctx.reply("❌ No encontrado"); return; }
  await ctx.reply("❌ Retiro #" + id + " rechazado");
  try { await bot.api.sendMessage(wd.user_id, "❌ *Retiro rechazado*\n📋 #" + id + "\n🪙 " + fmtBal(wd.amount_credits) + " devueltos", { parse_mode: "Markdown" }); } catch {}
});

bot.command("settle", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const args = ctx.match.trim().split(/\s+/);
  if (!args || args.length < 2) { await ctx.reply("❌ Usa: /settle ID won|lost|void"); return; }
  const betId = Number(args[0]), status = args[1];
  if (!["won", "lost", "void"].includes(status)) { await ctx.reply("❌ Usa: won, lost, o void"); return; }
  const bet = settleBet(betId, status, "Admin: " + status);
  if (!bet) { await ctx.reply("❌ No encontrada"); return; }
  await ctx.reply((status === "won" ? "✅" : "❌") + " #" + betId + " → " + status);
  try {
    const m = status === "won" ? "🎉 *¡GANASTE!*\n🏆 +" + fmtBal(bet.potential_win) : "😞 *Perdiste*\n🪙 -" + fmtBal(bet.stake);
    await bot.api.sendMessage(bet.user_id, m, { parse_mode: "Markdown" });
  } catch {}
});

bot.command("addsaldo", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const args = ctx.match.trim().split(/\s+/);
  if (!args || args.length < 2) { await ctx.reply("❌ Usa: /addsaldo USER_ID CANTIDAD"); return; }
  const uid = Number(args[0]), amt = Number(args[1]);
  if (!uid || !amt || amt <= 0) { await ctx.reply("❌ Parámetros inválidos"); return; }
  ensureUser(uid);
  addBalance(uid, amt);
  await ctx.reply("✅ +" + fmtBal(amt) + " al usuario " + uid);
  try { await bot.api.sendMessage(uid, "💰 *Saldo acreditado*\n🪙 +" + fmtBal(amt), { parse_mode: "Markdown" }); } catch {}
});

bot.command("saldo", async (ctx) => {
  const bal = getUserBalance(ctx.from.id);
  const kb = mainMenu();
  if (isAdmin(ctx.from.id)) kb.row().text("🔧 Admin", "admin_menu");
  await ctx.reply("💰 Saldo: " + fmtBal(bal) + "\n💵 = " + creditsToCup(bal) + " CUP", { reply_markup: kb });
});

bot.catch((err) => console.error("Bot error:", err));

// ============ EXPRESS + WEBHOOK ============
const app = express();
app.use(express.json());

app.get("/", function(_req, res) {
  res.json({ status: "ok", bot: "betting-bot", time: new Date().toISOString() });
});

app.post("/webhook", async function(req, res) {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (e) {
    console.error("Webhook error:", e);
    res.sendStatus(500);
  }
});

app.listen(PORT, async function() {
  console.log("🚀 Server on port " + PORT);
  await bot.init();
  if (RENDER_URL) {
    try {
      await bot.api.setWebhook(RENDER_URL + "/webhook");
      console.log("✅ Webhook: " + RENDER_URL + "/webhook");
    } catch (e) { console.error("❌ Webhook error:", e); }
  } else {
    console.log("⚠️ RENDER_URL not set!");
  }
});

console.log("🤖 Betting Bot starting...");
