const { Bot, InlineKeyboard } = require("grammy");
const express = require("express");
const { setApiKey, getTodayFixtures, getFixtureOdds, formatFixture } = require("./sports");
const {
  ensureUser, getUserBalance, addBalance,
  setUserState, getUserState, clearUserState,
  createDeposit, getPendingDeposits, approveDeposit, rejectDeposit,
  createWithdrawal, getPendingWithdrawals, approveWithdrawal, rejectWithdrawal,
  createBet, settleBet, getUserBets,
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

bot.command("start", async (ctx) => {
  ensureUser(ctx.from.id, ctx.from.username, ctx.from.first_name);
  await ctx.reply(
    "¡Hola " + ctx.from.first_name + "! 👋\n\nBot de Apuestas Deportivas ⚽🎰\n\n💰 Tu saldo: " + fmtBal(getUserBalance(ctx.from.id)),
    { reply_markup: mainMenu() }
  );
});

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
    "📥 *DEPÓSITO POR TRANSFERENCIA*\n\nUsa:\n`/depositar_transfer MONTO`\n\nEj: `/depositar_transfer 500`\n\nMínimo: " + MIN_DEPOSIT_CUP + " CUP\n\n📱 Teléfono: " + TRANSFER_PHONE + "\n🏦 Cuenta: " + TRANSFER_CUP_ACCOUNT + "\n\n⚠️ Después usa /depositado ID",
    { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Atrás", "deposit_menu") }
  );
});

bot.callbackQuery("dep_saldo", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "📥 *DEPÓSITO POR SALDO MÓVIL*\n\nUsa:\n`/depositar_saldo MONTO TELÉFONO`\n\nEj: `/depositar_saldo 100 55551234`\n\nMínimo: " + MIN_DEPOSIT_SALDO + " CUP\n\nEnviar saldo a: " + TRANSFER_PHONE + "\n\n⚠️ Después usa /depositado ID",
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
    "✅ *Solicitud creada*\n\n📋 ID: #" + id + "\n💵 " + amountCup + " CUP → " + fmtBal(credits) + "\n📝 Ref: " + ref + "\n\nTransfiere a:\n📱 " + TRANSFER_PHONE + "\n🏦 " + TRANSFER_CUP_ACCOUNT + "\n\nDespués: /depositado " + id,
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
    "✅ *Solicitud creada*\n\n📋 ID: #" + id + "\n💵 " + amountCup + " CUP → " + fmtBal(credits) + "\n📱 Desde: " + phone + "\n\nEnvía saldo a: " + TRANSFER_PHONE + "\n\nDespués: /depositado " + id,
    { parse_mode: "Markdown" }
  );
});

bot.command("depositado", async (ctx) => {
  await ctx.reply("✅ Notificación enviada. Un admin verificará tu depósito.");
  for (const aid of ADMIN_IDS) {
    try { await bot.api.sendMessage(aid, "📥 *Depósito pendiente*\n👤 " + (ctx.from.username || ctx.from.first_name) + " (ID: " + ctx.from.id + ")\n📋 Depósito: #" + ctx.match.trim() + "\n\n/pendientes para ver todos.", { parse_mode: "Markdown" }); } catch {}
  }
});

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
  await ctx.editMessageText(
    "📤 *RETIRO POR TRANSFERENCIA*\n\n`/retirar_transfer CRÉDITOS TELÉFONO`\n\nEj: `/retirar_transfer 2 55551234`",
    { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Atrás", "withdraw_menu") }
  );
});

bot.callbackQuery("wd_saldo", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "📤 *RETIRO POR SALDO MÓVIL*\n\n`/retirar_saldo CRÉDITOS TELÉFONO`\n\nEj: `/retirar_saldo 1 55551234`",
    { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Atrás", "withdraw_menu") }
  );
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
  for (const aid of ADMIN_IDS) { try { await bot.api.sendMessage(aid, "📤 Retiro pendiente #" + id + "\n👤 " + (ctx.from.username || ctx.from.first_name) + "\n" + fmtBal(credits) + " → " + cup + " CUP → " + phone); } catch {} }
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
  for (const aid of ADMIN_IDS) { try { await bot.api.sendMessage(aid, "📤 Retiro saldo #" + id + "\n👤 " + (ctx.from.username || ctx.from.first_name) + "\n" + fmtBal(credits) + " → " + cup + " CUP → " + phone); } catch {} }
});

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
    show.forEach((f, i) => {
      kb.text(f.teams.home.name + " vs " + f.teams.away.name, "sel_" + f.fixture.id);
      if (i < show.length - 1) kb.row();
    });
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
      name = (oddsData[0]?.teams?.home?.name || "Local") + " vs " + (oddsData[0]?.teams?.away?.name || "Visitante");
    }
    if (!hOdds && !dOdds && !aOdds) { hOdds = 1.85; dOdds = 3.20; aOdds = 4.50; }
    await ctx.editMessageText(
      "⚽ *" + name + "*\n\n🏠 Local (" + hOdds + ") | 🤝 Empate (" + dOdds + ") | ✈️ Visitante (" + aOdds + ")\n\n💰 Saldo: " + fmtBal(getUserBalance(ctx.from.id)),
      { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🏠 " + hOdds, "bet_" + fid + "_1_" + hOdds).text("🤝 " + dOdds, "bet_" + fid + "_X_" + dOdds).row().text("✈️ " + aOdds, "bet_" + fid + "_2_" + aOdds).row().text("🔙 Partidos", "bet_menu") }
    );
  } catch (e) { await ctx.editMessageText("❌ Error", { reply_markup: new InlineKeyboard().text("🔙 Partidos", "bet_menu") }); }
});

bot.callbackQuery(/^bet_(\d+)_(1|X|2)_([\d.]+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const fid = Number(ctx.match[1]), bt = ctx.match[2], odds = Number(ctx.match[3]);
  const labels = { "1": "Local", "X": "Empate", "2": "Visitante" };
  setUserState(ctx.from.id, "enter_stake", { fixtureId: fid, betType: bt, odds: odds, betLabel: labels[bt] });
  await ctx.editMessageText(
    "🎯 *CONFIRMAR APUESTA*\n\n⚽ Partido #" + fid + "\n📌 " + labels[bt] + "\n📊 Cuota: " + odds + "\n\n💰 Saldo: " + fmtBal(getUserBalance(ctx.from.id)) + "\n\nEscribe la cantidad de créditos a apostar:",
    { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("❌ Cancelar", "cancel_bet") }
  );
});

bot.callbackQuery("cancel_bet", async (ctx) => {
  await ctx.answerCallbackQuery();
  clearUserState(ctx.from.id);
  await ctx.editMessageText("❌ Cancelada.", { reply_markup: mainMenu() });
});

bot.on("message:text", async (ctx) => {
  const state = getUserState(ctx.from.id);
  if (!state) return;
  if (state.state === "enter_stake") {
    const stake = Number(ctx.message.text.replace(",", "."));
    if (!stake || stake <= 0) { await ctx.reply("❌ Cantidad inválida. Escribe un número."); return; }
    const bal = getUserBalance(ctx.from.id);
    if (stake > bal) { await ctx.reply("❌ Saldo insuficiente: " + fmtBal(bal)); return; }
    const { fixtureId, betType, odds, betLabel } = state.data;
    const result = createBet(ctx.from.id, fixtureId, "Partido #" + fixtureId, betType, betLabel, odds, stake);
    if (!result) { await ctx.reply("❌ Error"); clearUserState(ctx.from.id); return; }
    clearUserState(ctx.from.id);
    await ctx.reply(
      "✅ *¡APUESTA REALIZADA!*\n\n⚽ #" + fixtureId + "\n📌 " + betLabel + " @ " + odds + "\n🪙 Apostado: " + fmtBal(stake) + "\n🏆 Posible: " + fmtBal(result.potentialWin) + "\n📋 ID: #" + result.betId,
      { parse_mode: "Markdown", reply_markup: mainMenu() }
    );
  }
});

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
    "❓ *AYUDA*\n\n⚽ Apostar → Selecciona partido y apuesta\n📥 Depositar → Transferencia o Saldo Móvil\n📤 Retirar → Transferencia o Saldo Móvil\n\n📝 Comandos:\n/start - Menú\n/depositar_transfer MONTO\n/depositar_saldo MONTO TELÉFONO\n/depositado ID\n/retirar_transfer CRÉDITOS TELÉFONO\n/retirar_saldo CRÉDITOS TELÉFONO\n/saldo - Ver saldo",
    { parse_mode: "Markdown", reply_markup: new InlineKeyboard().text("🔙 Menú", "back_menu") }
  );
});

bot.callbackQuery("back_menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("⚽🎰 *Bot de Apuestas*\n\n💰 Saldo: " + fmtBal(getUserBalance(ctx.from.id)), { parse_mode: "Markdown", reply_markup: mainMenu() });
});

bot.command("pendientes", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const deps = getPendingDeposits(), wds = getPendingWithdrawals();
  let msg = "📋 *PENDIENTES*\n\n";
  if (deps.length) { msg += "📥 DEPÓSITOS:\n"; deps.forEach(d => { msg += "#" + d.id + " | " + d.amount_cup + " CUP → " + fmtBal(d.credits) + " | User:" + d.user_id + "\n  /aprobar_dep " + d.id + " | /rechazar_dep " + d.id + "\n"; }); msg += "\n"; }
  if (wds.length) { msg += "📤 RETIROS:\n"; wds.forEach(w => { msg += "#" + w.id + " | " + fmtBal(w.amount_credits) + " → " + w.amount_cup + " CUP → " + w.destination + "\n  /aprobar_ret " + w.id + " | /rechazar_ret " + w.id + "\n"; }); msg += "\n"; }
  if (!deps.length && !wds.length) msg += "✅ Sin pendientes.";
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.command("aprobar_dep", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const id = Number(ctx.match.trim());
  if (!id) { await ctx.reply("❌ Usa: /aprobar_dep ID"); return; }
  const dep = approveDeposit(id, ctx.from.id);
  if (!dep) { await ctx.reply("❌ No encontrado o procesado"); return; }
  await ctx.reply("✅ Depósito #" + id + " aprobado");
  try { await bot.api.sendMessage(dep.user_id, "✅ *Depósito aprobado*\n📋 #" + id + "\n🪙 +" + fmtBal(dep.credits) + "\n💰 Saldo: " + fmtBal(getUserBalance(dep.user_id)), { parse_mode: "Markdown" }); } catch {}
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
  if (!id) { await ctx.reply("❌ Usa: /aprobar_ret ID"); return; }
  const wd = approveWithdrawal(id, ctx.from.id);
  if (!wd) { await ctx.reply("❌ No encontrado"); return; }
  await ctx.reply("✅ Retiro #" + id + " aprobado");
  try { await bot.api.sendMessage(wd.user_id, "✅ *Retiro aprobado*\n📋 #" + id + "\n💵 " + wd.amount_cup + " CUP → " + wd.destination, { parse_mode: "Markdown" }); } catch {}
});

bot.command("rechazar_ret", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const id = Number(ctx.match.trim());
  if (!id) { await ctx.reply("❌ Usa: /rechazar_ret ID"); return; }
  const wd = rejectWithdrawal(id, ctx.from.id);
  if (!wd) { await ctx.reply("❌ No encontrado"); return; }
  await ctx.reply("❌ Retiro #" + id + " rechazado - créditos devueltos");
  try { await bot.api.sendMessage(wd.user_id, "❌ *Retiro rechazado*\n📋 #" + id + "\n🪙 " + fmtBal(wd.amount_credits) + " devueltos\n💰 Saldo: " + fmtBal(getUserBalance(wd.user_id)), { parse_mode: "Markdown" }); } catch {}
});

bot.command("settle", async (ctx) => {
  if (!isAdmin(ctx.from.id)) { await ctx.reply("❌ Solo admins"); return; }
  const args = ctx.match.trim().split(/\s+/);
  if (!args || args.length < 2) { await ctx.reply("❌ Usa: /settle ID_BET won|lost|void"); return; }
  const betId = Number(args[0]), status = args[1];
  if (!["won", "lost", "void"].includes(status)) { await ctx.reply("❌ Usa: won, lost, o void"); return; }
  const bet = settleBet(betId, status, "Admin: " + status);
  if (!bet) { await ctx.reply("❌ No encontrada o resuelta"); return; }
  const e = status === "won" ? "✅" : status === "lost" ? "❌" : "↩️";
  await ctx.reply(e + " Apuesta #" + betId + " → " + status);
  try {
    const m = status === "won" ? "🎉 *¡GANASTE!*\n📋 #" + betId + "\n🏆 +" + fmtBal(bet.potential_win) + "\n💰 Saldo: " + fmtBal(getUserBalance(bet.user_id))
      : status === "lost" ? "😞 *Perdiste*\n📋 #" + betId + "\n🪙 -" + fmtBal(bet.stake)
      : "↩️ *Anulada*\n📋 #" + betId + "\n🪙 +" + fmtBal(bet.stake) + " devueltos";
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
});

bot.command("saldo", async (ctx) => {
  await ctx.reply("💰 Saldo: " + fmtBal(getUserBalance(ctx.from.id)) + "\n💵 = " + creditsToCup(getUserBalance(ctx.from.id)) + " CUP", { reply_markup: mainMenu() });
});

bot.catch((err) => console.error("Bot error:", err));

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
      const url = RENDER_URL + "/webhook";
      await bot.api.setWebhook(url);
      console.log("✅ Webhook: " + url);
    } catch (e) { console.error("❌ Webhook error:", e); }
  } else {
    console.log("⚠️ RENDER_URL not set!");
  }
});

console.log("🤖 Betting Bot starting...");
