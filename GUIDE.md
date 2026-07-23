# Activity 01 — Gated CI Pipeline: Step-by-Step Guide (Weather Dashboard)

This guide walks you through Track A of the activity using the Weather Dashboard
app already scaffolded in this project. Follow it in order — each step builds on
the last.

---

## 0. Prerequisites

- Node.js 20+ and npm installed
- Git installed
- A GitHub account
- VS Code
- A free OpenWeatherMap API key: https://openweathermap.org/api
  (sign up, go to "API keys", copy the default key — it can take a few minutes
  to activate)

---

## 1. Open the project in VS Code

1. Unzip the project you downloaded.
2. Open the `weather-dashboard` folder in VS Code (`File > Open Folder`).
3. Open a terminal in VS Code (`` Ctrl+` ``).

---

## 2. Run the app locally first

Confirm it works before touching Git or CI — this satisfies the activity's
60-minute rule (don't build the pipeline around a broken app).

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and paste your real OpenWeatherMap key:

```
PORT=5000
OPENWEATHER_API_KEY=paste_your_real_key_here
```

Then:

```bash
npm install
npm test        # should show 5 passing tests
npm run dev      # starts the API on http://localhost:5000
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev      # starts the UI, usually http://localhost:5173
```

Open the printed frontend URL, search a city (e.g. "Colombo"), and confirm you
see live weather data. This proves the app itself works before you touch CI.

---

## 3. Repository Setup (§5.1)

```bash
cd weather-dashboard
git init
git add .
git commit -m "chore: initial project scaffold"
```

Create a new **empty** repository on GitHub (no README/license — you already
have your own), then:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/weather-dashboard.git
git push -u origin main
```

Because `.env` is in `.gitignore`, your real API key never gets committed.
Double check:

```bash
git log --all --full-history -- "**/.env"
```

This should return nothing.

---

## 4. Branch Strategy — minimum three (§5.2)

```bash
git checkout -b dev
git push -u origin dev

git checkout -b staging
git push -u origin staging

git checkout main
```

You now have:

```
feature/* ──▶ dev ──▶ staging ──▶ main
```

- `main` — production, protected, tagged releases
- `staging` — pre-prod, mirrors production config
- `dev` — integration branch, where features meet
- `feature/*` — one short-lived branch per unit of work

Create your first feature branch off `dev`:

```bash
git checkout dev
git checkout -b feature/weather-search
```

---

## 5. Commit Discipline (§5.3)

Use Conventional Commits for every commit from here on:

```bash
git add .
git commit -m "feat: add weather search form to frontend"
git commit -m "test: add coverage for weather route edge cases"
git commit -m "ci: run tests on pull requests to dev"
```

Push the feature branch and open a PR into `dev` (not `main`):

```bash
git push -u origin feature/weather-search
```

---

## 6. The CI Workflow (§5.4)

The workflow is already at `.github/workflows/ci.yml`. It runs on every push
and pull request targeting `dev`, `staging`, or `main`, with three jobs:

1. **backend-test** — installs deps, runs the Jest suite (`backend/tests/weather.test.js`)
2. **frontend-build** — installs deps, runs `vite build`
3. **secret-scan** — runs Gitleaks over the full git history

Once you push your feature branch and open the PR, go to the **Actions** tab
on GitHub and watch these three jobs run.

---

## 7. Secrets Management (§5.5)

**(a) Never commit secrets** — already handled: `OPENWEATHER_API_KEY` only
ever lives in `backend/.env`, which is gitignored.    

**(b) Store real values in GitHub Secrets:**

1. On GitHub: `Settings > Secrets and variables > Actions > New repository secret`
2. Name: `OPENWEATHER_API_KEY`
3. Value: your real key (or a fake placeholder value — either is fine per the
   activity brief)
4. Save.

**(c) Prove you can't leak them:**

The workflow has a step called "Prove the secret is consumed but never
printed" that checks the key is present without ever echoing its value.
Open that step's log in the Actions tab and screenshot it — you'll see
GitHub automatically masks any secret value if it were ever printed.

**(d) Scan for secrets already in history:**

The `secret-scan` job runs Gitleaks automatically on every push/PR. Check its
log in the Actions tab — it should report zero findings. If you ever
accidentally commit a real key, rotate it immediately on OpenWeatherMap and
then clean git history (e.g. with `git filter-repo`) before you can trust
this scan again.

---

## 8. Branch Protection — The Gate (§5.6)

On GitHub: `Settings > Branches > Add branch protection rule`.

Set this up for `main` first (repeat for `staging` and `dev` if you want the
gate everywhere):

1. Branch name pattern: `main`
2. Check **Require a pull request before merging**
   - Require approvals: 1 (if you have a teammate; 0 is fine solo)
3. Check **Require status checks to pass before merging**
   - Search for and select: `Backend Tests`, `Frontend Build`, `Secret Scanning`
   - Check **Require branches to be up to date before merging**
4. Check **Do not allow bypassing the above settings** (includes admins)
5. Save changes.

This is the actual gate: GitHub will now refuse to merge any PR into `main`
until all three CI jobs are green.

---

## 9. Prove The Gate Works (§5.7)

**Break it on purpose:**

```bash
git checkout dev
git checkout -b feature/break-the-gate
```

Edit `backend/tests/weather.test.js` and change one expectation so it's
wrong, e.g.:

```js
expect(res.status).toBe(999); // was 200 — intentionally wrong
```

```bash
git add .
git commit -m "test: intentionally break a test to prove the gate works"
git push -u origin feature/break-the-gate
```

Open a PR from `feature/break-the-gate` into `dev` (or `main` if you protected
it there too). Watch:

- The `backend-test` job fails in the Actions tab.
- GitHub shows the PR as blocked — the "Merge" button is disabled with a
  message that required checks haven't passed.

**Read the log and fix it:**

Open the failed job's log, find the failing assertion, and read the actual
vs expected values Jest prints. Revert your intentional change:

```bash
git revert HEAD
git push
```

Watch the same PR go green and the merge button become available. Merge it.

This full cycle — break, see it blocked, read the log, fix, see it go
green — is the actual proof required by LO5 and LO6.

---

## 10. Learning Outcomes Checklist

- [ ] **LO1** — Can you explain why `feature/*`, `dev`, `staging`, and `main`
      each exist?
- [ ] **LO2** — Does `ci.yml` trigger on the right events (push + PR to the
      right branches)?
- [ ] **LO3** — Did a failing test actually block a merge (not just show a red X)?
- [ ] **LO4** — Is `OPENWEATHER_API_KEY` stored only in GitHub Secrets and
      your local `.env`, never in a commit?
- [ ] **LO5** — Did you deliberately break the gate and watch it hold?
- [ ] **LO6** — Did you read a real failed pipeline log and identify the exact
      cause before fixing it?

If you can check all six, Track A is genuinely green — move on to Track B
(matrix builds, caching, linting, coverage thresholds, environment-scoped
secrets, secret scanning) only from here.
