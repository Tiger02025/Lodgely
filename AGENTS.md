# Lodgely - Agent Instructions

## Project Overview
Lodgely is a student accommodation booking platform connecting students with verified landlords near universities. This is a monorepo containing the full-stack MVP.

## Monorepo Structure
```
lodgely/
├── apps/
│   ├── api/            # NestJS backend API (port 3001)
│   ├── web/            # Admin dashboard (React + Vite, port 3000)
│   └── mobile/         # Student mobile app (React Native + Expo)
├── packages/
│   ├── ai-matching/    # Python FastAPI roommate matching service (port 8000)
│   ├── shared-types/   # Shared TypeScript types
│   └── ui/            # Shared React UI components
├── infra/              # Docker, k8s configs
└── .github/workflows/  # CI/CD
```

## Technology Stack
- **Backend**: NestJS (TypeScript) + PostgreSQL + Prisma ORM
- **API**: REST (JSON) with Swagger docs
- **Auth**: JWT + Passport strategies
- **Payments**: Stripe (PaymentIntent + Connect for landlords)
- **File Storage**: Cloudinary (images)
- **Mobile**: React Native + Expo + TypeScript
- **Admin Web**: React + Vite + TypeScript + TailwindCSS
- **AI Service**: Python 3.11 + FastAPI + scikit-learn

## Commands
| Command | Description | Directory |
|---------|-------------|-----------|
| `npm run dev` | Start all services in dev mode | root |
| `npm run dev:api` | Start backend API | apps/api |
| `npm run dev:web` | Start admin dashboard | apps/web |
| `npm run dev:mobile` | Start mobile dev server | apps/mobile |
| `npm run dev:ai` | Start AI matching service | packages/ai-matching |
| `npm run lint` | Run ESLint across all packages | root |
| `npm run typecheck` | Run TypeScript type checking | root |
| `npm run test` | Run all tests | root |

## Database Schema
- See `apps/api/prisma/schema.prisma` for the complete data model.
- Run `npm run db:push` to sync schema changes.
- Run `npm run db:seed` to seed demo data.

## Code Standards
- TypeScript strict mode enabled in all TS packages.
- ESLint + Prettier for formatting.
- All API routes must have proper validation (Zod/DTOs).
- Mobile components use functional components with hooks.
- Admin dashboard uses React Query for server state.

## Testing
- Backend: Jest + Supertest
- Frontend: Jest + React Testing Library
- AI Service: pytest
