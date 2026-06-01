# TakaSmart AI

A two-sided recyclable waste marketplace that connects sellers (households, waste pickers, small businesses) with buyers (recycling companies) across Nairobi, Kenya. An AI agent handles buyer-to-seller matching, distance calculation, and market price suggestions.

> Archived note: this README describes the earlier React + Vite version of the project. The current app uses Next.js. See `README.md` for the current setup.

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
| Database | PostgreSQL (Neon cloud hosted) |
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

```text
taka-platform/
|
|-- client/                        # React frontend (Vite PWA)
|   |-- public/
|   |-- src/
|   |   |-- components/            # Reusable UI components
|   |   |-- context/
|   |   |   `-- AuthContext.jsx    # Global auth state
|   |   |-- pages/
|   |   |   |-- auth/              # Login, Register
|   |   |   |-- seller/            # Seller dashboard, create listing, my listings
|   |   |   |-- buyer/             # Buyer dashboard, listing detail
|   |   |   |-- admin/             # Admin portal
|   |   |   `-- shared/            # Home page
|   |   |-- services/
|   |   |   `-- api.js             # Axios instance
|   |   |-- App.jsx                # Router and protected routes
|   |   |-- main.jsx               # React entry point
|   |   `-- index.css              # Tailwind base styles
|   |-- index.html
|   |-- vite.config.js
|   |-- tailwind.config.js
|   `-- package.json
|
|-- server/                        # Express.js backend
|   |-- prisma/
|   |   |-- schema.prisma          # Database schema
|   |   `-- seed.js                # Test data for development
|   |-- src/
|   |   |-- config/
|   |   |   |-- prisma.js          # Prisma client
|   |   |   `-- redis.js           # Redis client
|   |   |-- controllers/           # Request logic
|   |   |-- middleware/
|   |   |   |-- auth.middleware.js # JWT protection
|   |   |   `-- error.middleware.js
|   |   |-- routes/                # API route definitions
|   |   |-- services/
|   |   |   `-- ai.service.js      # Claude AI
|   |   `-- index.js               # Express app entry point
|   |-- prisma.config.ts
|   |-- tsconfig.json
|   |-- .env.example
|   `-- package.json
|
|-- .gitignore
`-- README.md
```

---

## Getting Started (Local Setup)

### Prerequisites

- Node.js v20 or higher
- Git
- A Neon account
- A Redis instance

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

Required local values:

```text
DATABASE_URL        your Neon PostgreSQL connection string
REDIS_URL           your Redis connection string
JWT_SECRET          any long random string
```

Push the schema to your database:

```bash
npx prisma generate
npx prisma db push
```

Start the backend:

```bash
npm run dev
```

Confirm it is running by visiting `http://localhost:5000/health`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

The Vite frontend runs at `http://localhost:5173` and talks to the backend on port `5000`.

---

## Available Scripts

### Backend (`/server`)

| Command | Description |
|---|---|
| `npm run dev` | Start server in development mode |
| `npm start` | Start server in production mode |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma db push` | Push schema changes to the database |
| `npx prisma studio` | Open visual database browser |
| `npm run db:seed` | Seed database with test data |

### Frontend (`/client`)

| Command | Description |
|---|---|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## User Types

**Seller** - household, waste picker, or small business. Can post recyclable waste listings with photos, quantity, material type, and location.

**Buyer** - registered recycling company. Browses listings, filters by material and location, and contacts sellers directly through the platform.

**Admin** - manages users, listings, and platform activity through an internal dashboard.

---

## Environment Variables

All required variables are documented in `server/.env.example`. Never commit your `.env` file. Share credentials with teammates through a secure channel.

---

## License

Private - all rights reserved.
