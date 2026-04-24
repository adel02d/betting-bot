import db from "./database.js";

// Guardar selección temporal del usuario
export function saveSelection(telegramId, fixtureId, selection, odds) {
  db.prepare(
    "INSERT OR REPLACE INTO sessions (telegram_id, fixture_id, selection, odds) VALUES (?, ?, ?, ?)"
  ).run(telegramId, fixtureId, selection, odds);
}

// Obtener selección guardada
export function getSelection(telegramId) {
  return db.prepare("SELECT * FROM sessions WHERE telegram_id = ?").get(telegramId);
}

// Limpiar selección
export function clearSelection(telegramId) {
  db.prepare("DELETE FROM sessions WHERE telegram_id = ?").run(telegramId);
}

// Crear apuesta
export function placeBet(telegramId, amount) {
  const session = getSelection(telegramId);
  if (!session || !session.fixture_id) {
    return { success: false, message: "❌ Primero selecciona un partido. Usa ⚽ Apostar" };
  }

  const user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegramId);
  if (!user) return { success: false, message: "❌ Usuario no registrado. Usa /start" };

  if (user.balance < amount) {
    return { success: false, message: `❌ Saldo insuficiente.\nTu saldo: ${user.balance} créditos` };
  }

  if (amount < 10) {
    return { success: false, message: "❌ Apuesta mínima: 10 créditos" };
  }

  const potentialWin = parseFloat((amount * session.odds).toFixed(2));

  // Descontar saldo
  db.prepare("UPDATE users SET balance = balance - ? WHERE telegram_id = ?")
    .run(amount, telegramId);

  // Crear apuesta
  const result = db.prepare(
    "INSERT INTO bets (telegram_id, fixture_id, league_name, home_team, away_team, bet_selection, odds, amount, potential_win, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')"
  ).run(
    telegramId,
    session.fixture_id,
    session.league_name || "",
    session.home_team || "",
    session.away_team || "",
    session.selection,
    session.odds,
    amount,
    potentialWin
  );

  clearSelection(telegramId);

  const selectionText =
    session.selection === "home"
      ? `🏠 Local (${session.home_team})`
      : session.selection === "draw"
      ? "🤝 Empate"
      : `✈️ Visitante (${session.away_team})`;

  return {
    success: true,
    message:
      `✅ *Apuesta registrada!*\n\n` +
      `⚽ ${session.home_team} vs ${session.away_team}\n` +
      `🏆 ${session.league_name}\n` +
      `📊 ${selectionText}\n` +
      `💰 Cuota: ${session.odds}\n` +
      `💵 Apostado: ${amount} créditos\n` +
      `🎯 Posible ganancia: ${potentialWin} créditos`,
  };
}

// Obtener historial
export function getBetHistory(telegramId, limit = 10) {
  return db
    .prepare("SELECT * FROM bets WHERE telegram_id = ? ORDER BY created_at DESC LIMIT ?")
    .all(telegramId, limit);
}

// Liquidar apuesta (admin)
export function settleBet(betId, result) {
  const bet = db.prepare("SELECT * FROM bets WHERE id = ? AND status = 'pending'").get(betId);
  if (!bet) return { success: false, message: "❌ Apuesta no encontrada o ya liquidada" };

  if (result === "won") {
    db.prepare("UPDATE users SET balance = balance + ? WHERE telegram_id = ?")
      .run(bet.potential_win, bet.telegram_id);
  }

  if (result === "void") {
    db.prepare("UPDATE users SET balance = balance + ? WHERE telegram_id = ?")
      .run(bet.amount, bet.telegram_id);
  }

  db.prepare("UPDATE bets SET status = ?, settled_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(result, betId);

  const messages = {
    won: `🎉 ¡GANASTE!\n⚽ ${bet.home_team} vs ${bet.away_team}\n+${bet.potential_win} créditos`,
    lost: `😞 Perdiste\n⚽ ${bet.home_team} vs ${bet.away_team}\n-${bet.amount} créditos`,
    void: `↩️ Apuesta anulada\n⚽ ${bet.home_team} vs ${bet.away_team}\nSe devolvieron ${bet.amount} créditos`,
  };

  return {
    success: true,
    message: messages[result],
    telegramId: bet.telegram_id,
  };
}
