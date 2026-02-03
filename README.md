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
│  ├─ server.js
│  ├─ db/
│  │  ├─ db.js
│  │  └─ meal.json
│  └─ scripts/
│     ├─ check-db.js
│     └─ seed.js
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

## Database & seeding

Copy `backend/.env.example` to `backend/.env`, then fill the values provided by an admin:

```bash
cp backend/.env.example backend/.env
```

Variables to set:

```bash
MONGODB_DB_NAME=fastfood
MONGODB_DB_USER=your_user
MONGODB_DB_PASSWORD=your_password
MONGODB_CLUSTER_HOST=fastfoodcluster0.ds6zcgz.mongodb.net
MONGODB_APP_NAME=FastFoodCluster0
```

You can also set `MONGODB_URI` directly (takes precedence in this order):

```bash
MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/?appName=FastFoodCluster0"
```

`backend/db/meal.json` is part of the repo and should not be edited by devs.

To seed the database, run:

```bash
npm run seed -w backend
```

You can test the connection first:

```bash
npm run db:check -w backend
```

The seed script clears and repopulates the `meals` collection.

