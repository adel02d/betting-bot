const API_KEY = process.env.API_FOOTBALL_KEY || "";
const BASE_URL = "https://api-football-v1.p.rapidapi.com/v3";

const sportEmojis = {
  football: "⚽",
  basketball: "🏀",
  baseball: "⚾",
};

// Obtener partidos de hoy (fútbol)
export async function getTodayFixtures() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(
      `${BASE_URL}/fixtures?date=${today}&timezone=America/Havana`,
      {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
        },
      }
    );
    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return [];
  }
}

// Obtener cuotas de un partido
export async function getFixtureOdds(fixtureId) {
  try {
    const response = await fetch(
      `${BASE_URL}/odds?fixture=${fixtureId}&bookmaker=8`,
      {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
        },
      }
    );
    const data = await response.json();

    if (!data.response || data.response.length === 0) return null;

    const bookmaker = data.response[0].bookmakers?.[0];
    if (!bookmaker) return null;

    const matchWinner = bookmaker.bets?.find((b) => b.name === "Match Winner");
    if (!matchWinner) return null;

    const home = parseFloat(
      matchWinner.values.find((v) => v.value === "Home")?.odd || "0"
    );
    const draw = parseFloat(
      matchWinner.values.find((v) => v.value === "Draw")?.odd || "0"
    );
    const away = parseFloat(
      matchWinner.values.find((v) => v.value === "Away")?.odd || "0"
    );

    if (home === 0 || away === 0) return null;
    return { home, draw, away };
  } catch (error) {
    console.error("Error fetching odds:", error);
    return null;
  }
}

// Obtener resultado de un partido
export async function getFixtureResult(fixtureId) {
  try {
    const response = await fetch(`${BASE_URL}/fixtures?id=${fixtureId}`, {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
      },
    });
    const data = await response.json();

    if (!data.response || data.response.length === 0) return null;

    const fixture = data.response[0];
    const status = fixture.fixture.status.short;

    // FT = Full Time, AET = After Extra Time, PEN = Penalties
    const isFinished = ["FT", "AET", "PEN"].includes(status);

    return {
      home: fixture.goals.home,
      away: fixture.goals.away,
      status,
      isFinished,
    };
  } catch (error) {
    console.error("Error fetching result:", error);
    return null;
  }
}
