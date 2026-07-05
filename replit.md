# EcoLearn

A gamified environmental education platform for schools and colleges that rewards students with eco-points and digital badges for learning about environmental topics, completing quizzes, and doing daily eco challenges.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/ecolearn run dev` — run the frontend (port 24777)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/ecolearn), wouter routing, Framer Motion, TanStack Query
- API: Express 5 (artifacts/api-server), JWT auth (jsonwebtoken + bcryptjs)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in lib/api-spec/openapi.yaml)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle schema files (users, lessons, quizzes, challenges, badges)
- `artifacts/api-server/src/routes/` — all backend route handlers
- `artifacts/api-server/src/middleware/auth.ts` — JWT middleware + token helpers
- `artifacts/ecolearn/src/lib/auth.tsx` — frontend AuthContext with JWT storage
- `artifacts/ecolearn/src/pages/` — all React pages

## Architecture decisions

- Session-based JWT auth (not Clerk) — needed student vs admin role distinction without Organizations
- JWT stored in localStorage under key `ecolearn_token`, attached via `setAuthTokenGetter`
- Badge awards happen automatically on challenge completion and quiz submission
- Eco-points accumulate from quiz correct answers (pointsPerQuestion each) and challenge completions
- Admin login uses the same endpoint as student login — role is detected from the API response

## Product

- Students register, log in, browse lessons by topic (5 topics), take MCQ quizzes, complete daily eco challenges
- Eco-points and digital badges (Eco Beginner → Planet Hero) earned automatically
- Leaderboard shows top students school-wide
- Admins can CRUD lessons, quizzes (with questions), and challenges; view all students

## Test credentials

- Admin: admin@ecolearn.com / admin123
- Student: priya@student.com / student123 (850 pts, Eco Warrior badge)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any schema change in lib/db/src/schema/, run `pnpm run typecheck:libs` BEFORE checking artifact typechecks
- After any OpenAPI spec change, run codegen before touching frontend code
- `setAuthTokenGetter` (not `setCustomFetch`) is the correct export from `@workspace/api-client-react` for attaching JWT tokens
- `useGetMe` and other hooks require `queryKey` inside the `query` options object
