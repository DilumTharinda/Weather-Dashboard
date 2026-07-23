# Weather Dashboard

A small full-stack app (React + Node/Express) built for the "Build a Gated CI Pipeline" activity.

- `backend/` — Express API that proxies OpenWeatherMap. Requires `OPENWEATHER_API_KEY`.
- `frontend/` — React (Vite) UI that lets a user search a city and see current weather.

See `GUIDE.md` for the full step-by-step walkthrough of the pipeline activity
(branching, CI, secrets, branch protection, and proving the gate works).

## Quick start (local)

```bash
# backend
cd backend
cp .env.example .env   # then paste your real OpenWeatherMap key into .env
npm install
npm test
npm run dev

# frontend (separate terminal)
cd frontend
npm install
npm run dev
```
