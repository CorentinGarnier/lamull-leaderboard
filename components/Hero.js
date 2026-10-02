"use client";
import { useEffect, useState } from "react";
import { config } from "@/config";
import { Court } from "./Decor";

const money = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: config.currency, maximumFractionDigits: 0 }).format(n);
const pad = (n) => String(n).padStart(2, "0");
const SUITS = ["♠", "♦", "♣", "♥"];

function target() {
  if (config.endsAt) return new Date(config.endsAt).getTime();
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
}

// Cagnotte façon machine à sous : chaque chiffre est un rouleau qui défile jusqu'à sa valeur.
function Reels({ text }) {
  return (
    <div className="pool" role="img" aria-label={text}>
      {[...text].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} className="reel" aria-hidden="true">
            <span className="strip" style={{ "--d": Number(ch), "--i": i }}>
              {Array.from({ length: 10 }, (_, n) => <b key={n}>{n}</b>)}
            </span>
          </span>
        ) : (
          <span key={i} className="sep" aria-hidden="true">{ch === "\u202f" || ch === "\u00a0" ? "\u00a0" : ch}</span>
        )
      )}
    </div>
  );
}

export default function Hero() {
  const [left, setLeft] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = target();
    const tick = () => setLeft(Math.max(0, t - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const s = left === null ? null : Math.floor(left / 1000);
  const units = [
    ["Jours", s === null ? "--" : pad(Math.floor(s / 86400))],
    ["Heures", s === null ? "--" : pad(Math.floor((s % 86400) / 3600))],
    ["Min", s === null ? "--" : pad(Math.floor((s % 3600) / 60))],
    ["Sec", s === null ? "--" : pad(s % 60)],
  ];

  const copy = async () => {
    try { await navigator.clipboard.writeText(config.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const items = [`Code ${config.code}`, "Mise sur Vega.bet", `${money(config.prizePool)} à gagner`, "Classement en direct"];
  const seq = items.concat(items).flatMap((t, i) => [<span key={`t${i}`}>{t}</span>, <span key={`s${i}`} className="suit">{SUITS[i % 4]}</span>]);

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true"><Court className="court" /></div>

      <div className="bento">
        <div className="tile t-pool">
          <span className="chip-label">Leaderboard mensuel</span>
          <span className="sticker">En direct</span>
          <div>
            <p className="pool-label">Cagnotte à gagner</p>
            <Reels text={money(config.prizePool)} />
            <p className="lead">Mise sur Vega.bet avec le code <b>{config.code}</b> et grimpe au classement. Plus tu mises, plus tu montes.</p>
          </div>
          {config.mascot && <img className="mascot" src={config.mascot} alt={config.streamer} />}
        </div>

        <div className="tile t-time">
          <p className="tile-label">Fin du classement dans</p>
          <div className="timer">
            {units.map(([l, v]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
          </div>
        </div>

        <div className="tile t-code">
          <p className="tile-label">Code promo</p>
          <div className="code-row">
            <b>{config.code}</b>
            <button onClick={copy}>{copied ? "Copié" : "Copier"}</button>
          </div>
        </div>

        <a className="tile t-cta" href={config.signupUrl} target="_blank" rel="noopener noreferrer">
          <span>S&apos;inscrire sur Vega.bet</span>
          <i aria-hidden="true">→</i>
        </a>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track"><div className="half">{seq}</div><div className="half">{seq}</div></div>
      </div>
    </section>
  );
}