# ReelSearch design

This document records the intended design of the whole system and the reasons behind it. Domain terms (Title, watchlist item, composite score and others) are defined in [`GLOSSARY.md`](../GLOSSARY.md).

Much of the current code predates this design. Each gap links the GitHub issue that tracks it. Later changes to a decision here go in an ADR under `docs/adr/`, and this document is then rewritten to match.

## 1. Overview

ReelSearch is a production-quality portfolio web app. People search a catalog of movies, series and games, see each Title's metadata and critic scores at a glance, and keep a personal watchlist.

Objectives:
- Find a Title fast and judge it from one screen: poster, plot, director, actors, genre, runtime and critic scores.
- Keep a watchlist that can be sorted, filtered and queried in plain English.
- Let anyone try every feature in one click: each visitor gets a private, temporary guest account, so the live demo collects no personal data.
- Build it to production standard, so real accounts can be added in phase 2 without a redesign.
- Show production engineering practice to people reviewing the code.

## 2. Target users and their needs

| User | Need |
|---|---|
| Member of the public trying the live site | Use every feature at once, with no sign-up form and no personal data handed over |
| Reviewer judging the code (recruiter, engineer) | Read a codebase with clear layers, tests, CI and a documented design |

## 3. Functional requirements

| # | Requirement | Acceptance criterion |
|---|---|---|
| F1 | Search Titles by name, without signing in | A query returns one page of Titles in the shared camelCase shape; a query with no matches returns `[]` with status 200 |
| F2 | Page through search results | `page=2` returns the next page from TMDB |
| F3 | Sort and filter search results | Results sort by relevance, composite score, title or year, and filter by movie, series or game |
| F4 | See a Title's details at a glance | The detail view shows poster, plot, director, actors, genre, runtime, age rating, year, each critic score and the composite score |
| F5 | Add a Title to the watchlist, from search results or the detail view | The Title appears in the watchlist; adding it twice returns 409 |
| F6 | Remove a Title from the watchlist, from the watchlist page or search results ([#42](https://github.com/abj32/reelsearch/issues/42)) | The Title no longer appears in the watchlist |
| F7 | Sort and filter the watchlist by type, genre, year, runtime and each score | The returned items match every filter and are in the requested order |
| F8 | Query the watchlist in plain English (watchlist chat) | "show my sci-fi movies after 2015" returns only matching items; a request outside filter and sort returns a clear error |
| F9 | View a profile with watchlist stats | The profile shows item count, average composite score and counts by type |
| F10 | Get a guest account on first visit, with no form | A first-time visitor has a session and a watchlist seeded with about 15 sample Titles |
| F11 | Guest data expires | A guest, their session and watchlist are deleted 7 days after their last activity |
| F12 | Read the privacy notice | A public page says what the demo stores, that IP addresses are processed for rate limiting and logs, and when guest data is deleted |

Gaps: F2 needs [#57](https://github.com/abj32/reelsearch/issues/57). F10 needs [#59](https://github.com/abj32/reelsearch/issues/59) and [#71](https://github.com/abj32/reelsearch/issues/71). F11–F12 need [#71](https://github.com/abj32/reelsearch/issues/71).

## 4. Nonfunctional requirements

| Area | Requirement |
|---|---|
| Performance | A warm search responds in under 3 seconds. No request waits on a platform cold start of more than a few seconds. |
| Security | Sessions are server-side and can be revoked at once. Each user reads and changes only their own data. Every input is validated at the API edge. Guest creation, auth, chat and search are rate limited, and OpenAI calls have a global daily cap. Responses never leak stack traces or secrets. |
| Privacy | The live demo collects no personal data. IP addresses, which GDPR counts as personal data, are processed only for rate limiting and logs, and the privacy notice says so. |
| Auditability | Not applicable in the MVP: guests have no account worth protecting. Security events arrive with real accounts in phase 2. |
| Reliability | A catalog provider or OpenAI outage shows a clear error and never loses watchlist data. Search still works when the daily OMDb budget is spent, without critic scores. |
| Observability | Server errors reach an error tracker with the request path. Logs are structured JSON. |
| Accessibility | The client meets WCAG 2.2 AA. |
| Cost | Hosting, database and error tracking run on free tiers. OpenAI stays under about $5 a month. |

Gaps: security [#62](https://github.com/abj32/reelsearch/issues/62) and [#71](https://github.com/abj32/reelsearch/issues/71), privacy [#71](https://github.com/abj32/reelsearch/issues/71), observability [#67](https://github.com/abj32/reelsearch/issues/67), accessibility [#68](https://github.com/abj32/reelsearch/issues/68). The performance target needs the move off Render ([#61](https://github.com/abj32/reelsearch/issues/61)).

## 5. MVP scope

In scope: every requirement in sections 3 and 4.

| Out of scope | Reason |
|---|---|
| **Phase 2: real accounts** ([milestone](https://github.com/abj32/reelsearch/milestone/1)): email/password sign-up with guest-to-account linking ([#72](https://github.com/abj32/reelsearch/issues/72)), email verification and password reset ([#60](https://github.com/abj32/reelsearch/issues/60)), sign-out everywhere, data export and account deletion with a full privacy policy ([#63](https://github.com/abj32/reelsearch/issues/63)), security events ([#64](https://github.com/abj32/reelsearch/issues/64)), custom domain | Guest accounts let the live demo collect no personal data, which removes privacy and account-security duties until real accounts are needed |
| AI discovery and recommendations | A later roadmap phase that builds on the catalog service |
| User ratings of Titles ([#28](https://github.com/abj32/reelsearch/issues/28), [#29](https://github.com/abj32/reelsearch/issues/29)) | A feature for after the MVP |
| Google or GitHub sign-in | Email and password is enough for phase 2; Better Auth can add social sign-in later without a redesign |
| Multiple watchlists and social features | No user need identified |
| Native mobile app | The responsive web app covers mobile |
| Logging every data read | Only account data is sensitive, so phase 2 security events will cover the audit need |
| Containers in production | Vercel deploys functions, not containers |

## 6. Tech stack

Each row records the choice, the alternatives considered, the reason, and the trade-off accepted. The original stack was chosen without review; every row below was re-checked against 2026 common practice and confirmed.

| Area | Choice | Alternatives | Reason | Trade-off |
|---|---|---|---|---|
| Language | TypeScript (migration under way, [#70](https://github.com/abj32/reelsearch/issues/70)) | JavaScript | Type safety; expected in portfolio code | A build and type-check step |
| Frontend | React 19 + Vite | Next.js | Current mainstream; a single-page app with a separate API needs no server rendering | No server rendering for search pages |
| Routing and styling | React Router, Tailwind CSS v4 | — | Rationale: unconfirmed | — |
| Backend | Express 5 | Fastify, Hono | The most widely known Node framework, so reviewers read it easily | Fewer built-ins than Fastify (validation, schemas) |
| Validation | Zod ([#55](https://github.com/abj32/reelsearch/issues/55)) | Hand-written checks | The most common Express pairing in 2026; one schema checks requests, model output and feeds the API spec | One more dependency |
| Database | PostgreSQL on Neon | SQLite, other hosted Postgres | Free tier, Vercel integration, branch per preview; the schema needs Postgres list columns | The free database sleeps after about 5 minutes idle, adding a short wake-up delay |
| ORM | Prisma, upgrading 6 → 7 ([#70](https://github.com/abj32/reelsearch/issues/70)) | Drizzle | Already in use; 7 is current | Heavier client than Drizzle |
| Auth and sessions | Better Auth with database sessions; its anonymous plugin creates guests ([#59](https://github.com/abj32/reelsearch/issues/59)) | Hand-written JWT cookie (current), hand-written sessions, one shared demo account | Maintained library with revocable sessions, rate limiting and CSRF checks. Per-visitor guests keep watchlists private, unlike a shared account. The plugin can later turn a guest into a real account. | A dependency that controls auth tables and routes; guest creation must be rate limited |
| Catalog | TMDB for search and metadata ([#57](https://github.com/abj32/reelsearch/issues/57)) | OMDb alone (current) | Richer data, hosted images, higher limits; one call per search page | TMDB has no critic scores; non-commercial use only, with attribution |
| Critic scores | OMDb, looked up by IMDb id | None found with all three scores | The only free source of IMDb, Rotten Tomatoes and Metacritic scores together | Free cap of 1,000 calls a day, so calls are cached and budgeted |
| LLM | OpenAI `gpt-5.4-mini` with structured outputs | — | Already works and is cheap | Per-request cost, so chat is rate limited |
| Email (phase 2) | Resend ([#60](https://github.com/abj32/reelsearch/issues/60)) | — | Free plan of 3,000 emails a month, 100 a day | Needs a verified custom domain |
| Hosting | One Vercel project for client and API ([#61](https://github.com/abj32/reelsearch/issues/61)) | Render (current), Google Cloud free VM | Express runs as a function with pre-warming, so cold starts are rare and short; one domain removes CORS and the public API origin; built-in firewall | No long-running processes or in-memory state; Hobby plan is non-commercial only |
| Edge security | Vercel Firewall | Cloudflare proxy in front | Vercel already provides WAF, DDoS mitigation and bot protection, and advises against a proxy in front because it hides client IPs from them | Hobby allows 3 custom rules, 1 of them a rate limit |
| Domain (phase 2) | One personal domain, ReelSearch on a `reelsearch.` subdomain | Free platform subdomain | Needed to send email; one domain serves all projects | About $10–15 a year |
| Testing | Vitest + Supertest ([#48](https://github.com/abj32/reelsearch/issues/48)) | Jest | The standard 2026 setup for ESM Express | — |
| Logging and errors | pino + Sentry free tier ([#67](https://github.com/abj32/reelsearch/issues/67)) | `console.error` (current) | Searchable JSON logs; errors with context | Free-tier event limits |

## 7. Architecture

### Components

| Component | Responsibility | Talks to |
|---|---|---|
| Client (React SPA) | All UI; calls the API only through `client/src/services` | API, over HTTPS on the same domain |
| API (Express on a Vercel Function) | Auth, validation, business rules, persistence | Postgres, TMDB, OMDb, OpenAI; Resend in phase 2 |
| Postgres (Neon) | Users (guests in the MVP), sessions, Titles, watchlist items | API, through Prisma only |
| Daily cron job (Vercel Cron) | Refreshes the stalest Titles; deletes expired guests | API |
| TMDB, OMDb | Title metadata; critic scores | Catalog service only |
| OpenAI | Turns watchlist chat into filter and sort parameters | Chat service only |

### Layer boundaries

- **Routes** (`server/routes`) handle HTTP only. Each parses input with its Zod schema, calls a service, and maps results and errors to status codes.
- **Services** (`server/services`) own business rules, all Prisma access, catalog access and auth logic. They take plain arguments and never see `req` or `res`.
- **Catalog service** is the only code that calls TMDB or OMDb. It returns our Title shape and computes critic and composite scores in one place.
- **Middleware** handles cross-cutting request concerns: session lookup, security headers, rate limits.
- **Utils** (`server/utils`) are pure functions with no I/O.

Decision: layered routes and services.
- **Alternatives:** routes calling Prisma directly; a separate controllers layer.
- **Reason:** keeps HTTP, rules and data access apart, so services are testable without HTTP and logic exists once.
- **Trade-off:** more files than the app strictly needs at its size.

Gaps: routes call Prisma and parse OMDb data today ([#54](https://github.com/abj32/reelsearch/issues/54)); the watchlist query is copied into two routes ([#54](https://github.com/abj32/reelsearch/issues/54)); the catalog service is still `omdb.service.js` ([#57](https://github.com/abj32/reelsearch/issues/57)).

## 8. Data model

The schema lives in [`prisma/schema.prisma`](../prisma/schema.prisma). It currently stores a full copy of Title data in each watchlist item; [#58](https://github.com/abj32/reelsearch/issues/58) moves it to the model below.

Rules the schema can't show:
- **Title is shared and has no owner.** It is a cache of catalog data and critic scores, keyed by TMDB id, with the IMDb id stored for OMDb lookups. Deleting a user leaves Titles in place.
- **A watchlist item is (user, Title, date added).** The user owns it; deleting the user deletes it. One user can save a Title once, which is why (user, Title) is unique.
- **A watchlist holds at most 1,000 items.** This keeps the watchlist unpaginated.
- **Titles refresh by age.** Each Title stores `fetchedAt`. The daily cron job refreshes the oldest first, within a share of the daily OMDb budget. Watchlist reads never call a provider.
- **Scores are computed once.** The catalog service converts each critic score to 0–100 and averages the ones present into the composite score, stored on the Title.
- **Guests expire.** The daily cron job deletes a guest 7 days after their last activity; their sessions and watchlist go with them. A new guest's watchlist is seeded with about 15 sample Titles.
- **Sessions belong to Better Auth.** Its tables are generated from its Prisma adapter.
- **Prisma is the only database access.** No raw SQL.

Gap: [#71](https://github.com/abj32/reelsearch/issues/71) adds seeding and expiry. Phase 2 adds security events ([#64](https://github.com/abj32/reelsearch/issues/64)).

## 9. API design

No machine-readable spec exists yet. Endpoints are listed in the README's "API Overview". [#69](https://github.com/abj32/reelsearch/issues/69) generates an OpenAPI spec from the Zod schemas, so it stays in step with the code; link it here once it exists.

| Convention | Rule |
|---|---|
| Response shape | Search and watchlist return the same camelCase Title object, shaped once on the server |
| Error shape | `{ code, message }`, plus a `details` array of field problems on validation errors |
| 400 | Invalid input |
| 401 / 403 | Not signed in / not allowed |
| 404 / 409 | Not found / conflict, such as a duplicate watchlist item or a full watchlist |
| 429 | Rate limited |
| 500 | Unexpected server error |
| 502 / 503 | A catalog provider or OpenAI failed or is unavailable |
| Versioning | Not applicable: the only client deploys with the API from the same repo |
| Pagination | Search takes `page`, passed through to TMDB. The watchlist is unpaginated because of its 1,000-item cap. |

Gaps: shapes differ today ([#56](https://github.com/abj32/reelsearch/issues/56)); validation details and correct 400s ([#55](https://github.com/abj32/reelsearch/issues/55), [#46](https://github.com/abj32/reelsearch/issues/46)); provider failures return 500, not 502/503 ([#57](https://github.com/abj32/reelsearch/issues/57)).

## 10. Security and error handling

### Auth flow

1. A first-time visitor gets a guest from Better Auth's anonymous plugin, with no email or password.
2. The guest gets an httpOnly, Secure, SameSite=Lax session cookie.
3. Each protected request looks up the session in Postgres, so a deleted guest's session fails at once.
4. The daily cron job deletes guests 7 days after their last activity.

Phase 2 adds email/password accounts that a guest can convert to, keeping their watchlist ([#72](https://github.com/abj32/reelsearch/issues/72)).

### Protection

- **Input:** Zod validates every body, query and path parameter, and the watchlist chat model's output.
- **Rate limits:** Better Auth limits auth routes, including guest creation per IP. The API limits chat and search per user, and caps OpenAI calls per day across all users, so many guests can't run up the bill. One Vercel WAF rule limits `/api/*` per IP. All counters live in Postgres, because function instances share no memory.
- **Edge:** Vercel provides DDoS mitigation and bot protection. The API has no public origin other than the Vercel domain.
- **Headers and CSRF:** `helmet` sets security headers; Better Auth checks request origin.
- **Secrets:** stored only in Vercel environment variables, never in the repo or client bundle.
- **Dependencies:** Dependabot opens PRs for vulnerable packages.
- **Audit:** phase 2 ([#64](https://github.com/abj32/reelsearch/issues/64)), because guests have no account to protect.

### How external failures reach users

- A catalog provider's "no results" response becomes `[]`. Any provider failure throws; an empty result never stands in for an error.
- If one Title's lookup fails during search, that Title is dropped and the failure is logged; the rest of the results return.
- If the daily OMDb budget is spent, search returns Titles with `scores: null` and logs it.
- If TMDB or OpenAI fails, the API returns 502 or 503 with a clear message; the client shows it.
- Unexpected errors return 500 with a generic message, are logged as JSON, and go to Sentry.

Gaps: JWT auth with register and login is still in place ([#59](https://github.com/abj32/reelsearch/issues/59)); auth errors crash their own catch blocks ([#53](https://github.com/abj32/reelsearch/issues/53)); headers, rate limits and Dependabot ([#62](https://github.com/abj32/reelsearch/issues/62)); guest limits and the OpenAI cap ([#71](https://github.com/abj32/reelsearch/issues/71)); failed lookups aren't logged ([#57](https://github.com/abj32/reelsearch/issues/57)).

## 11. Testing and deployment

### Test levels

| Level | Tool | Covers |
|---|---|---|
| Unit | Vitest | Services and utils, with providers and OpenAI mocked |
| Integration | Vitest + Supertest against Docker Postgres | Each route through to the database |
| Accessibility | axe | Each page |

Gap: no tests exist yet ([#48](https://github.com/abj32/reelsearch/issues/48)).

### Environments

| Environment | Runs on | Database |
|---|---|---|
| Local | `npm run dev` | Postgres in Docker Compose |
| Preview | One Vercel preview per PR | Its own Neon branch (a copy-on-write copy of production), removed when the Git branch is deleted |
| Production | Vercel, from `main` | Neon main branch |

### Release process

1. Open a PR from a `<type>/<short-desc>` branch.
2. CI runs lint, type check and tests; branch protection blocks merging until they pass.
3. Review the Vercel preview.
4. Merge to `main`; Vercel builds, runs `prisma migrate deploy`, and deploys to production.

Gaps: the API still runs on Render ([#61](https://github.com/abj32/reelsearch/issues/61)); no CI or preview branches ([#66](https://github.com/abj32/reelsearch/issues/66)); no Docker Compose ([#65](https://github.com/abj32/reelsearch/issues/65)).

## 12. Open questions

| Question | Blocks |
|---|---|
| How is the daily OMDb budget split between search and the refresh job? | [#57](https://github.com/abj32/reelsearch/issues/57), [#58](https://github.com/abj32/reelsearch/issues/58) |
| What are the per-user chat and search limits, the per-IP guest-creation limit, and the global daily OpenAI cap? | [#62](https://github.com/abj32/reelsearch/issues/62), [#71](https://github.com/abj32/reelsearch/issues/71) |
| Do the TMDB and OMDb terms allow caching Title data, and for how long? | [#58](https://github.com/abj32/reelsearch/issues/58) |
| Which sample Titles seed a new guest's watchlist? | [#71](https://github.com/abj32/reelsearch/issues/71) |
| Which domain name to buy? | Phase 2 ([#60](https://github.com/abj32/reelsearch/issues/60)) |
