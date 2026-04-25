// ============================================
// 🤖 BETTING BOT - Telegram Bot de Apuestas
// 100% Botones | Multi-Admin | Capturas
// ============================================

const { Bot, InlineKeyboard } = require("grammy");
const express = require("express");
const {
  setApiKey, getLeagues, getLeagueById,
  getTodayFixtures, getFixtureOdds, formatFixtureShort,
} = require("./sports");
const {
  ensureUser, getUser, getUserBalance, addBalance, subtractBalance,
  setUserState, getUserState, clearUserState,
  createDeposit, getPendingDeposits, getDepositById, approveDeposit, rejectDeposit,
  createWithdrawal, getPendingWithdrawals, getWithdrawalById, approveWithdrawal, rejectWithdrawal,
  createBet, getPendingBets, getBetById, settleBet, getUserBets,
  getStats, getRecentUsers,
} = require("./database");

// ============ CONFIGURATION ============

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const RENDER_URL = process.env.RENDER_URL || "";
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || "";
const ADMIN_IDS = (process.env.ADMIN_IDS || "").split(",").map(Number).filter(Boolean);
const TRANSFER_PHONE = process.env.TRANSFER_PHONE || "";
const TRANSFER_CUP_ACCOUNT = process.env.TRANSFER_CUP_ACCOUNT || "";
const MIN_DEPOSIT_CUP = Number(process.env.MIN_DEPOSIT_CUP) || 100;
const MIN_DEPOSIT_SALDO = Number(process.env.MIN_DEPOSIT_SALDO) || 50;
const CUP_TO_CREDIT = Number(process.env.CUP_TO_CREDIT) || 0.004;
const PORT = Number(process.env.PORT) || 10000;

if (!BOT_TOKEN) {
  console.error("❌ ERROR: BOT_TOKEN es requerido!");
  process.exit(1);
}

setApiKey(API_FOOTBALL_KEY);

// ============ HELPERS ============

function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}

function formatBalance(credits) {
  return `${credits.toFixed(2)} créditos`;
}

function cupToCredits(cup) {
  return Math.round(cup * CUP_TO_CREDIT * 100) / 100;
}

function creditsToCup(credits) {
  return Math.round(credits / CUP_TO_CREDIT * 100) / 100;
}

function creditRate() {
  return Math.round(1 / CUP_TO_CREDIT);
}

function methodName(method) {
  if (method === "transfermovil") return "🏦 Transfermovil";
  if (method === "saldo_movil") return "📱 Saldo Móvil";
  return method;
}

function predictionEmoji(pred) {
  if (pred === "home") return "🏠";
  if (pred === "draw") return "🤝";
  if (pred === "away") return "✈️";
  return "❓";
}

function predictionLabel(pred) {
  if (pred === "home") return "Local";
  if (pred === "draw") return "Empate";
  if (pred === "away") return "Visitante";
  return pred;
}

function statusEmoji(status) {
  const map = { pending: "⏳", won: "✅", lost: "❌", void: "↩️", approved: "✅", rejected: "❌" };
  return map[status] || "❓";
}

// Notify all admins
async function notifyAdmins(text, extra) {
  for (const adminId of ADMIN_IDS) {
    try {
      await bot.api.sendMessage(adminId, text, extra);
    } catch (e) {
      console.error(`Failed to notify admin ${adminId}:`, e.message);
    }
  }
}

// ============ BOT SETUP ============

const bot = new Bot(BOT_TOKEN);
bot.catch((err) => console.error("Bot error:", err));

// ============ KEYBOARDS ============

function mainMenuKeyboard(userId) {
  const kb = new InlineKeyboard()
    .text("⚽ Apostar", "menu:bet")
    .text("💰 Saldo", "menu:balance")
    .row()
    .text("📥 Depositar", "menu:deposit")
    .text("📤 Retirar", "menu:withdraw")
    .row()
    .text("📊 Mis Apuestas", "menu:history")
    .text("❓ Ayuda", "menu:help");

  if (isAdmin(userId)) {
    kb.row().text("🔧 Admin", "menu:admin");
  }

  return kb;
}

function adminMenuKeyboard() {
  return new InlineKeyboard()
    .text("📥 Depósitos", "adm:deposits")
    .text("📤 Retiros", "adm:withdrawals")
    .row()
    .text("⏳ Apuestas", "adm:bets")
    .text("👤 Añadir Saldo", "adm:addsaldo")
    .row()
    .text("📊 Estadísticas", "adm:stats")
    .row()
    .text("◀️ Volver al Menú", "nav:menu");
}

function backToMenuKeyboard() {
  return new InlineKeyboard().text("◀️ Volver al Menú", "nav:menu");
}

// ============ /START COMMAND ============

bot.command("start", async (ctx) => {
  ensureUser(ctx.from.id, ctx.from.username, ctx.from.first_name);
  clearUserState(ctx.from.id);
  const balance = getUserBalance(ctx.from.id);

  await ctx.reply(
    `¡Hola ${ctx.from.first_name}! 👋\n\n` +
    `Bienvenido al Bot de Apuestas Deportivas ⚽🎰\n\n` +
    `💰 Tu saldo: ${formatBalance(balance)}\n` +
    `💵 Equivale a: ${creditsToCup(balance).toFixed(0)} CUP\n\n` +
    `Usa los botones de abajo para navegar:`,
    { reply_markup: mainMenuKeyboard(ctx.from.id) }
  );
});

// ============ NAVIGATION ============

bot.callbackQuery("nav:menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  clearUserState(ctx.from.id);
  const balance = getUserBalance(ctx.from.id);
  await ctx.editMessageText(
    `⚽🎰 *Bot de Apuestas Deportivas*\n\n` +
    `💰 Tu saldo: ${formatBalance(balance)}\n` +
    `💵 Equivale a: ${creditsToCup(balance).toFixed(0)} CUP`,
    { parse_mode: "Markdown", reply_markup: mainMenuKeyboard(ctx.from.id) }
  );
});

// ============ MAIN MENU CALLBACKS ============

bot.callbackQuery("menu:balance", async (ctx) => {
  await ctx.answerCallbackQuery();
  const balance = getUserBalance(ctx.from.id);
  const cupEquiv = creditsToCup(balance);

  await ctx.editMessageText(
    `💰 *TU SALDO*\n\n` +
    `🪙 Créditos: ${formatBalance(balance)}\n` +
    `💵 Equivale a: ${cupEquiv.toFixed(0)} CUP\n` +
    `📊 Tasa: 1 crédito = ${creditRate()} CUP\n\n` +
    `¿Qué deseas hacer?`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text("📥 Depositar", "menu:deposit")
        .text("📤 Retirar", "menu:withdraw")
        .row()
        .text("◀️ Volver al Menú", "nav:menu"),
    }
  );
});

bot.callbackQuery("menu:help", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    `❓ *AYUDA*\n\n` +
    `⚽ *Apostar*: Selecciona un partido y apuesta por Local, Empate o Visitante\n\n` +
    `📥 *Depositar*:\n` +
    `   🏦 Transfermovil: Mínimo ${MIN_DEPOSIT_CUP} CUP\n` +
    `   📱 Saldo Móvil: Mínimo ${MIN_DEPOSIT_SALDO} CUP\n` +
    `   ⚠️ Debes enviar captura del comprobante\n\n` +
    `📤 *Retirar*: Solicita retiro por Transfermovil o Saldo Móvil\n\n` +
    `💰 *Tasa de cambio*: 1 crédito = ${creditRate()} CUP\n\n` +
    `💡 *Cuotas*: Se pagan multiplicando tu apuesta por la cuota\n` +
    `   Ejemplo: 1 crédito × cuota 2.5 = 2.5 créditos de ganancia\n\n` +
    `📝 Todo se maneja con botones, no necesitas escribir comandos.`,
    { parse_mode: "Markdown", reply_markup: backToMenuKeyboard() }
  );
});

// ============ DEPOSIT FLOW ============

bot.callbackQuery("menu:deposit", async (ctx) => {
  await ctx.answerCallbackQuery();
  const balance = getUserBalance(ctx.from.id);

  await ctx.editMessageText(
    `📥 *DEPOSITAR SALDO*\n\n` +
    `💰 Tu saldo actual: ${formatBalance(balance)}\n\n` +
    `Selecciona el método de depósito:\n\n` +
    `🏦 *Transfermovil*: Mínimo ${MIN_DEPOSIT_CUP} CUP\n` +
    `📱 *Saldo Móvil*: Mínimo ${MIN_DEPOSIT_SALDO} CUP`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text("🏦 Transfermovil", "dep:transfermovil")
        .text("📱 Saldo Móvil", "dep:saldo_movil")
        .row()
        .text("◀️ Volver al Menú", "nav:menu"),
    }
  );
});

bot.callbackQuery(/^dep:(transfermovil|saldo_movil)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const method = ctx.match[1];
  const minAmount = method === "transfermovil" ? MIN_DEPOSIT_CUP : MIN_DEPOSIT_SALDO;

  setUserState(ctx.from.id, "deposit", "amount", { method });

  await ctx.editMessageText(
    `📥 *DEPÓSITO POR ${methodName(method).toUpperCase()}*\n\n` +
    `Mínimo: ${minAmount} CUP\n\n` +
    `¿Cuánto quieres depositar?`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text(`${minAmount} CUP`, `dep:amt:${minAmount}`)
        .text("200 CUP", "dep:amt:200")
        .row()
        .text("500 CUP", "dep:amt:500")
        .text("1000 CUP", "dep:amt:1000")
        .row()
        .text("✏️ Otra cantidad", "dep:amt:custom")
        .row()
        .text("◀️ Volver", "menu:deposit"),
    }
  );
});

bot.callbackQuery(/^dep:amt:(\d+|custom)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const amtStr = ctx.match[1];
  const state = getUserState(ctx.from.id);

  if (!state || state.action !== "deposit") {
    await ctx.editMessageText("❌ Sesión expirada. Empieza de nuevo.", { reply_markup: backToMenuKeyboard() });
    return;
  }

  const method = state.data.method;
  const minAmount = method === "transfermovil" ? MIN_DEPOSIT_CUP : MIN_DEPOSIT_SALDO;

  if (amtStr === "custom") {
    setUserState(ctx.from.id, "deposit", "enter_amount", { method });
    await ctx.editMessageText(
      `📥 *DEPÓSITO POR ${methodName(method).toUpperCase()}*\n\n` +
      `Escribe la cantidad de CUP que quieres depositar:\n\n` +
      `Mínimo: ${minAmount} CUP`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .text("❌ Cancelar", "menu:deposit"),
      }
    );
    return;
  }

  const amountCup = Number(amtStr);
  if (amountCup < minAmount) {
    await ctx.answerCallbackQuery(`❌ El mínimo es ${minAmount} CUP`, { show_alert: true });
    return;
  }

  // Show instructions and wait for screenshot
  const credits = cupToCredits(amountCup);
  setUserState(ctx.from.id, "deposit", "screenshot", { method, amountCup, credits });

  let instructions = `📥 *DEPÓSITO POR ${methodName(method).toUpperCase()}*\n\n` +
    `💵 Monto: ${amountCup} CUP\n` +
    `🪙 Recibirás: ${formatBalance(credits)}\n\n`;

  if (method === "transfermovil") {
    instructions +=
      `*Datos para transferir:*\n` +
      `📱 Teléfono: ${TRANSFER_PHONE}\n` +
      `🏦 Cuenta: ${TRANSFER_CUP_ACCOUNT}\n\n`;
  } else {
    instructions +=
      `*Envía saldo a:*\n` +
      `📱 Teléfono: ${TRANSFER_PHONE}\n\n`;
  }

  instructions +=
    `📸 *IMPORTANTE:* Después de hacer la transferencia, envía una captura de pantalla del comprobante aquí.\n\n` +
    `⚠️ Sin captura no se aprobará el depósito.`;

  await ctx.editMessageText(instructions, {
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard()
      .text("⏭️ Sin captura", "dep:noscreen")
      .text("❌ Cancelar", "menu:deposit"),
  });
});

bot.callbackQuery("dep:noscreen", async (ctx) => {
  await ctx.answerCallbackQuery();
  const state = getUserState(ctx.from.id);

  if (!state || state.action !== "deposit" || state.step !== "screenshot") {
    await ctx.editMessageText("❌ Sesión expirada. Empieza de nuevo.", { reply_markup: backToMenuKeyboard() });
    return;
  }

  const { method, amountCup, credits } = state.data;

  // Create deposit without screenshot
  const depositId = createDeposit(ctx.from.id, method, amountCup, credits, "", "");
  clearUserState(ctx.from.id);

  await ctx.editMessageText(
    `⚠️ *DEPÓSITO REGISTRADO SIN CAPTURA*\n\n` +
    `📋 ID: #${depositId}\n` +
    `💵 Monto: ${amountCup} CUP\n` +
    `🪙 Créditos: ${formatBalance(credits)}\n` +
    `📱 Método: ${methodName(method)}\n\n` +
    `⏳ Un administrador lo revisará.\n` +
    `⚠️ Sin captura la aprobación puede demorar más.`,
    { parse_mode: "Markdown", reply_markup: backToMenuKeyboard() }
  );

  // Notify all admins
  const user = getUser(ctx.from.id);
  await notifyAdmins(
    `📥 *Nuevo depósito SIN CAPTURA*\n\n` +
    `👤 Usuario: ${user.first_name} (@${user.username || "N/A"}) [ID: ${ctx.from.id}]\n` +
    `📋 Depósito: #${depositId}\n` +
    `💵 Monto: ${amountCup} CUP\n` +
    `🪙 Créditos: ${formatBalance(credits)}\n` +
    `📱 Método: ${methodName(method)}\n\n` +
    `⚠️ El usuario no envió captura - verificar manualmente`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text("✅ Aprobar", `adep:${depositId}:ok`)
        .text("❌ Rechazar", `adep:${depositId}:no`),
    }
  );
});

// ============ WITHDRAW FLOW ============

bot.callbackQuery("menu:withdraw", async (ctx) => {
  await ctx.answerCallbackQuery();
  const balance = getUserBalance(ctx.from.id);

  if (balance <= 0) {
    await ctx.editMessageText(
      "📤 *RETIRAR SALDO*\n\n❌ No tienes saldo suficiente para retirar.\n\nPrimero deposita con 📥 Depositar.",
      { parse_mode: "Markdown", reply_markup: backToMenuKeyboard() }
    );
    return;
  }

  const cupEquiv = creditsToCup(balance);

  await ctx.editMessageText(
    `📤 *RETIRAR SALDO*\n\n` +
    `💰 Tu saldo: ${formatBalance(balance)}\n` +
    `💵 Equivale a: ${cupEquiv.toFixed(0)} CUP\n\n` +
    `Selecciona el método de retiro:`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text("🏦 Transfermovil", "wit:transfermovil")
        .text("📱 Saldo Móvil", "wit:saldo_movil")
        .row()
        .text("◀️ Volver al Menú", "nav:menu"),
    }
  );
});

bot.callbackQuery(/^wit:(transfermovil|saldo_movil)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const method = ctx.match[1];
  const balance = getUserBalance(ctx.from.id);
  const halfBalance = Math.round(balance / 2 * 100) / 100;

  setUserState(ctx.from.id, "withdraw", "amount", { method });

  await ctx.editMessageText(
    `📤 *RETIRO POR ${methodName(method).toUpperCase()}*\n\n` +
    `💰 Tu saldo: ${formatBalance(balance)}\n` +
    `💵 Equivale a: ${creditsToCup(balance).toFixed(0)} CUP\n\n` +
    `¿Cuántos créditos quieres retirar?`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text(`Todo (${formatBalance(balance)})`, "wit:amt:all")
        .text(`50% (${formatBalance(halfBalance)})`, "wit:amt:half")
        .row()
        .text("✏️ Otra cantidad", "wit:amt:custom")
        .row()
        .text("◀️ Volver", "menu:withdraw"),
    }
  );
});

bot.callbackQuery(/^wit:amt:(all|half|custom)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const amtType = ctx.match[1];
  const state = getUserState(ctx.from.id);

  if (!state || state.action !== "withdraw") {
    await ctx.editMessageText("❌ Sesión expirada. Empieza de nuevo.", { reply_markup: backToMenuKeyboard() });
    return;
  }

  const balance = getUserBalance(ctx.from.id);
  const method = state.data.method;

  if (amtType === "custom") {
    setUserState(ctx.from.id, "withdraw", "enter_amount", { method });
    await ctx.editMessageText(
      `📤 *RETIRO POR ${methodName(method).toUpperCase()}*\n\n` +
      `Escribe la cantidad de créditos que quieres retirar:\n\n` +
      `💰 Tu saldo: ${formatBalance(balance)}`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard().text("❌ Cancelar", "menu:withdraw"),
      }
    );
    return;
  }

  let credits;
  if (amtType === "all") {
    credits = balance;
  } else {
    credits = Math.round(balance / 2 * 100) / 100;
  }

  if (credits <= 0) {
    await ctx.answerCallbackQuery("❌ No tienes saldo suficiente", { show_alert: true });
    return;
  }

  // Ask for phone number
  setUserState(ctx.from.id, "withdraw", "phone", { method, credits });
  await ctx.editMessageText(
    `📤 *RETIRO POR ${methodName(method).toUpperCase()}*\n\n` +
    `🪙 Créditos: ${formatBalance(credits)}\n` +
    `💵 Recibirás: ${creditsToCup(credits).toFixed(0)} CUP\n\n` +
    `Escribe tu número de teléfono:`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard().text("❌ Cancelar", "menu:withdraw"),
    }
  );
});

// ============ BETTING FLOW ============

bot.callbackQuery("menu:bet", async (ctx) => {
  await ctx.answerCallbackQuery();
  const balance = getUserBalance(ctx.from.id);

  if (balance <= 0) {
    await ctx.editMessageText(
      "⚽ *APUESTAS*\n\n❌ No tienes saldo. Deposita primero con 📥 Depositar.",
      { parse_mode: "Markdown", reply_markup: backToMenuKeyboard() }
    );
    return;
  }

  // Show league selection
  const leagues = getLeagues();
  const kb = new InlineKeyboard();

  for (let i = 0; i < leagues.length; i++) {
    kb.text(`${leagues[i].emoji} ${leagues[i].name}`, `bet:league:${leagues[i].id}`);
    if (i % 2 === 1) kb.row();
  }
  kb.row()
    .text("⚽ Todos los partidos", "bet:all")
    .row()
    .text("🔄 Actualizar", "menu:bet")
    .text("◀️ Volver", "nav:menu");

  await ctx.editMessageText(
    `⚽ *APUESTAS*\n\n` +
    `💰 Tu saldo: ${formatBalance(balance)}\n\n` +
    `Selecciona una liga o ve todos los partidos:`,
    { parse_mode: "Markdown", reply_markup: kb }
  );
});

bot.callbackQuery("bet:all", async (ctx) => {
  await ctx.answerCallbackQuery();
  await showFixtures(ctx, null);
});

bot.callbackQuery(/^bet:league:(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const leagueId = Number(ctx.match[1]);
  await showFixtures(ctx, leagueId);
});

async function showFixtures(ctx, leagueId) {
  const balance = getUserBalance(ctx.from.id);

  await ctx.editMessageText("⚽ Cargando partidos...", { parse_mode: "Markdown" });

  try {
    const fixtures = await getTodayFixtures(leagueId);

    if (fixtures.length === 0) {
      await ctx.editMessageText(
        "⚽ *APUESTAS*\n\n😔 No hay partidos disponibles hoy. Vuelve más tarde.",
        {
          parse_mode: "Markdown",
          reply_markup: new InlineKeyboard()
            .text("🔄 Reintentar", "menu:bet")
            .text("◀️ Volver", "nav:menu"),
        }
      );
      return;
    }

    const kb = new InlineKeyboard();
    const toShow = fixtures.slice(0, 8);

    for (const f of toShow) {
      const home = f.teams.home.name;
      const away = f.teams.away.name;
      const fid = f.fixture.id;
      const shortName = `${home} vs ${away}`;
      // Truncate if too long for button (max ~20 chars visible)
      const displayName = shortName.length > 25 ? shortName.substring(0, 22) + "..." : shortName;
      kb.text(displayName, `bet:match:${fid}`);
      kb.row();
    }

    kb.text("◀️ Volver a Ligas", "menu:bet");

    let message = `⚽ *PARTIDOS${leagueId ? " - " + (getLeagueById(leagueId)?.name || "") : ""}*\n\n`;
    message += `💰 Tu saldo: ${formatBalance(balance)}\n\n`;

    for (const f of toShow) {
      const home = f.teams.home.name;
      const away = f.teams.away.name;
      const league = f.league.name;
      const date = new Date(f.fixture.date);
      const timeStr = date.toLocaleTimeString("es-CU", { hour: "2-digit", minute: "2-digit" });
      const status = f.fixture.status.short;

      let statusText = "";
      if (status === "NS") statusText = `⏰ ${timeStr}`;
      else if (["1H", "2H", "HT"].includes(status)) statusText = `🔴 EN VIVO ${f.goals.home}-${f.goals.away}`;
      else if (status === "FT") statusText = `✅ FINAL ${f.goals.home}-${f.goals.away}`;
      else statusText = `📋 ${status}`;

      message += `${league}\n⚽ ${home} vs ${away}\n${statusText}\n\n`;
    }

    message += "Toca un partido para ver las cuotas:";

    await ctx.editMessageText(message, { parse_mode: "Markdown", reply_markup: kb });
  } catch (error) {
    console.error("Show fixtures error:", error);
    await ctx.editMessageText(
      "⚽ *APUESTAS*\n\n❌ Error al cargar partidos. Intenta de nuevo más tarde.",
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .text("🔄 Reintentar", "menu:bet")
          .text("◀️ Volver", "nav:menu"),
      }
    );
  }
}

// When user selects a match
bot.callbackQuery(/^bet:match:(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const fixtureId = Number(ctx.match[1]);
  const balance = getUserBalance(ctx.from.id);

  try {
    const oddsData = await getFixtureOdds(fixtureId);

    let homeOdds = 0, drawOdds = 0, awayOdds = 0;
    let homeTeam = "Local", awayTeam = "Visitante", leagueName = "";

    // Try to get team names from fixtures cache
    const fixtures = await getTodayFixtures();
    const fixture = fixtures.find(f => f.fixture.id === fixtureId);
    if (fixture) {
      homeTeam = fixture.teams.home.name;
      awayTeam = fixture.teams.away.name;
      leagueName = fixture.league.name;
    }

    if (oddsData.length > 0) {
      const odds = oddsData[0];
      if (odds.fixture?.teams?.home?.name) homeTeam = odds.fixture.teams.home.name;
      if (odds.fixture?.teams?.away?.name) awayTeam = odds.fixture.teams.away.name;

      const betValues = odds.bookmakers?.[0]?.bets || [];
      const matchWinner = betValues.find(b => b.name === "Match Winner");

      if (matchWinner) {
        for (const val of matchWinner.values) {
          if (val.value === "Home") homeOdds = Number(val.odd);
          if (val.value === "Draw") drawOdds = Number(val.odd);
          if (val.value === "Away") awayOdds = Number(val.odd);
        }
      }
    }

    // Default odds if API didn't return any
    if (homeOdds === 0 && drawOdds === 0 && awayOdds === 0) {
      homeOdds = 1.85;
      drawOdds = 3.20;
      awayOdds = 4.50;
    }

    // Store fixture info in state for later use
    setUserState(ctx.from.id, "bet", "select_prediction", {
      fixtureId, homeTeam, awayTeam, leagueName,
      homeOdds, drawOdds, awayOdds,
    });

    const kb = new InlineKeyboard()
      .text(`🏠 ${homeTeam} (${homeOdds})`, `bet:pred:home`)
      .row()
      .text(`🤝 Empate (${drawOdds})`, `bet:pred:draw`)
      .row()
      .text(`✈️ ${awayTeam} (${awayOdds})`, `bet:pred:away`)
      .row()
      .text("◀️ Volver a Partidos", "menu:bet");

    await ctx.editMessageText(
      `⚽ *${homeTeam} vs ${awayTeam}*\n` +
      (leagueName ? `🏆 ${leagueName}\n` : "") +
      `\n` +
      `Selecciona tu predicción:\n\n` +
      `🏠 ${homeTeam} - Cuota: ${homeOdds}\n` +
      `🤝 Empate - Cuota: ${drawOdds}\n` +
      `✈️ ${awayTeam} - Cuota: ${awayOdds}\n\n` +
      `💰 Tu saldo: ${formatBalance(balance)}`,
      { parse_mode: "Markdown", reply_markup: kb }
    );
  } catch (error) {
    console.error("Odds error:", error);
    await ctx.editMessageText(
      "❌ Error al cargar cuotas. Intenta de nuevo.",
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard().text("◀️ Volver", "menu:bet"),
      }
    );
  }
});

// When user selects a prediction
bot.callbackQuery(/^bet:pred:(home|draw|away)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const prediction = ctx.match[1];
  const state = getUserState(ctx.from.id);

  if (!state || state.action !== "bet") {
    await ctx.editMessageText("❌ Sesión expirada. Empieza de nuevo.", { reply_markup: backToMenuKeyboard() });
    return;
  }

  const { fixtureId, homeTeam, awayTeam, leagueName, homeOdds, drawOdds, awayOdds } = state.data;
  const odds = prediction === "home" ? homeOdds : prediction === "draw" ? drawOdds : awayOdds;
  const predLabel = `${predictionEmoji(prediction)} ${predictionLabel(prediction)}`;
  const balance = getUserBalance(ctx.from.id);
  const halfBalance = Math.round(balance / 2 * 100) / 100;

  setUserState(ctx.from.id, "bet", "select_amount", {
    fixtureId, homeTeam, awayTeam, leagueName,
    homeOdds, drawOdds, awayOdds,
    prediction, predLabel, odds,
  });

  const teamName = prediction === "home" ? homeTeam : prediction === "away" ? awayTeam : "Empate";

  await ctx.editMessageText(
    `🎯 *CONFIRMAR APUESTA*\n\n` +
    `⚽ ${homeTeam} vs ${awayTeam}\n` +
    `📌 Predicción: ${predLabel}${prediction !== "draw" ? " (" + teamName + ")" : ""}\n` +
    `📊 Cuota: ${odds}\n\n` +
    `💰 Tu saldo: ${formatBalance(balance)}\n\n` +
    `¿Cuánto quieres apostar?`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text(`💰 Todo (${formatBalance(balance)})`, "bet:stake:all")
        .text(`50% (${formatBalance(halfBalance)})`, "bet:stake:half")
        .row()
        .text("✏️ Otra cantidad", "bet:stake:custom")
        .row()
        .text("❌ Cancelar", "menu:bet"),
    }
  );
});

bot.callbackQuery(/^bet:stake:(all|half|custom)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const stakeType = ctx.match[1];
  const state = getUserState(ctx.from.id);

  if (!state || state.action !== "bet" || state.step !== "select_amount") {
    await ctx.editMessageText("❌ Sesión expirada. Empieza de nuevo.", { reply_markup: backToMenuKeyboard() });
    return;
  }

  const balance = getUserBalance(ctx.from.id);
  const { fixtureId, homeTeam, awayTeam, leagueName, prediction, predLabel, odds } = state.data;

  if (stakeType === "custom") {
    setUserState(ctx.from.id, "bet", "enter_amount", state.data);
    await ctx.editMessageText(
      `🎯 *APUESTA*\n\n` +
      `⚽ ${homeTeam} vs ${awayTeam}\n` +
      `📌 Predicción: ${predLabel}\n` +
      `📊 Cuota: ${odds}\n\n` +
      `Escribe la cantidad de créditos que quieres apostar:\n\n` +
      `💰 Tu saldo: ${formatBalance(balance)}`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard().text("❌ Cancelar", "menu:bet"),
      }
    );
    return;
  }

  const stake = stakeType === "all" ? balance : Math.round(balance / 2 * 100) / 100;

  if (stake <= 0) {
    await ctx.answerCallbackQuery("❌ No tienes saldo suficiente", { show_alert: true });
    return;
  }

  // Show confirmation
  const potentialWin = Math.round(stake * odds * 100) / 100;

  setUserState(ctx.from.id, "bet", "confirm", {
    ...state.data, stake, potentialWin,
  });

  await ctx.editMessageText(
    `📋 *CONFIRMAR APUESTA*\n\n` +
    `⚽ ${homeTeam} vs ${awayTeam}\n` +
    (leagueName ? `🏆 ${leagueName}\n` : "") +
    `📌 Predicción: ${predLabel}\n` +
    `📊 Cuota: ${odds}\n` +
    `🪙 Apostar: ${formatBalance(stake)}\n` +
    `🏆 Ganancia potencial: ${formatBalance(potentialWin)}\n\n` +
    `¿Confirmar esta apuesta?`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text("✅ Confirmar", "bet:confirm")
        .text("❌ Cancelar", "menu:bet"),
    }
  );
});

bot.callbackQuery("bet:confirm", async (ctx) => {
  await ctx.answerCallbackQuery();
  const state = getUserState(ctx.from.id);

  if (!state || state.action !== "bet" || state.step !== "confirm") {
    await ctx.editMessageText("❌ Sesión expirada. Empieza de nuevo.", { reply_markup: backToMenuKeyboard() });
    return;
  }

  const { fixtureId, homeTeam, awayTeam, leagueName, prediction, predLabel, odds, stake, potentialWin } = state.data;

  const result = createBet(
    ctx.from.id, fixtureId, homeTeam, awayTeam, leagueName,
    prediction, predLabel, odds, stake
  );

  if (!result) {
    await ctx.editMessageText(
      "❌ Error al crear la apuesta. Verifica tu saldo.",
      { reply_markup: backToMenuKeyboard() }
    );
    clearUserState(ctx.from.id);
    return;
  }

  clearUserState(ctx.from.id);

  await ctx.editMessageText(
    `✅ *¡APUESTA REALIZADA!*\n\n` +
    `⚽ ${homeTeam} vs ${awayTeam}\n` +
    `📌 Predicción: ${predLabel}\n` +
    `📊 Cuota: ${odds}\n` +
    `🪙 Apostado: ${formatBalance(stake)}\n` +
    `🏆 Ganancia potencial: ${formatBalance(potentialWin)}\n` +
    `📋 ID: #${result.betId}\n\n` +
    `⏳ El resultado se actualizará cuando el partido termine.`,
    { parse_mode: "Markdown", reply_markup: backToMenuKeyboard() }
  );

  // Notify admins about large bets
  if (stake >= 1) {
    const user = getUser(ctx.from.id);
    await notifyAdmins(
      `⚽ *Nueva apuesta grande*\n\n` +
      `👤 ${user.first_name} (@${user.username || "N/A"}) [ID: ${ctx.from.id}]\n` +
      `⚽ ${homeTeam} vs ${awayTeam}\n` +
      `📌 ${predLabel} @ ${odds}\n` +
      `🪙 ${formatBalance(stake)} → ${formatBalance(potentialWin)}\n` +
      `📋 ID: #${result.betId}`,
      { parse_mode: "Markdown" }
    );
  }
});

// ============ HISTORY ============

bot.callbackQuery("menu:history", async (ctx) => {
  await ctx.answerCallbackQuery();
  const bets = getUserBets(ctx.from.id, 10);

  if (bets.length === 0) {
    await ctx.editMessageText(
      "📊 *MIS APUESTAS*\n\nNo tienes apuestas todavía.\n\n¡Apostar con ⚽ Apostar!",
      { parse_mode: "Markdown", reply_markup: backToMenuKeyboard() }
    );
    return;
  }

  let message = "📊 *MIS APUESTAS*\n\n";
  for (const bet of bets) {
    const emoji = statusEmoji(bet.status);
    message += `${emoji} #${bet.id} | ${bet.home_team} vs ${bet.away_team}\n`;
    message += `   ${bet.prediction_label} @ ${bet.odds} | ${formatBalance(bet.stake)} → ${formatBalance(bet.potential_win)}\n\n`;
  }

  await ctx.editMessageText(message, {
    parse_mode: "Markdown",
    reply_markup: backToMenuKeyboard(),
  });
});

// ============ ADMIN PANEL ============

bot.callbackQuery("menu:admin", async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    await ctx.answerCallbackQuery("❌ Solo administradores", { show_alert: true });
    return;
  }
  await ctx.answerCallbackQuery();

  const stats = getStats();

  await ctx.editMessageText(
    `🔧 *PANEL DE ADMINISTRACIÓN*\n\n` +
    `📥 Depósitos pendientes: ${stats.pendingDeposits}\n` +
    `📤 Retiros pendientes: ${stats.pendingWithdrawals}\n` +
    `⏳ Apuestas pendientes: ${stats.pendingBets}\n` +
    `👥 Usuarios: ${stats.totalUsers}\n\n` +
    `Selecciona una opción:`,
    { parse_mode: "Markdown", reply_markup: adminMenuKeyboard() }
  );
});

// Admin: Deposits
bot.callbackQuery("adm:deposits", async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    await ctx.answerCallbackQuery("❌ Solo administradores", { show_alert: true });
    return;
  }
  await ctx.answerCallbackQuery();

  const deposits = getPendingDeposits();

  if (deposits.length === 0) {
    await ctx.editMessageText(
      "📥 *DEPÓSITOS PENDIENTES*\n\n✅ No hay depósitos pendientes.",
      { parse_mode: "Markdown", reply_markup: adminMenuKeyboard() }
    );
    return;
  }

  await ctx.editMessageText(
    `📥 *DEPÓSITOS PENDIENTES*\n\nMostrando ${deposits.length} depósito(s)...`,
    { parse_mode: "Markdown", reply_markup: adminMenuKeyboard() }
  );

  // Send each deposit as a separate message
  for (const dep of deposits) {
    const userName = dep.first_name || "Usuario";
    const userUsername = dep.username || "";
    const hasScreenshot = dep.screenshot_file_id && dep.screenshot_file_id.length > 0;

    const caption =
      `📥 *DEPÓSITO #${dep.id}*\n\n` +
      `👤 ${userName}${userUsername ? " @" + userUsername : ""} [ID: ${dep.user_id}]\n` +
      `📱 Método: ${methodName(dep.method)}\n` +
      `💵 Monto: ${dep.amount_cup} CUP\n` +
      `🪙 Créditos: ${formatBalance(dep.credits)}\n` +
      `📸 Captura: ${hasScreenshot ? "✅ Sí" : "⚠️ NO"}\n` +
      `📅 ${dep.created_at}`;

    const kb = new InlineKeyboard()
      .text("✅ Aprobar", `adep:${dep.id}:ok`)
      .text("❌ Rechazar", `adep:${dep.id}:no`);

    try {
      if (hasScreenshot) {
        // Send screenshot with info
        await bot.api.sendPhoto(ctx.from.id, dep.screenshot_file_id, {
          caption,
          parse_mode: "Markdown",
          reply_markup: kb,
        });
      } else {
        // Send as text
        await bot.api.sendMessage(ctx.from.id, caption, {
          parse_mode: "Markdown",
          reply_markup: kb,
        });
      }
    } catch (e) {
      console.error("Error sending deposit info:", e.message);
      // Fallback: send as text without screenshot
      try {
        await bot.api.sendMessage(ctx.from.id, caption, {
          parse_mode: "Markdown",
          reply_markup: kb,
        });
      } catch (e2) {
        console.error("Error sending deposit info (fallback):", e2.message);
      }
    }
  }
});

// Admin: Approve/Reject deposit
bot.callbackQuery(/^adep:(\d+):(ok|no)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    await ctx.answerCallbackQuery("❌ Solo administradores", { show_alert: true });
    return;
  }
  await ctx.answerCallbackQuery();

  const depositId = Number(ctx.match[1]);
  const action = ctx.match[2];
  const deposit = getDepositById(depositId);

  if (!deposit || deposit.status !== "pending") {
    await ctx.answerCallbackQuery("❌ Ya procesado o no encontrado", { show_alert: true });
    return;
  }

  if (action === "ok") {
    const result = approveDeposit(depositId, ctx.from.id);
    if (!result) {
      await ctx.answerCallbackQuery("❌ Error al aprobar", { show_alert: true });
      return;
    }

    // Update admin message
    try {
      const hasScreenshot = deposit.screenshot_file_id && deposit.screenshot_file_id.length > 0;
      if (hasScreenshot) {
        await bot.api.editMessageCaption(
          ctx.from.id, ctx.msg.message_id,
          `✅ *DEPÓSITO #${depositId} APROBADO*\n\n` +
          `👤 [ID: ${deposit.user_id}]\n` +
          `💵 ${deposit.amount_cup} CUP → ${formatBalance(deposit.credits)}\n` +
          `✅ Por: Admin ${ctx.from.first_name}`,
          { parse_mode: "Markdown" }
        );
      } else {
        await ctx.editMessageText(
          `✅ *DEPÓSITO #${depositId} APROBADO*\n\n` +
          `👤 [ID: ${deposit.user_id}]\n` +
          `💵 ${deposit.amount_cup} CUP → ${formatBalance(deposit.credits)}\n` +
          `✅ Por: Admin ${ctx.from.first_name}`,
          { parse_mode: "Markdown" }
        );
      }
    } catch (e) {
      // Message might not be editable, ignore
    }

    // Notify user
    try {
      await bot.api.sendMessage(
        deposit.user_id,
        `✅ *¡Depósito aprobado!*\n\n` +
        `📋 ID: #${depositId}\n` +
        `🪙 Créditos acreditados: ${formatBalance(deposit.credits)}\n` +
        `💰 Nuevo saldo: ${formatBalance(getUserBalance(deposit.user_id))}`,
        { parse_mode: "Markdown" }
      );
    } catch (e) { /* user might have blocked bot */ }
  } else {
    const result = rejectDeposit(depositId, ctx.from.id);
    if (!result) {
      await ctx.answerCallbackQuery("❌ Error al rechazar", { show_alert: true });
      return;
    }

    // Update admin message
    try {
      const hasScreenshot = deposit.screenshot_file_id && deposit.screenshot_file_id.length > 0;
      if (hasScreenshot) {
        await bot.api.editMessageCaption(
          ctx.from.id, ctx.msg.message_id,
          `❌ *DEPÓSITO #${depositId} RECHAZADO*\n\n` +
          `👤 [ID: ${deposit.user_id}]\n` +
          `💵 ${deposit.amount_cup} CUP\n` +
          `❌ Por: Admin ${ctx.from.first_name}`,
          { parse_mode: "Markdown" }
        );
      } else {
        await ctx.editMessageText(
          `❌ *DEPÓSITO #${depositId} RECHAZADO*\n\n` +
          `👤 [ID: ${deposit.user_id}]\n` +
          `💵 ${deposit.amount_cup} CUP\n` +
          `❌ Por: Admin ${ctx.from.first_name}`,
          { parse_mode: "Markdown" }
        );
      }
    } catch (e) { /* ignore */ }

    // Notify user
    try {
      await bot.api.sendMessage(
        deposit.user_id,
        `❌ *Depósito rechazado*\n\n` +
        `📋 ID: #${depositId}\n` +
        `💵 Monto: ${deposit.amount_cup} CUP\n\n` +
        `Si crees que es un error, contacta a soporte.`,
        { parse_mode: "Markdown" }
      );
    } catch (e) { /* ignore */ }
  }
});

// Admin: Withdrawals
bot.callbackQuery("adm:withdrawals", async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    await ctx.answerCallbackQuery("❌ Solo administradores", { show_alert: true });
    return;
  }
  await ctx.answerCallbackQuery();

  const withdrawals = getPendingWithdrawals();

  if (withdrawals.length === 0) {
    await ctx.editMessageText(
      "📤 *RETIROS PENDIENTES*\n\n✅ No hay retiros pendientes.",
      { parse_mode: "Markdown", reply_markup: adminMenuKeyboard() }
    );
    return;
  }

  await ctx.editMessageText(
    `📤 *RETIROS PENDIENTES*\n\nMostrando ${withdrawals.length} retiro(s)...`,
    { parse_mode: "Markdown", reply_markup: adminMenuKeyboard() }
  );

  for (const wd of withdrawals) {
    const userName = wd.first_name || "Usuario";
    const userUsername = wd.username || "";

    const text =
      `📤 *RETIRO #${wd.id}*\n\n` +
      `👤 ${userName}${userUsername ? " @" + userUsername : ""} [ID: ${wd.user_id}]\n` +
      `📱 Método: ${methodName(wd.method)}\n` +
      `🪙 Créditos: ${formatBalance(wd.amount_credits)}\n` +
      `💵 CUP: ${wd.amount_cup}\n` +
      `📞 Teléfono: ${wd.phone || "N/A"}\n` +
      (wd.account ? `🏦 Cuenta: ${wd.account}\n` : "") +
      `📅 ${wd.created_at}`;

    const kb = new InlineKeyboard()
      .text("✅ Aprobar", `aret:${wd.id}:ok`)
      .text("❌ Rechazar", `aret:${wd.id}:no`);

    try {
      await bot.api.sendMessage(ctx.from.id, text, {
        parse_mode: "Markdown",
        reply_markup: kb,
      });
    } catch (e) {
      console.error("Error sending withdrawal info:", e.message);
    }
  }
});

// Admin: Approve/Reject withdrawal
bot.callbackQuery(/^aret:(\d+):(ok|no)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    await ctx.answerCallbackQuery("❌ Solo administradores", { show_alert: true });
    return;
  }
  await ctx.answerCallbackQuery();

  const withdrawalId = Number(ctx.match[1]);
  const action = ctx.match[2];
  const withdrawal = getWithdrawalById(withdrawalId);

  if (!withdrawal || withdrawal.status !== "pending") {
    await ctx.answerCallbackQuery("❌ Ya procesado o no encontrado", { show_alert: true });
    return;
  }

  if (action === "ok") {
    const result = approveWithdrawal(withdrawalId, ctx.from.id);
    if (!result) {
      await ctx.answerCallbackQuery("❌ Error al aprobar", { show_alert: true });
      return;
    }

    try {
      await ctx.editMessageText(
        `✅ *RETIRO #${withdrawalId} APROBADO*\n\n` +
        `👤 [ID: ${withdrawal.user_id}]\n` +
        `🪙 ${formatBalance(withdrawal.amount_credits)} → ${withdrawal.amount_cup} CUP\n` +
        `✅ Por: Admin ${ctx.from.first_name}`,
        { parse_mode: "Markdown" }
      );
    } catch (e) { /* ignore */ }

    try {
      await bot.api.sendMessage(
        withdrawal.user_id,
        `✅ *¡Retiro aprobado!*\n\n` +
        `📋 ID: #${withdrawalId}\n` +
        `🪙 Créditos: ${formatBalance(withdrawal.amount_credits)}\n` +
        `💵 Recibirás: ${withdrawal.amount_cup} CUP\n` +
        `📱 Método: ${methodName(withdrawal.method)}\n` +
        `📞 Destino: ${withdrawal.phone || "N/A"}`,
        { parse_mode: "Markdown" }
      );
    } catch (e) { /* ignore */ }
  } else {
    const result = rejectWithdrawal(withdrawalId, ctx.from.id);
    if (!result) {
      await ctx.answerCallbackQuery("❌ Error al rechazar", { show_alert: true });
      return;
    }

    try {
      await ctx.editMessageText(
        `❌ *RETIRO #${withdrawalId} RECHAZADO*\n\n` +
        `👤 [ID: ${withdrawal.user_id}]\n` +
        `🪙 ${formatBalance(withdrawal.amount_credits)} devueltos\n` +
        `❌ Por: Admin ${ctx.from.first_name}`,
        { parse_mode: "Markdown" }
      );
    } catch (e) { /* ignore */ }

    try {
      await bot.api.sendMessage(
        withdrawal.user_id,
        `❌ *Retiro rechazado*\n\n` +
        `📋 ID: #${withdrawalId}\n` +
        `🪙 Tus ${formatBalance(withdrawal.amount_credits)} créditos han sido devueltos.\n` +
        `💰 Nuevo saldo: ${formatBalance(getUserBalance(withdrawal.user_id))}`,
        { parse_mode: "Markdown" }
      );
    } catch (e) { /* ignore */ }
  }
});

// Admin: Bets
bot.callbackQuery("adm:bets", async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    await ctx.answerCallbackQuery("❌ Solo administradores", { show_alert: true });
    return;
  }
  await ctx.answerCallbackQuery();

  const bets = getPendingBets();

  if (bets.length === 0) {
    await ctx.editMessageText(
      "⏳ *APUESTAS PENDIENTES*\n\n✅ No hay apuestas pendientes de resolver.",
      { parse_mode: "Markdown", reply_markup: adminMenuKeyboard() }
    );
    return;
  }

  await ctx.editMessageText(
    `⏳ *APUESTAS PENDIENTES*\n\nMostrando ${bets.length} apuesta(s)...`,
    { parse_mode: "Markdown", reply_markup: adminMenuKeyboard() }
  );

  for (const bet of bets) {
    const userName = bet.first_name || "Usuario";
    const userUsername = bet.username || "";

    const text =
      `⏳ *APUESTA #${bet.id}*\n\n` +
      `👤 ${userName}${userUsername ? " @" + userUsername : ""} [ID: ${bet.user_id}]\n` +
      `⚽ ${bet.home_team} vs ${bet.away_team}\n` +
      (bet.league_name ? `🏆 ${bet.league_name}\n` : "") +
      `📌 Predicción: ${bet.prediction_label}\n` +
      `📊 Cuota: ${bet.odds}\n` +
      `🪙 Apostado: ${formatBalance(bet.stake)}\n` +
      `🏆 Posible ganancia: ${formatBalance(bet.potential_win)}\n` +
      `📅 ${bet.created_at}`;

    const kb = new InlineKeyboard()
      .text("🏆 Ganó", `abet:${bet.id}:won`)
      .text("❌ Perdió", `abet:${bet.id}:lost`)
      .row()
      .text("↩️ Anular", `abet:${bet.id}:void`);

    try {
      await bot.api.sendMessage(ctx.from.id, text, {
        parse_mode: "Markdown",
        reply_markup: kb,
      });
    } catch (e) {
      console.error("Error sending bet info:", e.message);
    }
  }
});

// Admin: Settle bet
bot.callbackQuery(/^abet:(\d+):(won|lost|void)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    await ctx.answerCallbackQuery("❌ Solo administradores", { show_alert: true });
    return;
  }
  await ctx.answerCallbackQuery();

  const betId = Number(ctx.match[1]);
  const status = ctx.match[2];
  const bet = getBetById(betId);

  if (!bet || bet.status !== "pending") {
    await ctx.answerCallbackQuery("❌ Ya resuelta o no encontrada", { show_alert: true });
    return;
  }

  const result = settleBet(betId, status, `Admin ${ctx.from.first_name} resolvió como ${status}`);
  if (!result) {
    await ctx.answerCallbackQuery("❌ Error al resolver", { show_alert: true });
    return;
  }

  const statusText = status === "won" ? "✅ GANÓ" : status === "lost" ? "❌ PERDIÓ" : "↩️ ANULADA";

  try {
    await ctx.editMessageText(
      `${statusText} *APUESTA #${betId}*\n\n` +
      `⚽ ${bet.home_team} vs ${bet.away_team}\n` +
      `📌 ${bet.prediction_label} @ ${bet.odds}\n` +
      `🪙 ${formatBalance(bet.stake)}\n\n` +
      `Resuelta por: Admin ${ctx.from.first_name}`,
      { parse_mode: "Markdown" }
    );
  } catch (e) { /* ignore */ }

  // Notify user
  try {
    let msg;
    if (status === "won") {
      msg = `🎉 *¡GANASTE!*\n\n` +
        `📋 Apuesta #${betId}\n` +
        `⚽ ${bet.home_team} vs ${bet.away_team}\n` +
        `📌 ${bet.prediction_label} @ ${bet.odds}\n` +
        `🏆 Ganancia: ${formatBalance(bet.potential_win)}\n` +
        `💰 Nuevo saldo: ${formatBalance(getUserBalance(bet.user_id))}`;
    } else if (status === "lost") {
      msg = `😞 *Perdiste*\n\n` +
        `📋 Apuesta #${betId}\n` +
        `⚽ ${bet.home_team} vs ${bet.away_team}\n` +
        `📌 ${bet.prediction_label} @ ${bet.odds}\n` +
        `🪙 Perdiste: ${formatBalance(bet.stake)}`;
    } else {
      msg = `↩️ *Apuesta anulada*\n\n` +
        `📋 Apuesta #${betId}\n` +
        `⚽ ${bet.home_team} vs ${bet.away_team}\n` +
        `🪙 Devueltos: ${formatBalance(bet.stake)}\n` +
        `💰 Nuevo saldo: ${formatBalance(getUserBalance(bet.user_id))}`;
    }
    await bot.api.sendMessage(bet.user_id, msg, { parse_mode: "Markdown" });
  } catch (e) { /* ignore */ }
});

// Admin: Add balance
bot.callbackQuery("adm:addsaldo", async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    await ctx.answerCallbackQuery("❌ Solo administradores", { show_alert: true });
    return;
  }
  await ctx.answerCallbackQuery();

  setUserState(ctx.from.id, "admin_addsaldo", "userid", {});

  await ctx.editMessageText(
    `👤 *AÑADIR SALDO*\n\n` +
    `Escribe el ID de Telegram del usuario:\n\n` +
    `💡 Puedes obtener el ID pidiéndole al usuario que escriba /start`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard().text("❌ Cancelar", "menu:admin"),
    }
  );
});

// Admin: Stats
bot.callbackQuery("adm:stats", async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    await ctx.answerCallbackQuery("❌ Solo administradores", { show_alert: true });
    return;
  }
  await ctx.answerCallbackQuery();

  const stats = getStats();

  await ctx.editMessageText(
    `📊 *ESTADÍSTICAS DEL BOT*\n\n` +
    `👥 *Usuarios*\n` +
    `   Total: ${stats.totalUsers}\n` +
    `   Activos: ${stats.activeUsers}\n` +
    `   Saldo total: ${formatBalance(stats.totalBalance)}\n\n` +
    `📥 *Depósitos*\n` +
    `   Aprobados: ${stats.totalDeposits.count} (${stats.totalDeposits.total_cup.toFixed(0)} CUP)\n` +
    `   Pendientes: ${stats.pendingDeposits}\n\n` +
    `📤 *Retiros*\n` +
    `   Aprobados: ${stats.totalWithdrawals.count} (${stats.totalWithdrawals.total_cup.toFixed(0)} CUP)\n` +
    `   Pendientes: ${stats.pendingWithdrawals}\n\n` +
    `⚽ *Apuestas*\n` +
    `   Total: ${stats.totalBets.count} (${formatBalance(stats.totalBets.total_stake)} apostados)\n` +
    `   Pendientes: ${stats.pendingBets}\n` +
    `   Ganadas: ${stats.wonBets}\n` +
    `   Perdidas: ${stats.lostBets}`,
    { parse_mode: "Markdown", reply_markup: adminMenuKeyboard() }
  );
});

// ============ PHOTO HANDLER (SCREENSHOTS) ============

bot.on("message:photo", async (ctx) => {
  const state = getUserState(ctx.from.id);

  if (!state || state.action !== "deposit" || state.step !== "screenshot") {
    // Not in deposit flow - ignore or give hint
    if (isAdmin(ctx.from.id)) return; // Admins can send photos freely
    await ctx.reply("📸 ¿Quieres depositar? Usa 📥 Depositar en el menú principal.", {
      reply_markup: backToMenuKeyboard(),
    });
    return;
  }

  const { method, amountCup, credits } = state.data;

  // Get the highest resolution photo
  const photos = ctx.message.photo;
  const fileId = photos[photos.length - 1].file_id;

  // Create deposit with screenshot
  const depositId = createDeposit(ctx.from.id, method, amountCup, credits, fileId, "");
  clearUserState(ctx.from.id);

  await ctx.reply(
    `✅ *¡Depósito registrado!*\n\n` +
    `📋 ID: #${depositId}\n` +
    `💵 Monto: ${amountCup} CUP\n` +
    `🪙 Créditos: ${formatBalance(credits)}\n` +
    `📱 Método: ${methodName(method)}\n` +
    `📸 Captura: ✅ Recibida\n\n` +
    `⏳ Un administrador revisará tu depósito pronto.\n` +
    `Recibirás un mensaje cuando sea aprobado.`,
    { parse_mode: "Markdown", reply_markup: backToMenuKeyboard() }
  );

  // Notify all admins with screenshot
  const user = getUser(ctx.from.id);
  for (const adminId of ADMIN_IDS) {
    try {
      await bot.api.sendPhoto(adminId, fileId, {
        caption:
          `📥 *Nuevo depósito #${depositId}*\n\n` +
          `👤 ${user.first_name}${user.username ? " @" + user.username : ""} [ID: ${ctx.from.id}]\n` +
          `📱 Método: ${methodName(method)}\n` +
          `💵 Monto: ${amountCup} CUP\n` +
          `🪙 Créditos: ${formatBalance(credits)}`,
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .text("✅ Aprobar", `adep:${depositId}:ok`)
          .text("❌ Rechazar", `adep:${depositId}:no`),
      });
    } catch (e) {
      console.error(`Failed to notify admin ${adminId}:`, e.message);
    }
  }
});

// ============ TEXT HANDLER (MULTI-STEP FLOWS) ============

bot.on("message:text", async (ctx) => {
  const state = getUserState(ctx.from.id);
  if (!state) return; // No active state, ignore

  const text = ctx.message.text.trim();

  // --- DEPOSIT: Enter custom amount ---
  if (state.action === "deposit" && state.step === "enter_amount") {
    const amountCup = Number(text.replace(",", "."));
    const method = state.data.method;
    const minAmount = method === "transfermovil" ? MIN_DEPOSIT_CUP : MIN_DEPOSIT_SALDO;

    if (isNaN(amountCup) || amountCup < minAmount) {
      await ctx.reply(`❌ Monto inválido. El mínimo es ${minAmount} CUP.`);
      return;
    }

    const credits = cupToCredits(amountCup);
    setUserState(ctx.from.id, "deposit", "screenshot", { method, amountCup, credits });

    let instructions = `📥 *DEPÓSITO POR ${methodName(method).toUpperCase()}*\n\n` +
      `💵 Monto: ${amountCup} CUP\n` +
      `🪙 Recibirás: ${formatBalance(credits)}\n\n`;

    if (method === "transfermovil") {
      instructions +=
        `*Datos para transferir:*\n` +
        `📱 Teléfono: ${TRANSFER_PHONE}\n` +
        `🏦 Cuenta: ${TRANSFER_CUP_ACCOUNT}\n\n`;
    } else {
      instructions +=
        `*Envía saldo a:*\n` +
        `📱 Teléfono: ${TRANSFER_PHONE}\n\n`;
    }

    instructions +=
      `📸 *IMPORTANTE:* Después de hacer la transferencia, envía una captura de pantalla del comprobante aquí.\n\n` +
      `⚠️ Sin captura no se aprobará el depósito.`;

    await ctx.reply(instructions, {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text("⏭️ Sin captura", "dep:noscreen")
        .text("❌ Cancelar", "menu:deposit"),
    });
    return;
  }

  // --- WITHDRAW: Enter custom amount ---
  if (state.action === "withdraw" && state.step === "enter_amount") {
    const credits = Number(text.replace(",", "."));
    const method = state.data.method;
    const balance = getUserBalance(ctx.from.id);

    if (isNaN(credits) || credits <= 0) {
      await ctx.reply("❌ Cantidad inválida. Escribe un número positivo.");
      return;
    }

    if (credits > balance) {
      await ctx.reply(`❌ No tienes suficiente saldo. Tu saldo: ${formatBalance(balance)}`);
      return;
    }

    // Ask for phone number
    setUserState(ctx.from.id, "withdraw", "phone", { method, credits });
    await ctx.reply(
      `📤 *RETIRO POR ${methodName(method).toUpperCase()}*\n\n` +
      `🪙 Créditos: ${formatBalance(credits)}\n` +
      `💵 Recibirás: ${creditsToCup(credits).toFixed(0)} CUP\n\n` +
      `Escribe tu número de teléfono:`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard().text("❌ Cancelar", "menu:withdraw"),
      }
    );
    return;
  }

  // --- WITHDRAW: Enter phone number ---
  if (state.action === "withdraw" && state.step === "phone") {
    const phone = text;
    const { method, credits } = state.data;

    if (method === "transfermovil") {
      // Need account number too
      setUserState(ctx.from.id, "withdraw", "account", { method, credits, phone });
      await ctx.reply(
        `📱 Teléfono: ${phone}\n\n` +
        `Ahora escribe tu número de cuenta bancaria:`,
        {
          reply_markup: new InlineKeyboard().text("❌ Cancelar", "menu:withdraw"),
        }
      );
      return;
    }

    // Saldo Móvil - just need phone, create withdrawal
    const amountCup = creditsToCup(credits);
    const withdrawalId = createWithdrawal(ctx.from.id, method, credits, amountCup, phone, "");

    if (!withdrawalId) {
      await ctx.reply("❌ Error al crear el retiro. Verifica tu saldo.", { reply_markup: backToMenuKeyboard() });
      clearUserState(ctx.from.id);
      return;
    }

    clearUserState(ctx.from.id);

    await ctx.reply(
      `✅ *Solicitud de retiro creada*\n\n` +
      `📋 ID: #${withdrawalId}\n` +
      `🪙 Créditos: ${formatBalance(credits)}\n` +
      `💵 Recibirás: ${amountCup.toFixed(0)} CUP\n` +
      `📱 Método: ${methodName(method)}\n` +
      `📞 Teléfono: ${phone}\n\n` +
      `⏳ Un admin procesará tu retiro pronto.`,
      { parse_mode: "Markdown", reply_markup: backToMenuKeyboard() }
    );

    // Notify admins
    const user = getUser(ctx.from.id);
    await notifyAdmins(
      `📤 *Nuevo retiro #${withdrawalId}*\n\n` +
      `👤 ${user.first_name}${user.username ? " @" + user.username : ""} [ID: ${ctx.from.id}]\n` +
      `📱 Método: ${methodName(method)}\n` +
      `🪙 Créditos: ${formatBalance(credits)}\n` +
      `💵 CUP: ${amountCup.toFixed(0)}\n` +
      `📞 Teléfono: ${phone}`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .text("✅ Aprobar", `aret:${withdrawalId}:ok`)
          .text("❌ Rechazar", `aret:${withdrawalId}:no`),
      }
    );
    return;
  }

  // --- WITHDRAW: Enter account number ---
  if (state.action === "withdraw" && state.step === "account") {
    const account = text;
    const { method, credits, phone } = state.data;
    const amountCup = creditsToCup(credits);

    const withdrawalId = createWithdrawal(ctx.from.id, method, credits, amountCup, phone, account);

    if (!withdrawalId) {
      await ctx.reply("❌ Error al crear el retiro. Verifica tu saldo.", { reply_markup: backToMenuKeyboard() });
      clearUserState(ctx.from.id);
      return;
    }

    clearUserState(ctx.from.id);

    await ctx.reply(
      `✅ *Solicitud de retiro creada*\n\n` +
      `📋 ID: #${withdrawalId}\n` +
      `🪙 Créditos: ${formatBalance(credits)}\n` +
      `💵 Recibirás: ${amountCup.toFixed(0)} CUP\n` +
      `📱 Método: ${methodName(method)}\n` +
      `📞 Teléfono: ${phone}\n` +
      `🏦 Cuenta: ${account}\n\n` +
      `⏳ Un admin procesará tu retiro pronto.`,
      { parse_mode: "Markdown", reply_markup: backToMenuKeyboard() }
    );

    // Notify admins
    const user = getUser(ctx.from.id);
    await notifyAdmins(
      `📤 *Nuevo retiro #${withdrawalId}*\n\n` +
      `👤 ${user.first_name}${user.username ? " @" + user.username : ""} [ID: ${ctx.from.id}]\n` +
      `📱 Método: ${methodName(method)}\n` +
      `🪙 Créditos: ${formatBalance(credits)}\n` +
      `💵 CUP: ${amountCup.toFixed(0)}\n` +
      `📞 Teléfono: ${phone}\n` +
      `🏦 Cuenta: ${account}`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .text("✅ Aprobar", `aret:${withdrawalId}:ok`)
          .text("❌ Rechazar", `aret:${withdrawalId}:no`),
      }
    );
    return;
  }

  // --- BET: Enter custom amount ---
  if (state.action === "bet" && state.step === "enter_amount") {
    const stake = Number(text.replace(",", "."));
    const balance = getUserBalance(ctx.from.id);

    if (isNaN(stake) || stake <= 0) {
      await ctx.reply("❌ Cantidad inválida. Escribe un número positivo (ej: 0.5 o 1)");
      return;
    }

    if (stake > balance) {
      await ctx.reply(`❌ No tienes suficiente saldo. Tu saldo: ${formatBalance(balance)}`);
      return;
    }

    const { fixtureId, homeTeam, awayTeam, leagueName, prediction, predLabel, odds } = state.data;
    const potentialWin = Math.round(stake * odds * 100) / 100;

    setUserState(ctx.from.id, "bet", "confirm", {
      ...state.data, stake, potentialWin,
    });

    await ctx.reply(
      `📋 *CONFIRMAR APUESTA*\n\n` +
      `⚽ ${homeTeam} vs ${awayTeam}\n` +
      (leagueName ? `🏆 ${leagueName}\n` : "") +
      `📌 Predicción: ${predLabel}\n` +
      `📊 Cuota: ${odds}\n` +
      `🪙 Apostar: ${formatBalance(stake)}\n` +
      `🏆 Ganancia potencial: ${formatBalance(potentialWin)}\n\n` +
      `¿Confirmar esta apuesta?`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .text("✅ Confirmar", "bet:confirm")
          .text("❌ Cancelar", "menu:bet"),
      }
    );
    return;
  }

  // --- ADMIN: Add saldo - enter user ID ---
  if (state.action === "admin_addsaldo" && state.step === "userid") {
    const targetUserId = Number(text);

    if (isNaN(targetUserId) || targetUserId <= 0) {
      await ctx.reply("❌ ID inválido. Escribe un número de ID de Telegram válido.");
      return;
    }

    const targetUser = getUser(targetUserId);

    setUserState(ctx.from.id, "admin_addsaldo", "amount", { targetUserId });

    await ctx.reply(
      `👤 *Usuario encontrado:*\n\n` +
      (targetUser
        ? ` Nombre: ${targetUser.first_name}\n Username: @${targetUser.username || "N/A"}\n Saldo: ${formatBalance(targetUser.balance)}\n ID: ${targetUserId}`
        : `⚠️ Usuario ID ${targetUserId} no encontrado en la base de datos.\n Se creará automáticamente.`) +
      `\n\nEscribe la cantidad de créditos a añadir:`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard().text("❌ Cancelar", "menu:admin"),
      }
    );
    return;
  }

  // --- ADMIN: Add saldo - enter amount ---
  if (state.action === "admin_addsaldo" && state.step === "amount") {
    const amount = Number(text.replace(",", "."));

    if (isNaN(amount) || amount <= 0) {
      await ctx.reply("❌ Cantidad inválida. Escribe un número positivo.");
      return;
    }

    const { targetUserId } = state.data;

    setUserState(ctx.from.id, "admin_addsaldo", "confirm", { targetUserId, amount });

    const targetUser = getUser(targetUserId);

    await ctx.reply(
      `👤 *CONFIRMAR AÑADIR SALDO*\n\n` +
      `👤 Usuario: ${targetUser ? targetUser.first_name : "ID " + targetUserId}${targetUser?.username ? " @" + targetUser.username : ""}\n` +
      `🪙 Cantidad: ${formatBalance(amount)}\n` +
      `💵 Equivale a: ${creditsToCup(amount).toFixed(0)} CUP\n\n` +
      `¿Confirmar?`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .text("✅ Confirmar", "adm:addsaldo_confirm")
          .text("❌ Cancelar", "menu:admin"),
      }
    );
    return;
  }
});

// Admin: Confirm add saldo
bot.callbackQuery("adm:addsaldo_confirm", async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    await ctx.answerCallbackQuery("❌ Solo administradores", { show_alert: true });
    return;
  }
  await ctx.answerCallbackQuery();

  const state = getUserState(ctx.from.id);
  if (!state || state.action !== "admin_addsaldo" || state.step !== "confirm") {
    await ctx.editMessageText("❌ Sesión expirada.", { reply_markup: adminMenuKeyboard() });
    return;
  }

  const { targetUserId, amount } = state.data;

  ensureUser(targetUserId);
  addBalance(targetUserId, amount);

  clearUserState(ctx.from.id);

  await ctx.editMessageText(
    `✅ *SALDO AÑADIDO*\n\n` +
    `👤 Usuario ID: ${targetUserId}\n` +
    `🪙 Cantidad: ${formatBalance(amount)}\n` +
    `💵 Equivale a: ${creditsToCup(amount).toFixed(0)} CUP\n` +
    `💰 Nuevo saldo: ${formatBalance(getUserBalance(targetUserId))}\n\n` +
    `✅ Por: Admin ${ctx.from.first_name}`,
    { parse_mode: "Markdown", reply_markup: adminMenuKeyboard() }
  );

  // Notify user
  try {
    await bot.api.sendMessage(
      targetUserId,
      `💰 *Saldo añadido*\n\n` +
      `🪙 Créditos: ${formatBalance(amount)}\n` +
      `💰 Nuevo saldo: ${formatBalance(getUserBalance(targetUserId))}`,
      { parse_mode: "Markdown" }
    );
  } catch (e) { /* user might have blocked bot */ }
});

// ============ EXPRESS SERVER + WEBHOOK ============

const app = express();
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    bot: "betting-bot",
    version: "2.0",
    admins: ADMIN_IDS.length,
    time: new Date().toISOString(),
  });
});

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Servidor en el puerto ${PORT}`);

  if (RENDER_URL) {
    try {
      await bot.init();
      const webhookUrl = `${RENDER_URL}/webhook`;
      await bot.api.setWebhook(webhookUrl);
      console.log(`✅ Webhook: ${webhookUrl}`);
    } catch (error) {
      console.error("❌ Error al configurar webhook:", error);
    }
  } else {
    console.log("⚠️ RENDER_URL no configurado. Webhook no activo.");
  }

  console.log(`🔧 Admins: ${ADMIN_IDS.length} (${ADMIN_IDS.join(", ")})`);
});

console.log("🤖 Bot de apuestas comenzando...");
