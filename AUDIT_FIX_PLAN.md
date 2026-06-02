# Oven Xpress — Audit Fix Plan

**Generated:** 2026-06-02  
**Scope:** Pre-PR-007 production readiness remediation  
**Status:** All items implemented and verified

---

## Priority 1 — Critical Build Breakers

### 1.1 Addresses validation schema mismatch

| Field              | Detail                                                                                                                                                                                                                    |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Root Cause**     | `addresses.validation.ts` exported nested `z.object({ body: ... })` schemas, but `validate()` middleware expects a flat `ValidationSchema` with top-level `body` / `params` keys (same pattern as `users.validation.ts`). |
| **Affected Files** | `backend/src/modules/addresses/addresses.validation.ts`, `backend/src/modules/addresses/addresses.routes.ts`                                                                                                              |
| **Exact Fix**      | Split into `createAddressBodySchema`, `updateAddressBodySchema`, and `addressIdParamSchema`. Update routes to `validate({ body: ... })` and `validate({ params: ..., body: ... })`.                                       |
| **Risk Level**     | High — blocked TypeScript compilation and CI build                                                                                                                                                                        |
| **Estimated Time** | 30 minutes                                                                                                                                                                                                                |

### 1.2 Addresses service Prisma type error

| Field              | Detail                                                                                                                                                                       |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Cause**     | `createAddress` accepted `Record<string, unknown>` and spread it into `prisma.address.create`, which TypeScript could not narrow to `AddressUncheckedCreateInput`.           |
| **Affected Files** | `backend/src/modules/addresses/addresses.service.ts`, `backend/src/modules/addresses/addresses.controller.ts`                                                                |
| **Exact Fix**      | Type inputs with `Prisma.AddressUncheckedCreateInput` (omit `userId`) and `Prisma.AddressUpdateInput`. Zod-validated `req.body` is passed directly after middleware parsing. |
| **Risk Level**     | High — blocked `tsc --noEmit`                                                                                                                                                |
| **Estimated Time** | 20 minutes                                                                                                                                                                   |

### 1.3 Frontend ESLint failures (8 errors)

| Field              | Detail                                                                                                                                                                                            |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Root Cause**     | Unused imports/variables in catalog pages and `catalogQueries.ts`; stale `eslint-disable` in `SEO.tsx`.                                                                                           |
| **Affected Files** | `RestaurantDetailPage.tsx`, `RestaurantsPage.tsx`, `catalogQueries.ts`, `SEO.tsx`                                                                                                                 |
| **Exact Fix**      | Remove unused `motion`, `useEffect`, `CheckCircle`, `refetch`, `isClosed`; prefix or remove unused mutation callback args; replace `any` with `unknown` and remove unnecessary disable directive. |
| **Risk Level**     | High — CI lint gate (`--max-warnings 0`)                                                                                                                                                          |
| **Estimated Time** | 15 minutes                                                                                                                                                                                        |

### 1.4 CI workflow typo and missing Prisma step

| Field              | Detail                                                                                                         |
| :----------------- | :------------------------------------------------------------------------------------------------------------- |
| **Root Cause**     | GitHub Actions used invalid `node-size` key instead of `node-version`; no `prisma validate` step before build. |
| **Affected Files** | `.github/workflows/ci.yml`                                                                                     |
| **Exact Fix**      | Correct to `node-version: '18.x'`; add `npx prisma validate --schema src/database/schema.prisma` step.         |
| **Risk Level**     | High — CI could fail or skip Node setup                                                                        |
| **Estimated Time** | 10 minutes                                                                                                     |

### 1.5 Prettier formatting drift (86 files)

| Field              | Detail                                                                         |
| :----------------- | :----------------------------------------------------------------------------- |
| **Root Cause**     | Repository files were not consistently formatted against root Prettier config. |
| **Affected Files** | Workspace-wide                                                                 |
| **Exact Fix**      | Run `npx prettier --write .` from monorepo root.                               |
| **Risk Level**     | Medium — blocked `format:check` in CI                                          |
| **Estimated Time** | 5 minutes                                                                      |

---

## Priority 2 — Security Issues

### 2.1 Access token stored in localStorage (XSS risk)

| Field              | Detail                                                                                                                                                                                                                                                                                         |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Cause**     | Frontend persisted JWT in `localStorage` and attached via `Authorization` header; any XSS could exfiltrate tokens.                                                                                                                                                                             |
| **Affected Files** | `frontend/src/features/auth/store/authSlice.ts`, `frontend/src/services/apiClient.ts`, `frontend/src/routes/AppRoutes.tsx`, auth route guards, `backend/src/modules/auth/auth.controller.ts`, `backend/src/middleware/authGuard.ts`                                                            |
| **Exact Fix**      | Set `accessToken` as HttpOnly cookie on login/refresh/Google auth; clear on logout. Add `extractAccessToken()` utility (cookie first, Bearer fallback). Frontend uses `withCredentials: true`, in-memory `isAuthenticated` flag, silent refresh on 401. Remove all `localStorage` token usage. |
| **Risk Level**     | Critical                                                                                                                                                                                                                                                                                       |
| **Estimated Time** | 2 hours                                                                                                                                                                                                                                                                                        |

### 2.2 Refresh token rotation preservation

| Field              | Detail                                                                                                       |
| :----------------- | :----------------------------------------------------------------------------------------------------------- |
| **Root Cause**     | N/A — rotation logic existed; needed cookie pairing with new access token model.                             |
| **Affected Files** | `backend/src/modules/auth/auth.service.ts`, `auth.controller.ts`, `backend/src/utils/authCookies.ts`         |
| **Exact Fix**      | Centralize cookie options; rotate both cookies on `/auth/refresh`; revoke-all on replay detection unchanged. |
| **Risk Level**     | High                                                                                                         |
| **Estimated Time** | 30 minutes (included in 2.1)                                                                                 |

### 2.3 Global rate limiting not applied

| Field              | Detail                                                                                                |
| :----------------- | :---------------------------------------------------------------------------------------------------- |
| **Root Cause**     | `apiRateLimiter` was defined but never mounted on the Express app.                                    |
| **Affected Files** | `backend/src/middleware/rateLimiter.ts`, `backend/src/app.ts`                                         |
| **Exact Fix**      | Add `app.use(apiRateLimiter)` after CORS; keep `authRateLimiter` and `otpRateLimiter` on auth routes. |
| **Risk Level**     | Medium                                                                                                |
| **Estimated Time** | 15 minutes                                                                                            |

### 2.4 Security middleware verification

| Field              | Detail                                                                                                                                                  |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Root Cause**     | Helmet, Zod validation, JWT guard, and RBAC existed but access-token cookie path was incomplete.                                                        |
| **Affected Files** | `backend/src/app.ts`, `backend/src/middleware/*`, `backend/src/modules/*/routes.ts`                                                                     |
| **Exact Fix**      | Verified Helmet + `express.json` limit; confirmed Zod `validate()` on routes; extended `authGuard` and catalog `optionalAuth` to read HttpOnly cookies. |
| **Risk Level**     | Medium                                                                                                                                                  |
| **Estimated Time** | 30 minutes                                                                                                                                              |

---

## Priority 3 — Performance Improvements

### 3.1 Menu/catalog N+1 and over-fetching

| Field              | Detail                                                                                                                                                                                                           |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Cause**     | Restaurant detail loaded full product graphs with deep `include`; list endpoints lacked pagination.                                                                                                              |
| **Affected Files** | `backend/src/modules/catalog/catalog.service.ts`, `catalog.controller.ts`, `catalog.routes.ts`, `catalog.validation.ts`                                                                                          |
| **Exact Fix**      | Replace broad `include` with targeted `select`; cap restaurant menu products (`take: 50`); add pagination + `meta` to branches, categories, favorites, reviews; use `prisma.$transaction` for count+fetch pairs. |
| **Risk Level**     | Medium — performance degradation at scale                                                                                                                                                                        |
| **Estimated Time** | 2 hours                                                                                                                                                                                                          |

### 3.2 React route code splitting

| Field              | Detail                                                                                                                                                                         |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Cause**     | Layout components were statically imported, reducing lazy-load effectiveness.                                                                                                  |
| **Affected Files** | `frontend/src/routes/AppRoutes.tsx`                                                                                                                                            |
| **Exact Fix**      | `React.lazy()` for `CustomerLayout`, `ProfileLayout`, `ErrorLayout`, `MainLayout`; existing page-level lazy imports retained; `Suspense` boundary with `RouteLoader` fallback. |
| **Risk Level**     | Low                                                                                                                                                                            |
| **Estimated Time** | 30 minutes                                                                                                                                                                     |

### 3.3 API client 401 refresh queue

| Field              | Detail                                                                                 |
| :----------------- | :------------------------------------------------------------------------------------- |
| **Root Cause**     | No coordinated token refresh on concurrent 401 responses after cookie migration.       |
| **Affected Files** | `frontend/src/services/apiClient.ts`                                                   |
| **Exact Fix**      | Implement refresh queue with single in-flight `/auth/refresh` call and request replay. |
| **Risk Level**     | Low                                                                                    |
| **Estimated Time** | 45 minutes                                                                             |

---

## Priority 4 — Documentation Improvements

### 4.1 Architecture.md — auth flow outdated

| Field              | Detail                                                                                                     |
| :----------------- | :--------------------------------------------------------------------------------------------------------- |
| **Root Cause**     | Document described access token returned in JSON body.                                                     |
| **Affected Files** | `docs/Architecture.md`                                                                                     |
| **Exact Fix**      | Update sequence diagram and token storage bullets for dual HttpOnly cookies; document global rate limiter. |
| **Risk Level**     | Low                                                                                                        |
| **Estimated Time** | 20 minutes                                                                                                 |

### 4.2 API-Spec.md — headers and auth

| Field              | Detail                                                                                     |
| :----------------- | :----------------------------------------------------------------------------------------- |
| **Root Cause**     | Spec listed Bearer-only authentication.                                                    |
| **Affected Files** | `docs/API-Spec.md`                                                                         |
| **Exact Fix**      | Document cookie-based auth as primary; Bearer as fallback; `Set-Cookie` on auth responses. |
| **Risk Level**     | Low                                                                                        |
| **Estimated Time** | 15 minutes                                                                                 |

### 4.3 Database.md — catalog pagination

| Field              | Detail                                                                          |
| :----------------- | :------------------------------------------------------------------------------ |
| **Root Cause**     | No documentation of paginated catalog endpoints or select optimization.         |
| **Affected Files** | `docs/Database.md`                                                              |
| **Exact Fix**      | Add "Catalog Query Optimization" table with pagination parameters per endpoint. |
| **Risk Level**     | Low                                                                             |
| **Estimated Time** | 15 minutes                                                                      |

### 4.4 README.md — outdated auth reference

| Field              | Detail                                                                                         |
| :----------------- | :--------------------------------------------------------------------------------------------- |
| **Root Cause**     | Commit example referenced `localStorage` token storage.                                        |
| **Affected Files** | `README.md`                                                                                    |
| **Exact Fix**      | Update conventional commit example; add Prisma validate and `tsc` commands to quality section. |
| **Risk Level**     | Low                                                                                            |
| **Estimated Time** | 10 minutes                                                                                     |

---

## Verification Checklist (Post-Fix)

| Check          | Command                                                                 | Expected       |
| :------------- | :---------------------------------------------------------------------- | :------------- |
| Backend lint   | `cd backend && npm run lint`                                            | Exit 0         |
| Backend types  | `cd backend && npx tsc --noEmit`                                        | Exit 0         |
| Frontend lint  | `cd frontend && npm run lint`                                           | Exit 0         |
| Frontend types | `cd frontend && npx tsc --noEmit`                                       | Exit 0         |
| Prettier       | `npm run format:check`                                                  | All files pass |
| Prisma         | `cd backend && npx prisma validate --schema src/database/schema.prisma` | Valid          |
| Backend build  | `cd backend && npm run build`                                           | Exit 0         |
| Frontend build | `cd frontend && npm run build`                                          | Exit 0         |

**All checks passed on 2026-06-02.**
