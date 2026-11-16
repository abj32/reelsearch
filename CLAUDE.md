## Architecture

- Much of the code predates these rules; the gaps are filed as issues. Write new code to the rules, not to nearby code.
- Routes (`server/routes`) do HTTP only: parse input with the route's Zod schema, call a service, map errors to status codes.
- Services own all Prisma, catalog and auth logic, take plain arguments, and never see `req`/`res`.
- Only the catalog service calls TMDB or OMDb, and it returns our camelCase `Title` shape, never provider payloads.
- Provider "no results" returns `[]`; provider failures throw. An empty result never stands in for an error.
- `server/utils` hold pure functions with no I/O.
- Client components reach the API only through `client/src/services`.
- Error responses are `{ code, message }`, plus `details` on validation errors.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`abj32/reelsearch`), via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
