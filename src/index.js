import express from "express";
import { Bot, InlineKeyboard } from "grammy";
import db from "./database.js";
import { getTodayFixtures, getFixtureOdds } from "./sports.js";
import {
  ensureUser,
  getBalance,
  createDeposit,
  confirmDeposit,
  approveDeposit,
  rejectDeposit,
  createWithdrawal,
  approveWithdrawal,
} from "./payments.js";
import {
  saveSelection,
  getSelection,
  clearSelection,
  placeBet,
  getBetHistory,
  settleBet,
} from "./betting.js";

// ============ CONFIGURACIÓN ============
const TOKEN = process.env.BOT_TOKEN || "";
const ADMIN_IDS = (process.env.ADMIN_IDS || "").split(",").map(Number);
const PORT = process.env.PORT || 3000;
const RENDER_URL = process.env.RENDER_URL || "";
const MIN_DEPOSIT = parseInt(process.env.MIN_DEPOSIT || "200");

// ============ EXPRESS (servidor web para Render) ============
const app = express();
app.use(express.json());

// Health check - Render necesita esto
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    bot: "running",
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});

// Webhook endpoint para Telegram
app.post(`/webhook/${TOKEN}`, async (req, res) => {
  await bot.handleUpdate(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor web en puerto ${PORT}`);
});

// ============ BOT DE TELEGRAM ============
const bot = new Bot(TOKEN);

// Configurar webhook si hay URL de Render
if (RENDER_URL) {
  bot.api.setWebhook(`${RENDER_URL}/webhook/${TOKEN}`).then(() => {
    console.log("✅ Webhook configurado");
  }).catch((err) => {
    console.error("❌ Error configurando webhook:", err);
  });
}

// ============ COMANDO /start ============
bot.command("start", async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || "";
  const firstName = ctx.from.first_name || "";

  ensureUser(userId, username, firstName);
  const balance = getBalance(userId);

  const keyboard = new InlineKeyboard()
    .text("💰 Depositar", "deposit")
    .text("⚽ Apostar", "bet_menu")
    .row()
    .text("📊 Balance", "balance")
    .text("💸 Retirar", "withdraw")
    .row()
    .text("📋 Historial", "history")
    .text("❓ Ayuda", "help");

  await ctx.reply(
    `👋 *Bienvenido al Bot de Apuestas!*\n\n` +
      `👤 ${firstName}\n` +
      `💵 Saldo: *${balance} créditos*\n\n` +
      `Selecciona una opción:`,
    { parse_mode: "Markdown", reply_markup: keyboard }
  );
});

// ============ DEPÓSITOS ============
bot.callbackQuery("deposit", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("📱 Saldo Móvil", "deposit_saldo")
    .text("🏦 Transferencia", "deposit_transfer")
    .row()
    .text("⬅️ Volver", "back_menu");

  await ctx.reply("💰 *DEPÓSITOS*\n\nSelecciona el método:", {
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("deposit_saldo", async (ctx) => {
  await ctx.reply(
    `📱 *DEPÓSITO POR SALDO MÓVIL*\n\n` +
      `Escribe:\n/depositar_saldo CANTIDAD\n\n` +
      `Ejemplo: /depositar_saldo 500\n\n` +
      `💰 Mínimo: ${MIN_DEPOSIT} CUP`,
    { parse_mode: "Markdown" }
  );
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("deposit_transfer", async (ctx) => {
  await ctx.reply(
    `🏦 *DEPÓSITO POR TRANSFERENCIA*\n\n` +
      `Escribe:\n/depositar_transfer CANTIDAD\n\n` +
      `Ejemplo: /depositar_transfer 500\n\n` +
      `💰 Mínimo: ${MIN_DEPOSIT} CUP`,
    { parse_mode: "Markdown" }
  );
  await ctx.answerCallbackQuery();
});

bot.command("depositar_saldo", async (ctx) => {
  const amount = parseFloat(ctx.match || "0");
  if (!amount || amount <= 0) {
    await ctx.reply("❌ Usa: /depositar_saldo CANTIDAD\n\nEjemplo: /depositar_saldo 500");
    return;
  }
  const result = createDeposit(ctx.from.id, "saldo_movil", amount);
  await ctx.reply(result.message, { parse_mode: "Markdown" });
});

bot.command("depositar_transfer", async (ctx) => {
  const amount = parseFloat(ctx.match || "0");
  if (!amount || amount <= 0) {
    await ctx.reply("❌ Usa: /depositar_transfer CANTIDAD\n\nEjemplo: /depositar_transfer 500");
    return;
  }
  const result = createDeposit(ctx.from.id, "transferencia", amount);
  await ctx.reply(result.message, { parse_mode: "Markdown" });
});

bot.command("depositado", async (ctx) => {
  const ref = ctx.match?.trim() || "";
  if (!ref) {
    await ctx.reply("❌ Usa: /depositado REFERENCIA\n\nEjemplo: /depositado ABC123");
    return;
  }

  const result = confirmDeposit(ctx.from.id, ref);
  await ctx.reply(result.message, { parse_mode: "Markdown" });

  if (result.success && result.depositId) {
    const deposit = db.prepare("SELECT * FROM deposits WHERE id = ?").get(result.depositId);
    for (const adminId of ADMIN_IDS) {
      try {
        await bot.api.sendMessage(
          adminId,
          `🔔 *DEPÓSITO PENDIENTE*\n\n` +
            `👤 ${ctx.from.first_name} (@${ctx.from.username})\n` +
            `📱 ID: ${ctx.from.id}\n` +
            `💵 ${deposit.amount_cup} CUP → ${deposit.amount_credit} créditos\n` +
            `📋 Método: ${deposit.method === "saldo_movil" ? "Saldo Móvil" : "Transferencia"}\n` +
            `🔑 Ref: ${ref}\n\n` +
            `✅ /aprobar ${deposit.id}\n` +
            `❌ /rechazar ${deposit.id}`,
          { parse_mode: "Markdown" }
        );
      } catch (e) {
        console.error("Error notifying admin:", e);
      }
    }
  }
});

// ============ ADMIN: Aprobar/Rechazar ============
bot.command("aprobar", async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    await ctx.reply("❌ No tienes permisos de admin");
    return;
  }
  const id = parseInt(ctx.match || "0");
  const result = approveDeposit(id, ctx.from.id);

  if (result.success) {
    await ctx.reply(result.message);
    try {
      await bot.api.sendMessage(
        result.telegramId,
        `✅ *¡Depósito aprobado!*\n\n+${result.amount} créditos\nNuevo saldo: ${result.newBalance} créditos`,
        { parse_mode: "Markdown" }
      );
    } catch (e) {}
  } else {
    await ctx.reply(result.message);
  }
});

bot.command("rechazar", async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    await ctx.reply("❌ No tienes permisos de admin");
    return;
  }
  const id = parseInt(ctx.match || "0");
  const result = rejectDeposit(id, ctx.from.id);

  if (result.success) {
    await ctx.reply(result.message);
    try {
      await bot.api.sendMessage(
        result.telegramId,
        `❌ Tu depósito #${id} fue rechazado. Contacta al admin.`
      );
    } catch (e) {}
  } else {
    await ctx.reply(result.message);
  }
});

// ============ BALANCE ============
bot.callbackQuery("balance", async (ctx) => {
  const balance = getBalance(ctx.from.id);
  await ctx.reply(
    `📊 *TU BALANCE*\n\n💵 Créditos: *${balance}*\n💰 Equivale a: *${balance} CUP*`,
    { parse_mode: "Markdown" }
  );
  await ctx.answerCallbackQuery();
});

// ============ APUESTAS ============
bot.callbackQuery("bet_menu", async (ctx) => {
  await ctx.reply("⏳ Buscando partidos de hoy...");
  try {
    const fixtures = await getTodayFixtures();
    if (fixtures.length === 0) {
      await ctx.reply("❌ No hay partidos disponibles ahora. Intenta más tarde.");
      await ctx.answerCallbackQuery();
      return;
    }

    const keyboard = new InlineKeyboard();
    const max = Math.min(fixtures.length, 8);

    for (let i = 0; i < max; i++) {
      const f = fixtures[i];
      const text = `${f.teams.home.name} vs ${f.teams.away.name}`.substring(0, 40);
      keyboard.text(`⚽ ${text}`, `fix_${f.fixture.id}_${i}`);
      keyboard.row();
    }
    keyboard.text("🔄 Actualizar", "bet_menu").row();
    keyboard.text("⬅️ Volver", "back_menu");

    await ctx.reply(
      `⚽ *PARTIDOS DE HOY* (${fixtures.length} disponibles)\n\nSelecciona:`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    await ctx.reply("❌ Error al cargar partidos. Intenta más tarde.");
  }
  await ctx.answerCallbackQuery();
});

// Seleccionar partido
bot.callbackQuery(/^fix_(\d+)_(\d+)$/, async (ctx) => {
  const fixtureId = parseInt(ctx.match[1]);
  const fixtureIndex = parseInt(ctx.match[2]);

  await ctx.reply("⏳ Cargando cuotas...");

  try {
    const fixtures = await getTodayFixtures();
    const fixture = fixtures[fixtureIndex];
    if (!fixture) {
      await ctx.reply("❌ Partido no encontrado");
      await ctx.answerCallbackQuery();
      return;
    }

    const odds = await getFixtureOdds(fixtureId);
    if (!odds) {
      await ctx.reply("❌ Cuotas no disponibles para este partido");
      await ctx.answerCallbackQuery();
      return;
    }

    const home = fixture.teams.home.name;
    const away = fixture.teams.away.name;
    const league = fixture.league.name;
    const balance = getBalance(ctx.from.id);

    const keyboard = new InlineKeyboard()
      .text(`🏠 ${home} @ ${odds.home}`, `sel_${fixtureId}_${fixtureIndex}_home_${odds.home}`)
      .row()
      .text(`🤝 Empate @ ${odds.draw}`, `sel_${fixtureId}_${fixtureIndex}_draw_${odds.draw}`)
      .row()
      .text(`✈️ ${away} @ ${odds.away}`, `sel_${fixtureId}_${fixtureIndex}_away_${odds.away}`)
      .row()
      .text("⬅️ Volver", "bet_menu");

    await ctx.reply(
      `⚽ *${home} vs ${away}*\n🏆 ${league}\n\n` +
        `📊 *CUOTAS:*\n` +
        `🏠 ${home}: *${odds.home}*\n` +
        `🤝 Empate: *${odds.draw}*\n` +
        `✈️ ${away}: *${odds.away}*\n\n` +
        `💵 Tu saldo: *${balance} créditos*\n\n` +
        `Selecciona tu apuesta:`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  } catch (error) {
    await ctx.reply("❌ Error al cargar cuotas");
  }
  await ctx.answerCallbackQuery();
});

// Seleccionar apuesta
bot.callbackQuery(/^sel_(\d+)_(\d+)_(home|draw|away)_([\d.]+)$/, async (ctx) => {
  const fixtureId = parseInt(ctx.match[1]);
  const fixtureIndex = parseInt(ctx.match[2]);
  const selection = ctx.match[3];
  const odds = parseFloat(ctx.match[4]);

  const fixtures = await getTodayFixtures();
  const fixture = fixtures[fixtureIndex];
  if (!fixture) {
    await ctx.reply("❌ Error");
    await ctx.answerCallbackQuery();
    return;
  }

  // Guardar selección
  saveSelection(ctx.from.id, fixtureId, selection, odds);
  // Guardar nombres de equipos también (extendemos sessions)
  const sel = getSelection(ctx.from.id);

  const selectionText =
    selection === "home"
      ? `🏠 ${fixture.teams.home.name}`
      : selection === "draw"
      ? "🤝 Empate"
      : `✈️ ${fixture.teams.away.name}`;

  const balance = getBalance(ctx.from.id);

  await ctx.reply(
    `✅ *Selección: ${selectionText}*\n` +
      `📊 Cuota: *${odds}*\n` +
      `⚽ ${fixture.teams.home.name} vs ${fixture.teams.away.name}\n\n` +
      `💵 Tu saldo: *${balance} créditos*\n\n` +
      `Para apostar, escribe:\n/apostar CANTIDAD\n\n` +
      `Ejemplo: /apostar 100`,
    { parse_mode: "Markdown" }
  );
  await ctx.answerCallbackQuery();
});

bot.command("apostar", async (ctx) => {
  const amount = parseFloat(ctx.match || "0");
  if (!amount || amount <= 0) {
    await ctx.reply("❌ Usa: /apostar CANTIDAD\n\nEjemplo: /apostar 100");
    return;
  }

  // Actualizar datos de la sesión con nombres de equipos
  const session = getSelection(ctx.from.id);
  if (session && session.fixture_id) {
    try {
      const fixtures = await getTodayFixtures();
      const fixture = fixtures.find((f) => f.fixture.id === session.fixture_id);
      if (fixture) {
        db.prepare(
          "UPDATE sessions SET league_name = ?, home_team = ?, away_team = ? WHERE telegram_id = ?"
        ).run(fixture.league.name, fixture.teams.home.name, fixture.teams.away.name, ctx.from.id);
      }
    } catch (e) {}
  }

  const result = placeBet(ctx.from.id, amount);
  await ctx.reply(result.message, { parse_mode: "Markdown" });
});

// ============ RETIROS ============
bot.callbackQuery("withdraw", async (ctx) => {
  await ctx.reply(
    `💸 *RETIROS*\n\n` +
      `Por saldo móvil:\n/retirar_saldo MONTO TELÉFONO\n\n` +
      `Por transferencia:\n/retirar_transfer MONTO CUENTA\n\n` +
      `Ejemplos:\n` +
      `/retirar_saldo 500 53123456\n` +
      `/retirar_transfer 1000 9224XXXXXXXX\n\n` +
      `💰 Mínimo: ${MIN_DEPOSIT} créditos\n⏳ Máximo 24 horas`,
    { parse_mode: "Markdown" }
  );
  await ctx.answerCallbackQuery();
});

bot.command("retirar_saldo", async (ctx) => {
  const parts = (ctx.match || "").trim().split(" ");
  const amount = parseFloat(parts[0] || "0");
  const phone = parts[1] || "";
  if (!amount || !phone) {
    await ctx.reply("❌ Usa: /retirar_saldo MONTO TELÉFONO\n\nEjemplo: /retirar_saldo 500 53123456");
    return;
  }
  const result = createWithdrawal(ctx.from.id, "saldo_movil", amount, phone);
  await ctx.reply(result.message, { parse_mode: "Markdown" });
});

bot.command("retirar_transfer", async (ctx) => {
  const parts = (ctx.match || "").trim().split(" ");
  const amount = parseFloat(parts[0] || "0");
  const account = parts[1] || "";
  if (!amount || !account) {
    await ctx.reply("❌ Usa: /retirar_transfer MONTO CUENTA\n\nEjemplo: /retirar_transfer 1000 9224XXXXXXXX");
    return;
  }
  const result = createWithdrawal(ctx.from.id, "transferencia", amount, account);
  await ctx.reply(result.message, { parse_mode: "Markdown" });
});

// ============ HISTORIAL ============
bot.callbackQuery("history", async (ctx) => {
  const bets = getBetHistory(ctx.from.id, 5);
  if (bets.length === 0) {
    await ctx.reply("📋 No tienes apuestas todavía. ¡Empieza con ⚽ Apostar!");
    await ctx.answerCallbackQuery();
    return;
  }

  let message = "📋 *TUS ÚLTIMAS APUESTAS*\n\n";
  for (const bet of bets) {
    const emoji = bet.status === "won" ? "✅" : bet.status === "lost" ? "❌" : bet.status === "void" ? "↩️" : "⏳";
    message += `${emoji} ${bet.home_team || "??"} vs ${bet.away_team || "??"}\n`;
    message += `   ${bet.bet_selection} @ ${bet.odds} | ${bet.amount} cr\n\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
  await ctx.answerCallbackQuery();
});

// ============ ADMIN: Comandos ============
bot.command("pendientes", async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    await ctx.reply("❌ No tienes permisos");
    return;
  }

  const deposits = db
    .prepare("SELECT * FROM deposits WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10")
    .all();
  const withdrawals = db
    .prepare("SELECT * FROM withdrawals WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10")
    .all();

  let message = "📋 *PENDIENTES*\n\n";

  if (deposits.length > 0) {
    message += "💰 *Depósitos:*\n";
    for (const d of deposits) {
      message += `  #${d.id} | ${d.method === "saldo_movil" ? "📱" : "🏦"} ${d.amount_cup} CUP\n`;
      message += `  /aprobar ${d.id} | /rechazar ${d.id}\n`;
    }
  }

  if (withdrawals.length > 0) {
    message += "\n💸 *Retiros:*\n";
    for (const w of withdrawals) {
      message += `  #${w.id} | ${w.method === "saldo_movil" ? "📱" : "🏦"} ${w.amount_cup} CUP → ${w.destination}\n`;
      message += `  /pagar ${w.id}\n`;
    }
  }

  if (deposits.length === 0 && withdrawals.length === 0) {
    message += "✅ No hay nada pendiente";
  }

  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.command("pagar", async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    await ctx.reply("❌ No tienes permisos");
    return;
  }
  const id = parseInt(ctx.match || "0");
  const result = approveWithdrawal(id, ctx.from.id);

  if (result.success) {
    await ctx.reply(result.message);
    try {
      await bot.api.sendMessage(
        result.telegramId,
        `✅ *¡Retiro completado!*\n\n${result.amount} CUP por ${result.method === "saldo_movil" ? "saldo móvil" : "transferencia"}\nDestino: ${result.destination}`,
        { parse_mode: "Markdown" }
      );
    } catch (e) {}
  } else {
    await ctx.reply(result.message);
  }
});

// Admin: liquidar apuesta
bot.command("liquidar", async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    await ctx.reply("❌ No tienes permisos");
    return;
  }
  const parts = (ctx.match || "").trim().split(" ");
  const betId = parseInt(parts[0] || "0");
  const result = parts[1] || ""; // won, lost, void

  if (!betId || !["won", "lost", "void"].includes(result)) {
    await ctx.reply("❌ Usa: /liquidar ID resultado\n\nEjemplo: /liquidar 1 won\nResultados: won, lost, void");
    return;
  }

  const res = settleBet(betId, result);
  if (res.success) {
    await ctx.reply(`✅ Apuesta #${betId} liquidada: ${result}`);
    try {
      await bot.api.sendMessage(res.telegramId, res.message, { parse_mode: "Markdown" });
    } catch (e) {}
  } else {
    await ctx.reply(res.message);
  }
});

// Admin: ver apuestas pendientes
bot.command("apuestas", async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    await ctx.reply("❌ No tienes permisos");
    return;
  }

  const bets = db
    .prepare("SELECT * FROM bets WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10")
    .all();

  if (bets.length === 0) {
    await ctx.reply("✅ No hay apuestas pendientes");
    return;
  }

  let message = "📋 *APUESTAS PENDIENTES*\n\n";
  for (const b of bets) {
    message += `#${b.id} | ${b.home_team} vs ${b.away_team}\n`;
    message += `  ${b.bet_selection} @ ${b.odds} | ${b.amount} cr\n`;
    message += `  /liquidar ${b.id} won | /liquidar ${b.id} lost | /liquidar ${b.id} void\n\n`;
  }

  await ctx.reply(message, { parse_mode: "Markdown" });
});

// ============ VOLVER AL MENÚ ============
bot.callbackQuery("back_menu", async (ctx) => {
  const balance = getBalance(ctx.from.id);
  const keyboard = new InlineKeyboard()
    .text("💰 Depositar", "deposit")
    .text("⚽ Apostar", "bet_menu")
    .row()
    .text("📊 Balance", "balance")
    .text("💸 Retirar", "withdraw")
    .row()
    .text("📋 Historial", "history")
    .text("❓ Ayuda", "help");

  await ctx.reply(`🏠 *MENÚ*\n\n💵 Saldo: *${balance} créditos*`, {
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
  await ctx.answerCallbackQuery();
});

// ============ AYUDA ============
bot.callbackQuery("help", async (ctx) => {
  await ctx.reply(
    `❓ *COMANDOS*\n\n` +
      `*Usuario:*\n` +
      `/start - Menú principal\n` +
      `/depositar_saldo MONTO - Depositar\n` +
      `/depositar_transfer MONTO - Depositar\n` +
      `/depositado REF - Confirmar depósito\n` +
      `/apostar MONTO - Hacer apuesta\n` +
      `/retirar_saldo MONTO TEL - Retirar\n` +
      `/retirar_transfer MONTO CUENTA - Retirar\n\n` +
      `*Admin:*\n` +
      `/pendientes - Ver pendientes\n` +
      `/aprobar ID - Aprobar depósito\n` +
      `/rechazar ID - Rechazar depósito\n` +
      `/pagar ID - Completar retiro\n` +
      `/apuestas - Ver apuestas pendientes\n` +
      `/liquidar ID resultado - Liquidar apuesta`,
    { parse_mode: "Markdown" }
  );
  await ctx.answerCallbackQuery();
});

// ============ INICIAR ============
if (!RENDER_URL) {
  // Modo local: usar polling
  bot.start();
  console.log("🤖 Bot iniciado (polling)");
} else {
  // Modo Render: usar webhook (ya configurado arriba)
  console.log("🤖 Bot iniciado (webhook)");
}
