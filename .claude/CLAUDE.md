# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

WOTN (Way of the Navigator) is a behavioral intelligence app for tracking interpersonal dynamics. Users add people, log observations about them, then generate AI-powered behavioral predictions via the Groq API (Llama 3.3 70B). The app follows a cycle: Observe → Predict → Act → Record Outcome.

## Commands

- **Dev server (frontend):** `npm run dev` — Vite dev server with HMR
- **Dev server (backend):** `cd server && node server.js` — Express API on port 3001
- **Build:** `npm run build` — builds frontend to `dist/` and installs server deps
- **Production start:** `npm start` — serves built frontend + API from Express
- **Lint:** `npm run lint`
- **Run migrations:** `cd server && node migrate.js` — applies `init.sql` to the database
- **Local Postgres:** `docker compose up -d` — spins up Postgres 15 on port 5432

## Architecture

**Two-part app: Vite React frontend + Express/Node backend (separate package.json files).**

### Frontend (`src/`)
- React 19 + React Router v7 + Vite 8
- Single context provider (`src/context/AppContext.jsx`) manages all state and exposes actions via `useApp()` hook
- API client (`src/lib/api.js`) handles fetch calls and snake_case→camelCase conversion
- In dev, API calls go to `http://localhost:3001/api`; in production, relative `/api`
- Pages: Home, ProfileView, AddObservation, PredictScreen, PlaybookScreen, IntelligenceView

### Backend (`server/`)
- Express 5, CommonJS modules (separate `package.json` with `"type": "commonjs"`)
- PostgreSQL via `pg` Pool (`server/db.js`) — requires `DATABASE_URL` env var
- SSL enabled with `rejectUnauthorized: false` for hosted Postgres (Render/Supabase)
- Auth is MVP-level: reads `X-User-Id` header, defaults to `default_user`
- AI predictions via Groq API (`server/groq.js`) — requires `GROQ_API_KEY` env var
- In production, serves `dist/` as static files with SPA catch-all fallback

### Database (PostgreSQL)
Schema in `init.sql`. Four tables: `people`, `observations`, `predictions`, `outcomes`. All use UUID primary keys. Predictions store JSONB for personality_read, action_cards, and raw groq_response.

## Key Conventions

- Frontend uses camelCase; backend/DB uses snake_case. The `camelize()` function in `src/lib/api.js` bridges this.
- Backend env vars live in `server/.env` (loaded via dotenv with explicit path).
- ESLint ignores unused vars starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`).
- The `build` script handles both frontend build and server dependency installation.
