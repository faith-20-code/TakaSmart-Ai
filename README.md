# TakaSmart AI

A two-sided recyclable waste marketplace that connects sellers (households, waste pickers, small businesses) with buyers (recycling companies) across Nairobi, Kenya. An AI agent handles buyer-to-seller matching, distance calculation, and market price suggestions.

---

## How It Works

Sellers list recyclable materials (plastic, metal, glass, electronics, etc.) with photos, quantity, and location. Buyers browse listings filtered by material type and proximity. The AI agent automatically notifies nearby buyers when a relevant listing is posted and suggests a fair KES price range to the seller based on current Nairobi market rates.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon — cloud hosted) |
| Cache / Sessions | Redis |
| AI | Anthropic Claude API |
| Maps | Google Maps JavaScript API |
| Media uploads | Cloudinary |
| SMS / USSD | Africa's Talking |
| Auth | JWT (HTTP-only cookies) |
| Deployment | Vercel (client), Railway (server) |
| Containers | Docker + Docker Compose |

---

## Project Structure

```
taka-platform/
│
├── client/                        # React frontend (Vite PWA)
│   ├── public/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── pages/
│   │   │   ├── auth/              # Login, Register
│   │   │   ├── seller/            # Seller dashboard, create listing, my listings
│   │   │   ├── buyer/             # Buyer dashboard, listing detail
│   │   │   ├── admin/             # Admin portal
│   │   │   └── shared/            # Home page
│   │   ├── services/
│   │   │   └── api.js             # Axios instance (all API calls go through here)
│   │   ├── App.jsx                # Router and protected routes
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind base styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                        # Express.js backend
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (all models and relations)
│   │   └── seed.js                # Test data for development
│   ├── src/
│   │   ├── config/
│   │   │   ├── prisma.js          # Prisma client (database connection)
│   │   │   └── redis.js           # Redis client
│   │   ├── controllers/           # Request logic (auth, listings, etc.)
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js # JWT protection for routes
│   │   │   └── error.middleware.js# Global error handler
│   │   ├── routes/                # API route definitions
│   │   ├── services/
│   │   │   └── ai.service.js      # Claude AI — matching, pricing, chatbot
│   │   └── index.js               # Express app entry point
│   ├── prisma.config.ts           # Prisma 7 config (datasource + migrations)
│   ├── tsconfig.json              # TypeScript config for prisma.config.ts
│   ├── .env.example               # Environment variable template (copy to .env)
│   └── package.json
│
├── .gitignore
└── README.md
```

> Note: `.env` files are never committed. Copy `.env.example` to `.env` and fill in your own keys.

---

## Getting Started (Local Setup)

### Prerequisites

- Node.js v20 or higher
- Git
- A Neon account (free) — [console.neon.tech](https://console.neon.tech)
- A Redis instance — local install or [Upstash](https://upstash.com) free tier

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/taka-platform.git
cd taka-platform
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in the required values. The only ones needed to run locally are:

```
DATABASE_URL        — your Neon PostgreSQL connection string
REDIS_URL           — your Redis connection string
JWT_SECRET          — any long random string
```

The rest (Cloudinary, Claude API, Google Maps, Africa's Talking) are only needed when you reach those features in later sprints.

Push the schema to your database:

```bash
npx prisma generate
npx prisma db push
```

Start the backend:

```bash
npm run dev
```

Confirm it is running by visiting `http://localhost:5000/health` in your browser.

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and automatically proxies API requests to the backend on port 5000.

---

## Available Scripts

### Backend (`/server`)

| Command | Description |
|---|---|
| `npm run dev` | Start server in development mode (auto-restarts on save) |
| `npm start` | Start server in production mode |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma db push` | Push schema changes to the database |
| `npx prisma studio` | Open visual database browser at localhost:5555 |
| `npm run db:seed` | Seed database with test data |

### Frontend (`/client`)

| Command | Description |
|---|---|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## User Types

**Seller** — household, waste picker, or small business. Can post recyclable waste listings with photos, quantity, material type, and location.

**Buyer** — registered recycling company. Browses listings, filters by material and location, and contacts sellers directly through the platform.

**Admin** — manages users, listings, and platform activity through an internal dashboard.

---

## Environment Variables

All required variables are documented in `server/.env.example`. Never commit your `.env` file. Share credentials with teammates through a secure channel (not through Git).

---

## Contributing

Work on feature branches only. Branch naming: `feature/your-feature-name` or `fix/bug-description`. Open a pull request into `dev`. Never push directly to `main`.

---

## License

Private — all rights reserved.