# TakaSmart AI

A two-sided recyclable waste marketplace that connects sellers (households, waste pickers, small businesses) with buyers (recycling companies) across Nairobi, Kenya. An AI agent handles buyer-to-seller matching, distance calculation, and market price suggestions.

---

## How It Works

Sellers list recyclable materials (plastic, metal, glass, electronics, etc.) with photos, quantity, and location. Buyers browse listings filtered by material type and proximity. The AI agent automatically notifies nearby buyers when a relevant listing is posted and suggests a fair KES price range to the seller based on current Nairobi market rates.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon cloud hosted) |
| Cache / Sessions | Redis |
| AI | Anthropic Claude API |
| Maps | Google Maps JavaScript API |
| Media uploads | Cloudinary |
| SMS / USSD | Africa's Talking |
| Auth | JWT / HTTP-only cookies |
| Deployment | Vercel (client), Railway (server) |

---

## Project Structure

```text
TakaSmart-Ai/
|-- client/                       # Next.js frontend
|   |-- app/                      # App Router pages, layout, and global styles
|   |   |-- page.tsx              # Home page
|   |   |-- layout.tsx            # Root layout and metadata
|   |   `-- globals.css           # Tailwind/global styles
|   |-- public/                   # Static assets
|   |-- src/
|   |   `-- lib/
|   |       `-- api.ts            # API client helper
|   |-- next.config.ts
|   |-- tsconfig.json
|   `-- package.json
|
|-- server/                       # Express.js backend
|   |-- prisma/
|   |   `-- schema.prisma         # Database schema
|   |-- src/
|   |   |-- config/
|   |   |   `-- prisma.js         # Prisma client/database connection
|   |   `-- index.js              # Express app entry point
|   |-- prisma.config.ts          # Prisma 7 config
|   |-- .env.example              # Environment variable template
|   `-- package.json
|
|-- .gitignore
`-- README.md
```

> Note: `.env` files are never committed. Copy `.env.example` to `.env` and fill in your own keys.

---

## Getting Started

### Prerequisites

- Node.js v20 or higher
- Git
- A Neon account for PostgreSQL
- A Redis instance, local or hosted

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

Open `.env` and fill in the required values. The only ones needed to run locally at first are:

```text
DATABASE_URL        your PostgreSQL connection string
REDIS_URL           your Redis connection string
JWT_SECRET          any long random string
CLIENT_URL          http://localhost:3000
```

The rest (Cloudinary, Claude API, Google Maps, Africa's Talking) are only needed when those features are implemented.

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

The Next.js frontend runs at `http://localhost:3000`. API requests should point to the backend at `http://localhost:5000`.

---

## Available Scripts

### Backend (`/server`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Express server in development mode |
| `npm start` | Start the Express server in production mode |
| `npx prisma generate` | Regenerate the Prisma client after schema changes |
| `npx prisma db push` | Push schema changes to the database |
| `npx prisma studio` | Open the Prisma database browser |
| `npm run db:seed` | Seed the database with test data |

### Frontend (`/client`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the Next.js app for production |
| `npm start` | Start the production Next.js server after building |
| `npm run lint` | Run ESLint |

---

## User Types

**Seller** - household, waste picker, or small business. Can post recyclable waste listings with photos, quantity, material type, and location.

**Buyer** - registered recycling company. Browses listings, filters by material and location, and contacts sellers directly through the platform.

**Admin** - manages users, listings, and platform activity through an internal dashboard.

---

## Environment Variables

Backend variables are documented in `server/.env.example`.

For the Next.js client, create `client/.env.local` when needed:

```text
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Never commit `.env` or `.env.local` files. Share credentials through a secure channel.

---

## Contributing

Work on feature branches only. Branch naming: `feature/your-feature-name` or `fix/bug-description`. Open a pull request into `dev`. Never push directly to `main`.

---

## License

Private - all rights reserved.
