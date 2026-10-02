"use client";
import { useEffect, useRef, useState } from "react";
import { config } from "@/config";

const REFRESH_MS = 15000;
const money = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: config.currency, maximumFractionDigits: 0 }).format(n);
const prizeOf = (rank) => config.prizes[rank - 1] ?? 0;

function Crown({ rank }) {
  return (
    <svg className={`crown c${rank}`} viewBox="0 0 64 40" aria-hidden="true">
      <path d="M4 34 L8 10 L22 22 L32 4 L42 22 L56 10 L60 34 Z" fill="currentColor" />
      <rect x="4" y="34" width="56" height="4" rx="2" fill="currentColor" />
    </svg>
  );
}

function PodiumCard({ p }) {
  const img = config.podiumImages[p.rank - 1];
  return (
    <article className={`pod p${p.rank}`}>
      <span className="pod-rank">#{p.rank}</span>
      <div className="avatar">
        <Crown rank={p.rank} />
        {img ? <img src={img} alt="" /> : <span>{p.username.charAt(0).toUpperCase()}</span>}
      </div>
      <h3>{p.username}</h3>
      <div className="stat"><small>Misé</small><b>{money(p.wagered)}</b></div>
      <div className="stat prize"><small>Lot</small><b>{money(prizeOf(p.rank))}</b></div>
      {p.rank === 1 && <span className="winner">Leader actuel</span>}
    </article>
  );
}

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(new Set());
  const [q, setQ] = useState("");
  const prev = useRef(null);

  useEffect(() => {
    let alive = true, timer;
    const load = async () => {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        if (!res.ok) throw new Error(json.error || "Erreur");
        if (prev.current) {
          setFlash(new Set(json.players.filter((p) => prev.current[p.username] !== undefined && prev.current[p.username] < p.wagered).map((p) => p.username)));
          clearTimeout(timer);
          timer = setTimeout(() => alive && setFlash(new Set()), 2000);
        }
        prev.current = Object.fromEntries(json.players.map((p) => [p.username, p.wagered]));
        setData(json);
        setError(null);
      } catch (e) {
        if (alive) setError(e.message);
      }
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { alive = false; clearInterval(id); clearTimeout(timer); };
  }, []);

  const players = data?.players ?? [];
  const query = q.trim().toLowerCase();
  const list = query ? players.filter((p) => p.username.toLowerCase().includes(query)) : players.slice(3);
  const podium = [players[1], players[0], players[2]].filter(Boolean);

  return (
    <div className="board">
      <form className="search" onSubmit={(e) => e.preventDefault()}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Recherche ton pseudo" aria-label="Rechercher un pseudo" />
        <span className="glass" aria-hidden="true">⌕</span>
      </form>

      {!data && <p className="state">{error ? `${error}. Nouvel essai dans quelques secondes.` : "Chargement du classement…"}</p>}

      {data && !query && players.length > 0 && <div className="podium">{podium.map((p) => <PodiumCard key={p.rank} p={p} />)}</div>}

      {data && (
        <section className="table-wrap">
          <div className="table-head">
            <h2>Classement complet</h2>
            <span className={error ? "badge off" : "badge"}><b />{error ? "Connexion perdue" : config.refreshLabel}</span>
          </div>
          <div className="table">
            <div className="tr th"><span>Rang</span><span>Joueur</span><span>Misé</span><span>Lot</span></div>
            {list.length === 0 && <div className="tr empty">Aucun joueur trouvé.</div>}
            {list.map((p) => {
              const prize = prizeOf(p.rank);
              return (
                <div key={p.username + p.rank} className={`tr${prize ? "" : " dim"}${flash.has(p.username) ? " tick" : ""}`}>
                  <span>{p.rank}</span>
                  <span>{p.username}</span>
                  <span>{money(p.wagered)}</span>
                  <span className={prize ? "pz" : ""}>{money(prize)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}