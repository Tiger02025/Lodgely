# Lodgely

Student accommodation booking platform connecting students with verified landlords near universities.

## Stack

| Service | Port | Stack |
|---|---|---|
| Admin dashboard | 3000 | React + Vite + TypeScript + TailwindCSS |
| API | 3001 | NestJS + Prisma + SQLite, Swagger at `/api/docs` |
| AI matching | 8000 | Python + FastAPI + scikit-learn |
| Mobile app | — | React Native + Expo + TypeScript |

## Prerequisites

- Node.js 20+
- npm 10+
- Python 3.11 (for the AI matching service)

## Setup

Dependencies are installed per app, since this is not an npm workspace:

```bash
npm install
npm install --prefix apps/api
npm install --prefix apps/web
npm install --prefix apps/mobile

cp apps/api/.env.example apps/api/.env

python3 -m venv packages/ai-matching/.venv
packages/ai-matching/.venv/bin/pip install -r packages/ai-matching/requirements.txt
```

Create and seed the database:

```bash
npm run db:push
npm run db:seed
```

## Run

```bash
npm run dev
```

Starts the API on 3001, the dashboard on 3000 and the AI service on 8000.

Individually: `npm run dev:api`, `npm run dev:web`, `npm run dev:ai`, `npm run dev:mobile`.

There is also a Docker path: `npm run dev:docker`.

## Demo accounts

All seeded accounts use the password `password123`.

| Email | Role |
|---|---|
| `admin@demo.com` | ADMIN — sign in at http://localhost:3000 |
| `student@demo.com` | STUDENT |
| `sam@demo.com` | STUDENT |
| `landlord@demo.com` | LANDLORD |

## Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run test:api:e2e
npm run build
```

## Project structure

```
lodgely/
├── apps/
│   ├── api/            # NestJS backend
│   ├── web/            # Admin dashboard
│   └── mobile/         # Student mobile app
├── packages/
│   ├── ai-matching/    # Python FastAPI roommate matching service
│   ├── shared-types/   # Shared TypeScript types
│   └── ui/             # Shared React UI components
├── infra/              # Docker and k8s configuration
└── .github/workflows/  # CI
```

## Notes

- The API serves its routes at the root (`/auth/login`, `/properties`, …). The web
  client calls them under `/api`, and both the Vite dev proxy and the production
  nginx config strip that prefix before forwarding.
- All API responses are wrapped as `{ "data": ..., "success": true }` by a global
  interceptor.
- Brand tokens live in `apps/mobile/src/theme/brand.ts` and
  `apps/web/tailwind.config.js`. See `AGENTS.md` for the design system.
- Secrets are not committed. `apps/api/.env` and the SQLite database are ignored;
  only `.env.example` templates are tracked.
