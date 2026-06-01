# TakaSmart AI Client

This is the Next.js frontend for TakaSmart AI.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The Express backend is expected to run on:

```text
http://localhost:5000
```

When needed, create `client/.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production app |
| `npm start` | Start the production server after building |
| `npm run lint` | Run ESLint |

## Current Routes

- `/` - public entry page
- `/login` - sign-in page and development dashboard preview
- `/register` - account creation page
- `/seller` - protected seller dashboard stub
- `/buyer` - protected buyer dashboard stub
- `/admin` - protected admin dashboard stub

## Auth Status

The frontend auth shell is implemented, but real authentication depends on backend routes that are still pending:

- `GET /auth/me`
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`

Until those exist, use the development preview buttons on `/login` to view dashboards.
