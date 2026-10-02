import https from "node:https";

// Proxy serveur : la clé API reste côté serveur et n'est jamais envoyée au navigateur.
export const dynamic = "force-dynamic";

const BASE = process.env.VEGA_BASE_URL || "https://api.vega.bet/api/v1";
const USE_MOCK = process.env.USE_MOCK === "1";
const CACHE_MS = 15000;
// Requête HTTPS forcée en IPv4 : la whitelist de Vega porte sur une adresse IPv4.
function get(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers, family: 4, timeout: 10000 }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode, text: body }));
    });
    req.on("timeout", () => req.destroy(new Error("délai dépassé")));
    req.on("error", reject);
  });
}

const iso = (d) => d.toISOString().slice(0, 10);

// Les pseudos sont masqués côté serveur : les vrais noms ne quittent jamais le serveur.
function mask(name) {
  const n = [...name];
  const visible = Math.max(1, Math.min(6, n.length - 2));
  return n.slice(0, visible).join("") + "*".repeat(Math.max(2, Math.min(5, n.length - visible)));
}

// Cache mémoire : tous les visiteurs partagent un seul appel vers Vega toutes les 15 s.
const cache = new Map(); // url -> { at, players }

// L'API renvoie une forme inconnue : on normalise de façon tolérante.
function pick(o, keys) {
  for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null) return o[k];
}
function normalize(json) {
  const list = Array.isArray(json) ? json : json?.data ?? json?.leaderboard ?? json?.results ?? [];
  return list
    .map((r) => ({
      username: String(pick(r, ["user_name", "username", "name", "user", "nickname", "player"]) ?? "Anonyme"),
      wagered: Number(pick(r, ["wager_amount", "wagered", "wager", "total_wager", "totalWagered", "amount", "bet", "total_bet"])) || 0,
    }))
    .sort((a, b) => b.wagered - a.wagered)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

// Données factices dont les mises augmentent avec le temps (USE_MOCK=1).
const NAMES = ["Zephyr","Nova","Kaito","Lynx","Orion","Blaze","Mistral","Vortex","Sable","Echo","Rogue","Tempo","Quartz","Drift","Onyx","Falcon","Pixel","Comet","Jinx","Atlas","Ember","Ghost","Havoc","Ivory","Jolt","Koda","Luna","Maverick","Nitro","Opal"];
function mockPlayers() {
  const t = Date.now() / 1000;
  const players = NAMES.map((n, i) => {
    const base = 60000 / (i + 1.5) + ((i * 7919) % 500);
    const rate = 0.4 + ((i * 31) % 10) / 10; // € par seconde
    return { username: `${n}${(i * 37) % 100}`, wagered: Math.round(base + rate * (t % 100000) * 0.05 + Math.sin(t / 20 + i) * 30) };
  });
  return players.sort((a, b) => b.wagered - a.wagered).map((r, i) => ({ ...r, rank: i + 1 }));
}

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const now = new Date();
  const to = sp.get("to") || iso(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)));
  const from = sp.get("from") || iso(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const limit = sp.get("limit") || "100";
  const ok = (players, extra = {}) => Response.json({ from, to, updatedAt: Date.now(), players: players.map((p) => ({ ...p, username: mask(p.username) })), ...extra });

  if (USE_MOCK) return ok(mockPlayers(), { mock: true });

  const key = process.env.VEGA_API_KEY;
  if (!key) return Response.json({ error: "VEGA_API_KEY manquante (.env.local)" }, { status: 500 });

  const url = `${BASE}/leaderboard?from=${from}&to=${to}&limit=${limit}`;
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < CACHE_MS) return ok(hit.players, { cached: true });

  try {
    const { status, text } = await get(url, { "x-api-key": key, Accept: "application/json", "User-Agent": "MonLeaderboard/1.0" });
    if (status < 200 || status >= 300) {
      console.error("[vega]", status, text.slice(0, 300));
      if (hit) return ok(hit.players, { stale: true }); // on garde les dernières données valides
      return Response.json({ error: `Vega a répondu ${status}`, details: text.slice(0, 200) }, { status: 502 });
    }
    const players = normalize(JSON.parse(text));
    cache.set(url, { at: Date.now(), players });
    return ok(players);
  } catch (e) {
    console.error("[vega]", e);
    if (hit) return ok(hit.players, { stale: true });
    return Response.json({ error: "Vega est injoignable", details: String(e.cause ?? e) }, { status: 502 });
  }
}