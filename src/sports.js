const API_HOST = "v3.football.api-sports.io";
const BASE_URL = `https://${API_HOST}`;
let apiKey = "";
export function setApiKey(key: string) { apiKey = key; }

async function apiRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const response = await fetch(url.toString(), { method: "GET", headers: { "x-apisports-key": apiKey } });
  if (!response.ok) throw new Error(`API-Football error: ${response.status}`);
  const data: any = await response.json();
  if (data.errors && Object.keys(data.errors).length > 0) throw new Error(`API errors: ${JSON.stringify(data.errors)}`);
  return data;
}

export async function getTodayFixtures(): Promise<any[]> {
  const today = new Date().toISOString().split("T")[0];
  try {
    const data = await apiRequest("/fixtures", { date: today, timezone: "America/Havana" });
    let fixtures = data.response || [];
    const leagueIds = [39, 140, 135, 78, 61, 2, 13, 9, 1];
    fixtures = fixtures.filter((f: any) => leagueIds.includes(f.league.id) || f.league.id <= 200);
    fixtures.sort((a: any, b: any) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());
    return fixtures.slice(0, 30);
  } catch (e) { console.error("Fixtures error:", e); return []; }
}

export async function getFixtureOdds(fixtureId: number): Promise<any[]> {
  try { const data = await apiRequest("/odds", { fixture: fixtureId.toString() }); return data.response || []; }
  catch (e) { console.error("Odds error:", e); return []; }
}

export async function getFixtureResult(fixtureId: number): Promise<any | null> {
  try { const data = await apiRequest("/fixtures", { id: fixtureId.toString() }); const f = data.response || []; return f.length > 0 ? f[0] : null; }
  catch (e) { console.error("Result error:", e); return null; }
}

export function formatFixture(fixture: any): string {
  const home = fixture.teams.home.name, away = fixture.teams.away.name, league = fixture.league.name;
  const date = new Date(fixture.fixture.date), timeStr = date.toLocaleTimeString("es-CU", { hour: "2-digit", minute: "2-digit" });
  const s = fixture.fixture.status.short;
  let t = "";
  if (s === "NS") t = `⏰ ${timeStr}`;
  else if (s === "1H" || s === "2H" || s === "HT") t = `🔴 EN VIVO ${fixture.goals.home}-${fixture.goals.away}`;
  else if (s === "FT") t = `✅ FINAL ${fixture.goals.home}-${fixture.goals.away}`;
  else t = `📋 ${s}`;
  return `${league}\n⚽ ${home} vs ${away}\n${t}`;
}
