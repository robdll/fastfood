# Fastfood (Monorepo)

Full-stack food ordering app with client and restaurant dashboards.

- `backend/`: Express server (JavaScript, ESM)
- `frontend/`: Vite + React app (JavaScript)

This repo uses npm workspaces, so there is a single `package-lock.json` at the top level.

## Highlights

- Role-based auth (client and restaurant)
- Restaurant menus and item management
- Orders with delivery estimates and status tracking
- Client cart and checkout flow
- Swagger API docs

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

- Backend: `http://localhost:3000`
- Frontend: Vite default (usually `http://localhost:5173`)
- Frontend proxies `/api/*` to the backend via `frontend/vite.config.js`

Health endpoint:

```bash
curl http://localhost:3000/api/health
```

Swagger docs:

- UI: `http://localhost:3000/api/docs`
- JSON: `http://localhost:3000/api/docs.json`

## Database & environment

Copy `backend/.env.example` to `backend/.env`, then fill the values provided by an admin:

```bash
cp backend/.env.example backend/.env
```

Variables to set:

```bash
MONGODB_DB_NAME=fastfood
MONGODB_DB_USER=your_user
MONGODB_DB_PASSWORD=your_password
MONGODB_CLUSTER_HOST=your_cluster_host
MONGODB_APP_NAME=cluster_name
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

You can also set `MONGODB_URI` directly (takes precedence):

```bash
MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/?appName=FastFoodCluster0"
```

## Seeding

Seed files live in `backend/db/`:

- `meal.json` (catalog)
- `users.json` (mock users and restaurants)
- `menus.json` (menu items per restaurant)
- `orders.json` (orders across statuses)

To seed the database:

```bash
npm run seed -w backend
```

The seed script clears and repopulates the `meals`, `users`, `menus`, and `orders` collections.

Test the connection first if needed:

```bash
npm run db:check -w backend
```

## Mock accounts

All mock users use `password123`.

Clients:

- `mario.rossi@fastfood.test`
- `lucia.bianchi@fastfood.test`
- `giulia.verdi@fastfood.test`
- `luca.neri@fastfood.test`
- `sara.conti@fastfood.test`

Restaurants:

- `burger.station@fastfood.test`
- `pasta.corner@fastfood.test`
- `sushi.way@fastfood.test`
- `pizza.lab@fastfood.test`
- `green.bowl@fastfood.test`

## Scripts

From repo root:

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run build
npm run preview
npm run start
```

Backend only:

```bash
npm run seed -w backend
npm run db:check -w backend
```

