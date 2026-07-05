---
name: Lib declarations rebuild rule
description: After changing lib/db schema, declarations must be rebuilt before artifact typechecks
---

## Rule
After adding or modifying exports in `lib/db/src/schema/`, always run:
```
pnpm run typecheck:libs
```
BEFORE running artifact-level typechecks (e.g. `pnpm --filter @workspace/api-server run typecheck`).

Without this, `dist/` declarations are stale and the API server will show errors like:
`Module '"@workspace/db"' has no exported member 'usersTable'`

**Why:** lib/db is a TypeScript composite project; its `.d.ts` output in `dist/` is only updated when the composite build runs — not by individual artifact builds.

**How to apply:** Whenever you edit `lib/db/src/schema/index.ts` or add a new schema file, run `typecheck:libs` first.
