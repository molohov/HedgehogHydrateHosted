![Hedgehog Hydrate](hedgehog_hydrate.jpg)

# Hedgehog Hydrate (Hosted)

A hedgehog-themed water intake tracker built with Next.js, PostgreSQL, and Docker. This hosted version mirrors the Android app experience while adding per-user accounts, external database persistence, and container deployment.

## Features

- Log water with built-in presets (3, 8, 10, 12 oz) and custom user presets
- User-set daily goal with progress ring and percentage
- Hedgehog-themed layout with customizable avatar and background color/image
- Encouraging hedgehog messages after each log
- Rolling 7-day chart
- Timestamped list of water entries for the current day
- Invite-only access with admin-provisioned permanent passwords
- PostgreSQL-backed persistence and Docker deployment
- Installable Progressive Web App (PWA) in production builds

## Tech stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- JWT session cookies (`jose`) + `bcryptjs`
- Recharts for the 7-day chart
- Sharp for image normalization

## Prerequisites

- Node.js 20+ (nvm works: `nvm use 20`)
- Docker Engine with Compose v2 (already available in this WSL Debian setup)
- Or PostgreSQL 16+ if not using Compose for the database

### Setup in WSL

```bash
cp -n .env.example .env   # skip if .env already exists
# edit .env: SESSION_SECRET, ADMIN_PASSWORD, DATABASE_URL
npm install
npm run db:migrate:dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the admin credentials from `.env`.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session signing secret (32+ chars) |
| `ADMIN_USERNAME` | Initial admin username (seeded once) |
| `ADMIN_PASSWORD` | Initial admin password (seeded once) |
| `APP_URL` | Public app URL for secure cookies in production |

## Authentication policy

- There is **no public signup**.
- Admins create accounts from `/admin/users` with a permanent password.
- Passwords are hashed at creation and **cannot be changed or recovered** inside the app.
- Share credentials securely when onboarding users.

## Docker deployment

Build and run the full stack:

```bash
docker compose up --build
```

The app container will:

1. Run Prisma migrations
2. Seed the initial admin if one does not exist
3. Start the Next.js server on port `3000`

Update `ADMIN_PASSWORD`, `SESSION_SECRET`, and database credentials before production deployment.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm test` | Run unit tests |
| `npm run db:migrate` | Apply migrations (production) |
| `npm run db:seed` | Seed initial admin |

## Data model

- `User`: account, preferences, avatar/background blobs, timezone, daily goal
- `WaterPreset`: built-in and custom ounce presets per user
- `WaterEntry`: timestamped drink logs per user

All hydration queries are scoped to the authenticated user.

## Project structure

```text
src/
  app/
    (app)/           Dashboard and settings
    admin/users/     Admin account management
    login/           Sign-in page
    actions/         Server actions
    api/images/      Authenticated avatar/background delivery
  auth.ts            Session and credential helpers
  components/        UI components
  lib/               Domain logic, validation, Prisma client
prisma/
  schema.prisma
  seed.ts
```

## Testing

```powershell
npm test
```

Tests cover hydration calculations, encouragement milestones, and input validation.

## Progressive Web App

Production builds register a service worker (`public/sw.js`) and expose a web app manifest so browsers can offer **Install** / **Add to Home Screen**.

- Requires HTTPS (or `localhost`)
- Service worker registration is disabled in `next dev`; use `npm run build && npm run start` (or Docker Compose) to verify installability
- Static icons are cached; navigations and `/api/*` stay network-only so sessions stay fresh

## Notes

- Image uploads are normalized to WebP and stored in PostgreSQL so containers stay stateless.
- Day boundaries respect each user's configured timezone.
- Built-in presets are created automatically for every new user.
