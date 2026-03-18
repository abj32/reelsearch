# AGENTS.md

## Purpose
This repo is a full-stack movie search and watchlist app using:
- React (Vite) frontend
- Express backend
- Prisma (PostgreSQL or SQLite)
- OMDb external API

Agents must follow existing architecture and avoid introducing inconsistent patterns.

---

## Architecture Rules

### Backend structure
- Routes (`server/routes`) handle HTTP only (req/res, status codes).
- Services (`server/services`) contain all business logic.
- External API calls (OMDb) MUST stay in `omdb.service.js`.
- Middleware handles auth only (no business logic).
- Utils are pure helpers (no side effects, no API calls).

### Frontend structure
- API calls go through `client/src/services`.
- Components must not call backend directly.

---

## API Design Rules

- Routes MUST validate inputs before calling services.
- Invalid client input → return HTTP 400.
- Services MUST NOT access `req` or `res`.

- Do NOT mix validation, business logic, and HTTP handling in the same layer.

---

## OMDb / External API Rules

- All OMDb requests go through `omdb.service.js`.
- Do NOT duplicate fetch logic anywhere else.

### Error handling
- "No results" from OMDb → return empty array `[]`.
- Network/API errors → throw (handled as server error).
- Never silently convert API errors into empty results.

---

## Search Behavior

- Search endpoints return a consistent movie object shape.
- Do NOT return raw, inconsistent OMDb payloads across endpoints.
- If transforming data (e.g., ratings), do it in a single consistent place.

- Partial failures (e.g., one movie detail fails) should NOT crash the entire search unless explicitly required.

---

## Database / Watchlist Rules

- Prisma is the single source of truth for DB access.
- Do NOT mix raw DB queries with Prisma.
- Watchlist entries must have a consistent schema (no partial movie objects).

---

## Code Change Rules

- Reuse existing services before adding new logic.
- Do NOT duplicate OMDb or database access code.
- Prefer small, targeted changes over large rewrites.

- Follow existing patterns exactly unless explicitly changing them.

---

## What to Avoid

- Duplicating API calls in routes
- Mixing layers (routes doing service work, services doing HTTP work)
- Silent failure handling
- Inconsistent response shapes
- “Quick fixes” that bypass existing structure

---

## Definition of Done

A change is complete when:
- It follows the architecture above
- It does not duplicate logic
- It handles errors explicitly and consistently
- It keeps API responses predictable for the frontend