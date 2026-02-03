# Fastfood (Monorepo)

Monolith repository with:

- `backend/`: Express server (JavaScript, CommonJS)
- `frontend/`: Vite + React app (JavaScript)

This repo uses **npm workspaces** so there is a **single** `package-lock.json` at the top level.

## Structure

```
.
├─ package.json
├─ package-lock.json
├─ backend/
│  ├─ package.json
│  └─ server.js
└─ frontend/
   ├─ package.json
   ├─ vite.config.js
   └─ src/
      └─ App.jsx
```

## Getting started

Install dependencies (from repo root):

```bash
npm install
```

Run both backend + frontend in dev:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Ports & API

- Backend runs on `http://localhost:3000`
- Frontend runs on Vite’s default port (usually `http://localhost:5173`)
- Frontend proxies `/api/*` to the backend via `frontend/vite.config.js`

Health endpoint:

```bash
curl http://localhost:3000/api/health
```

# fastfood (fullstack)

Monorepo with:

- `apps/backend`: Express + TypeScript API
- `apps/frontend`: Vite + React + TypeScript

## Prerequisites

- Node.js >= 20

## Getting started

If you don't have `pnpm` yet, you can enable it via Corepack:

```bash
corepack enable
```

Install deps:

```bash
pnpm install
```

Run both apps in dev:

```bash
pnpm dev
```

## Ports

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## API

- `GET /api/health` (via backend directly, or via frontend proxy)

