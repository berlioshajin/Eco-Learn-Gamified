---
name: EcoLearn stack decisions
description: Auth approach, API client token wiring, and React Query hook quirks for EcoLearn
---

## Auth
- Simple JWT auth (not Clerk) — needed student vs admin roles + custom registration fields
- JWT stored in localStorage as `ecolearn_token`
- Use `setAuthTokenGetter(() => localStorage.getItem("ecolearn_token"))` from `@workspace/api-client-react`
- **`setCustomFetch` does NOT exist** — the correct export is `setAuthTokenGetter`

## React Query hook options
- Generated hooks (e.g. `useGetMe`, `useListQuizzes`) require `queryKey` inside the `query` options object
- Pattern: `useGetMe({ query: { enabled: !!token, retry: false, queryKey: ["getMe"] } })`

## Quiz scoring security
- Deduplicate answers by questionId before scoring; reject unknown question IDs
- Cap correct count to actual quiz question set to prevent inflated eco-points

## Profile update safety
- Always use `.returning({ ... })` with explicit safe columns — never return `passwordHash`

**Why:** Design subagent used wrong export name; queryKey omission causes TS errors; scoring without dedup allows exploit.
