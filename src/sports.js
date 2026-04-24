// ============================================
// ⚽ SPORTS MODULE - API-Football Integration
// ============================================

const API_HOST = "v3.football.api-sports.io";
const BASE_URL = `https://${API_HOST}`;

let apiKey = "";

const cache = {
  fixtures: { data: null, timestamp: 0, ttl: 5 * 60 * 1000 },
  odds: {},
};

const LEAGUES = [
  { id: 140, name: "La Liga", emoji: "🇪🇸", country: "España" },
  { id: 39, name: "Premier League", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", country: "Inglaterra" },
  { id: 135, name: "Serie A", emoji: "🇮🇹", country: "Italia" },
  { id: 78, name: "Bundesliga", emoji: "🇩🇪", country: "Alemania" },
  { id: 61, name: "Ligue 1", emoji: "🇫🇷", country: "Francia" },
  { id: 2, name: "Champions League", emoji: "🏆", country: "Europa" },
  { id: 3, name: "Europa League", emoji: "🏆", country: "Europa" },
  { id: 13, name: "Copa Libertadores", emoji: "🌎", country: "Sudamérica" },
  { id: 1, name: "Copa del Mundo", emoji: "🌍", country: "Mundial" },
  { id: 9, name: "Copa América", emoji: "🌎", country: "Sudamérica" },
  { id: 253, name: "MLS", emoji: "🇺🇸", country: "EEUU" },
  { id: 262, name: "Liga MX", emoji: "🇲🇽", country: "México" },
];

function setApiKey(key) {
  apiKey = key;
}

function getLeagues() {
  return LEAGUES;
}

function getLeagueById(id) {
  return LEAGUES.find(l => l.id === id);
}

async function apiRequest(endpoint, params) {
  params = params || {};
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football errors: ${JSON.stringify(data.errors)}`);
  }
  return data;
}

async function getTodayFixtures(leagueId) {
  if (!leagueId && cache.fixtures.data && (Date.now() - cache.fixtures.timestamp < cache.fixtures.ttl)) {
    return cache.fixtures.data;
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const params = {
      date: today,
      timezone: "America/Havana",
    };

    if (leagueId) {
      params.league = leagueId.toString();
    }

    const data = await apiRequest("/fixtures", params);

    let fixtures = data.response || [];

    if (!leagueId) {
      const leagueIds = LEAGUES.map(l => l.id);
      fixtures = fixtures.filter(f => leagueIds.includes(f.league.id));
    }

    fixtures.sort((a, b) =>
      new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );

    const result = fixtures.slice(0, 30);

    if (!leagueId) {
      cache.fixtures.data = result;
      cache.fixtures.timestamp = Date.now();
    }

    return result;
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    if (cache.fixtures.data) return cache.fixtures.data;
    return [];
  }
}

async function getFixtureOdds(fixtureId) {
  if (cache.odds[fixtureId] && (Date.now() - cache.odds[fixtureId].timestamp < cache.odds[fixtureId].ttl)) {
    return cache.odds[fixtureId].data;
  }

  try {
    const data = await apiRequest("/odds", {
      fixture: fixtureId.toString(),
    });
    const result = data.response || [];

    cache.odds[fixtureId] = {
      data: result,
      timestamp: Date.now(),
      ttl: 10 * 60 * 1000,
    };

    return result;
  } catch (error) {
    console.error("Error fetching odds:", error);
    if (cache.odds[fixtureId]) return cache.odds[fixtureId].data;
    return [];
  }
}

async function getFixtureResult(fixtureId) {
  try {
    const data = await apiRequest("/fixtures", {
      id: fixtureId.toString(),
    });
    const fixtures = data.response || [];
    return fixtures.length > 0 ? fixtures[0] : null;
  } catch (error) {
    console.error("Error fetching result:", error);
    return null;
  }
}

function formatFixture(fixture) {
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  const league = fixture.league.name;
  const date = new Date(fixture.fixture.date);
  const timeStr = date.toLocaleTimeString("es-CU", { hour: "2-digit", minute: "2-digit" });
  const status = fixture.fixture.status.short;

  let statusText = "";
  if (status === "NS") statusText = `⏰ ${timeStr}`;
  else if (status === "1H" || status === "2H" || status === "HT") statusText = `🔴 EN VIVO ${fixture.goals.home}-${fixture.goals.away}`;
  else if (status === "FT") statusText = `✅ FINAL ${fixture.goals.home}-${fixture.goals.away}`;
  else statusText = `📋 ${status}`;

  return `${league}\n⚽ ${home} vs ${away}\n${statusText}`;
}

function formatFixtureShort(fixture) {
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  const date = new Date(fixture.fixture.date);
  const timeStr = date.toLocaleTimeString("es-CU", { hour: "2-digit", minute: "2-digit" });
  const status = fixture.fixture.status.short;

  if (status === "1H" || status === "2H" || status === "HT") {
    return `🔴 ${home} vs ${away}`;
  } else if (status === "FT") {
    return `✅ ${home} ${fixture.goals.home}-${fixture.goals.away} ${away}`;
  } else {
    return `⏰ ${timeStr} ${home} vs ${away}`;
  }
}

module.exports = {
  setApiKey,
  getLeagues,
  getLeagueById,
  getTodayFixtures,
  getFixtureOdds,
  getFixtureResult,
  formatFixture,
  formatFixtureShort,
};
