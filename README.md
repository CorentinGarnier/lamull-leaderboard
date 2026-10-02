# Leaderboard casino (Next.js)

1. `cp .env.example .env.local` puis renseigne `VEGA_API_KEY`
2. `npm install`
3. `npm run dev` -> http://localhost:3000

Le front appelle `/api/leaderboard` (proxy serveur), qui interroge Vega avec la clé.
Paramètres optionnels : `?from=2026-08-30&to=2026-09-30&limit=100`. Rafraîchissement : 15 s (`REFRESH_MS`).
Mappage des champs Vega : `normalize()` dans `app/api/leaderboard/route.js`.

## Mode démo
Mets `USE_MOCK=1` dans `.env.local` et relance `npm run dev` : la route renvoie de fausses données
qui évoluent, sans appeler Vega. Retire la variable (ou mets 0) pour repasser sur l'API réelle.

## Cache
Les réponses Vega sont mises en cache 15 s côté serveur. En cas d'erreur, les dernières données valides sont resservies.
