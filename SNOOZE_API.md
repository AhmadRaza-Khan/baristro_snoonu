# Baristro Snoonu — Snoozing & Availability API

Reference for external dashboard frontends (a different origin than this backend) that need to view and manage product snoozing, branch open/closed status, branch busy status, and branch working hours.

Scope: everything in `src/snooze/` (`SnoozeController` / `SnoozeService`). Menu/catalog sync, orders, and Odoo integration are out of scope for this document.

## Base URL

```
https://baristrosnoonu.cyberboost.io
```

All endpoints below are relative to this base URL.

## CORS

Cross-origin requests are allowed from a single configured origin, read from the `DASHBOARD_URL` environment variable on the server (`src/main.ts`):

```ts
app.enableCors({
  origin: process.env.DASHBOARD_URL,
  credentials: true,
});
```

**Note:** as of this writing, `DASHBOARD_URL` in `.env` is set to `https://thebaristro-qa-baristro-practice-35272900.dev.odoo.com`, which looks like a leftover Odoo URL, not a real dashboard origin. Update it to the actual dashboard's origin before this integration will work.

These routes are unauthenticated — there is no login step and no token/cookie to attach to requests. Anyone who can reach the base URL (or is served from the allowed `DASHBOARD_URL` origin per CORS above) can call every endpoint below directly.

## Concept: Branch = Store

There is currently **one branch**, represented internally as a `Store` row keyed by a single `CHANNELL_ID` environment variable. There is no "list branches" endpoint — every store/busy/hours endpoint below implicitly operates on that one configured branch. If multi-branch support is needed later, this is a backend change (the `Store` model already supports multiple rows by `channelId`, but nothing in the service layer iterates over more than the one configured `channelId` yet).

---

## Products

### `GET /snooze/products`

Returns all products with their current effective snooze status.

```json
[
  {
    "id": 1,
    "productId": 616,
    "imageUrl": "https://...",
    "variants": [ { "price": 21, "name": { "en": "...", "ar": "..." }, "...": "..." } ],
    "attributes": [],
    "isSynced": true,
    "isSnoozed": false,
    "snoozedUntil": null,
    "createdAt": "2026-06-09T08:42:01.598Z",
    "updatedAt": "2026-07-23T16:01:03.306Z",
    "productNameAr": "...",
    "productNameEn": "Americano"
  }
]
```

`isSnoozed` in the response is **effective** status, not the raw DB flag: if `snoozedUntil` is in the past, the product is reported as `isSnoozed: false` even if the underlying DB row hasn't been flipped back yet (self-healing read — see [Effective status](#effective-status-self-healing) below).

### `PATCH /snooze/products/:id/snooze`

Toggles a single product's snooze status. `:id` is `productId` (not the internal `id`).

- **Turning snooze ON** (product currently active → snoozed): body must include `until`, an ISO 8601 datetime string for when it should automatically become available again.
- **Turning snooze OFF** (product currently snoozed → active): body may be empty; `until` is ignored/cleared.

```
PATCH /snooze/products/616/snooze
Content-Type: application/json

{ "until": "2026-07-25T18:00:00.000Z" }
```

Response:
```json
{ "success": true, "isSnoozed": true, "snoozedUntil": "2026-07-25T18:00:00.000Z" }
```

Internally this also pushes the change to Snoonu (`PUT /api/v1/menu/change-snooze-status`) with:
```json
{
  "channelId": "f54d1b32-d3f8-308e-feb3-83772136810d",
  "itemId": "616",
  "operationType": 0,
  "snoozeUntil": "2026-07-25T18:00:00.000Z"
}
```
`operationType: 0` = snoozing, `operationType: 1` = unsnoozing. `snoozeUntil` is always a full ISO 8601 UTC timestamp (with milliseconds) — never a plain `HH:mm` time, unlike the working-hours endpoints below.

---

## Branch open/closed

### `GET /snooze/store`

```json
{ "isSnoozed": false }
```

### `PATCH /snooze/store`

Instantly toggles the branch open/closed flag. No body, no `until` — this is a manual on/off switch, not tied to a schedule. **This does not currently sync anything to Snoonu** — it's a local-only flag (see [Known limitations](#known-limitations)).

```json
{ "success": true, "isSnoozed": true }
```

---

## Branch busy status

Distinct from open/closed above — "busy" means temporarily unable to accept new orders (e.g. kitchen overwhelmed), separate from the branch being open.

### `GET /snooze/store/busy`

```json
{ "isBusy": false, "busyUntil": null }
```

Like product snooze, `isBusy` is effective status — self-healing based on `busyUntil` (see below).

### `PATCH /snooze/store/busy`

Same on/off + `until` pattern as product snooze:

```
PATCH /snooze/store/busy
Content-Type: application/json

{ "until": "2026-07-24T20:00:00.000Z" }
```

```json
{ "success": true, "isBusy": true, "busyUntil": "2026-07-24T20:00:00.000Z" }
```

Turning busy OFF: send an empty body (`{}`), `busyUntil` is cleared to `null`. Internally calls Snoonu's `PATCH /api/v1/stores/busy-status` with `{ channelId, busyUntil }`.

---

## Branch working hours

The weekly recurring schedule (distinct from the instant open/closed toggle and busy status above). Supports **multiple time ranges per day** (e.g. a lunch/dinner split).

### `GET /snooze/store/hours`

Always returns exactly 7 entries, `dayOfWeek` 0–6 (0 = Sunday ... 6 = Saturday, matching JS `Date.getDay()`), regardless of how many days have actually been configured — unconfigured days come back closed with no ranges.

```json
[
  { "dayOfWeek": 0, "isOpen": true, "ranges": [ { "startTime": "07:00", "endTime": "22:00" } ] },
  { "dayOfWeek": 1, "isOpen": true, "ranges": [ { "startTime": "07:00", "endTime": "22:00" } ] },
  { "dayOfWeek": 2, "isOpen": true, "ranges": [ { "startTime": "07:00", "endTime": "22:00" } ] },
  { "dayOfWeek": 3, "isOpen": true, "ranges": [ { "startTime": "07:00", "endTime": "22:00" } ] },
  { "dayOfWeek": 4, "isOpen": true, "ranges": [ { "startTime": "07:00", "endTime": "23:30" } ] },
  { "dayOfWeek": 5, "isOpen": true, "ranges": [
      { "startTime": "07:00", "endTime": "11:00" },
      { "startTime": "12:30", "endTime": "23:30" }
  ] },
  { "dayOfWeek": 6, "isOpen": true, "ranges": [ { "startTime": "07:00", "endTime": "22:00" } ] }
]
```

`startTime`/`endTime` are always plain `"HH:mm"` 24-hour local wall-clock strings — **never** 12-hour AM/PM, and never a full date/timestamp. This is different on purpose from `snoozeUntil`/`busyUntil` above, which are absolute instants and need a real timestamp; working hours are a recurring weekly schedule with no date component.

### `PUT /snooze/store/hours/:dayOfWeek`

Updates **one day at a time**. `:dayOfWeek` is an integer 0–6. The body is a single day object — not the whole week:

```
PUT /snooze/store/hours/5
Content-Type: application/json

{
  "dayOfWeek": 5,
  "isOpen": true,
  "ranges": [
    { "startTime": "07:00", "endTime": "11:00" },
    { "startTime": "12:30", "endTime": "23:30" }
  ]
}
```

```json
{
  "success": true,
  "day": { "dayOfWeek": 5, "isOpen": true, "ranges": [ { "startTime": "07:00", "endTime": "11:00" }, { "startTime": "12:30", "endTime": "23:30" } ] },
  "synced": true
}
```

To update multiple days, send multiple requests (one `PUT` per changed day) — there is no bulk/whole-week endpoint.

`startTime`/`endTime` must match `HH:mm` (validated server-side; anything else, including AM/PM strings, is rejected with a 400).

The save is saved to the database first, then best-effort synced to Snoonu's `PUT /api/v1/stores` (whole-week `weekdayAvailabilities` payload, built from all 7 days including the one you just changed). If that sync fails, the response still reports `"success": true` (your edit is safely persisted) but `"synced": false` with a `"warning"` message — the frontend should surface that as a non-blocking warning, not treat it as a failed save.

```json
{ "success": true, "day": { "...": "..." }, "synced": false, "warning": "Saved locally, but failed to sync to Snoonu: <error>" }
```

---

## Effective status (self-healing)

`Product.isSnoozed` / `Store.isBusy` in the database are **not** automatically flipped back to `false` when `snoozedUntil` / `busyUntil` passes — there's no cron job for this. Instead, every read endpoint (`GET /snooze/products`, `GET /snooze/store/busy`) computes the *effective* status on the fly:

```
effectively active = raw flag is true
                      AND (until is null OR until is still in the future)
```

So the dashboard never needs to check `until` itself and compare it to the current time — the API always reports the correct current state. Just be aware the raw DB row can lag behind what the API reports; don't read the database directly for this, always go through the API.

---

## Known limitations

- **Single branch only** — see [Concept: Branch = Store](#concept-branch--store).
- **These routes are unauthenticated** — access control is CORS-origin only (`DASHBOARD_URL`), not a login/token. Anything reachable at the base URL can call them.
- **`PATCH /snooze/store` (open/closed) does not sync to Snoonu** — it only flips a local flag. This was a deliberate fix: the endpoint previously sent a hardcoded, incorrect weekly-hours payload to Snoonu on every toggle, corrupting the real schedule. No replacement "close branch now" Snoonu call has been identified yet.
- **Split-hours → Snoonu payload mapping is still unverified.** When a day has multiple ranges, the sync sends one `weekdayAvailabilities` entry per range, all sharing that day's index. This matches how the UI mockup displays split hours, but hasn't been confirmed against Snoonu's actual API contract — the DB save itself doesn't depend on this being right (see the `synced`/`warning` behavior above), but the Snoonu-facing effect of split hours may need a follow-up fix once verified.
- **Closed days still require a valid, ordered `HH:mm` pair.** Snoonu's `/api/v1/stores` validation rejects empty `openingTime`/`closingTime` strings even when `isClosed: true` — it needs a syntactically valid time range regardless. Closed days are sent as `openingTime: "00:00", closingTime: "23:59", isClosed: true` (confirmed via a live `400 validation-failure` response before this fix).
