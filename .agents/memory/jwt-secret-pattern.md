---
name: JWT secret narrowing pattern
description: TypeScript pattern for module-level env var guard that narrows type for jwt.sign/verify
---

## Pattern
TypeScript does not narrow `string | undefined` to `string` across a module-level `if (!x) throw` guard when the variable is used later in the same module. Use a const reassignment to narrow:

```ts
const _jwtSecret = process.env.SESSION_SECRET;
if (!_jwtSecret) {
  throw new Error("SESSION_SECRET environment variable is required but not set.");
}
const JWT_SECRET: string = _jwtSecret;
```

Then use `JWT_SECRET` in `jwt.sign()` and `jwt.verify()` without type errors.

**Why:** `jwt.sign(payload, string | undefined)` triggers TS2769 overload mismatch; the explicit `string` annotation after narrowing satisfies the overload.
