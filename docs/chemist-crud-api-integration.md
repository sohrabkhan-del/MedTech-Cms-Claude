# Chemist Module — Full CRUD API Integration Spec

Target: wire the Chemist module (`src/features/userManagement/`) to the real
Partner API end-to-end — list (already done), details, create, edit, delete,
activate/deactivate, geotag upload — with server-side pagination/search/sort
and Zod-validated forms. This doc is meant to be handed to Claude Code as a
work order; it names exact files, current state, and the target state.

## 0. Current state (already done)

- `src/features/userManagement/services/chemistApi.ts` — `getChemists` is
  wired to the real API (`GET /partners?type=CHEMIST`) via
  `baseApi.injectEndpoints`, mapped through `mapPartnerChemist()`.
- `src/store/api/baseApi.ts` — mock/real switch already flips `Chemists` to
  `'real'` via `featureModeOverrides`. Reuse this mechanism, do not build a
  new one.
- `src/config/env.ts` — `apiBaseUrl` already points at
  `https://zd02x6zk-3337.inc1.devtunnels.ms/api/v1`.
- **Detail, activate, deactivate — done:**
  - `getChemistDetail` now calls real `GET /partners/:id` (was hitting fake
    `/chemists/:id`), mapped through the same `mapPartnerChemist()`.
  - `activateChemist` / `deactivateChemist` mutations added, calling
    `PATCH /partners/:id/activate` / `/deactivate`. Wired into
    `ChemistListPage.tsx` row actions (toggle visibility by `row.status`)
    and `ChemistDetailsPage.tsx`'s summary header buttons, both via
    `useChemistDetail.ts` / direct mutation hooks, each with success/error
    toasts and cache invalidation.
  - "Assigned MR" on the details page (`PartnerSummaryHeader.tsx`) now
    resolves the `assignedMedicalRepresentativeId` UUID to a real name via
    `medicalRepsApi.ts`'s `getMedicalRepDetail`, which was also fixed to hit
    the real `GET /medical-representatives/:id` (was fake `/medical-reps/:id`).
- **Create, update — done:**
  - `chemistFormSchema.ts` rebuilt to match the real API body (§2/§3) while
    keeping every pre-existing UI field (the `locations` array with
    latitude/longitude/scan radius/buffer radius, and `notes`) — those have
    no matching API field, so `toChemistApiPayload()` strips them before
    sending; they stay in the form purely as local UI state.
  - `createChemist` calls the confirmed real path `POST /partners/create`
    (not `/partners` — corrected from the original guess below).
    `updateChemist` calls `PUT /partners/:id` per the original swagger list
    (not yet independently confirmed against a real response).
  - `ChemistFormPage.tsx` rebuilt: Basic Details, Licensing (GST/PAN/drug
    license), Registered Address (State → District → City cascading
    Autocomplete dropdowns, see below), Geo-tagging & Scanning Range
    (unchanged, UI-only — map picker still pending, see §8), Assignment
    (Region — real dropdown via `getRegions()`; Assigned MR — real
    searchable Autocomplete, see below). Submit calls
    `createChemist`/`updateChemist` with toasts and disables the button
    while in flight.
  - **Territory removed entirely** — dropped from `chemistFormSchema.ts`
    (`ChemistApiPayload` no longer includes `territoryId`), the create/edit
    form, and the list page's filter drawer. Per instruction, it is not
    sent to the API at all on create/update; if the backend actually
    requires it, that will surface as an API validation error to address
    later rather than guessing a default value.
  - **Assigned MR is now a real searchable dropdown**, on both the
    create/edit form and the list page's filter drawer. Backed by a new
    `getMedicalRepOptions` query in `medicalRepsApi.ts`
    (`GET /medical-representatives?page=1&limit=50&status=ACTIVE&sortBy=createdAt&sortOrder=desc`,
    confirmed real endpoint), rendered via MUI `Autocomplete` showing
    `name (employeeCode)`. No more raw-UUID text input.
  - **City/District/State are now cascading dropdowns**, backed by a new
    static dataset `src/constants/indiaLocations.ts` (all 28 states + 8 UTs
    with complete, accurate district lists; a curated, best-effort — not
    exhaustive — list of major towns per district). State selection filters
    the District options, which filter the City options; changing State or
    District resets the fields below it. City is `freeSolo` (typing a value
    not in the curated list is allowed), since the per-district city list is
    intentionally not exhaustive.
  - No delete action exists in the row menu yet.
  - Pagination/search/sort in `CommonTable` is 100% client-side (slices
    `rows` in memory) even though `getChemists` already requests
    `page`/`limit`/`search`/`sortOrder` from the server and the server
    returns `totalItems`/`totalPages`/`currentPage`. Today the API's own
    paging metadata is discarded — `chemistApi.ts` returns just the mapped
    array, not the pagination envelope.

## 1. API surface (base URL: `env.apiBaseUrl`, i.e. `/api/v1`)

All partner types (`CHEMIST`, `DEALER`, etc.) share these endpoints; module
here is `CHEMIST` via `type=CHEMIST`.

| Action | Method | Path | Notes |
|---|---|---|---|
| List | GET | `/partners?page=&limit=&type=CHEMIST&search=&status=&regionId=&territoryId=&assignedMedicalRepresentativeId=&sortBy=&sortOrder=` | Already implemented in `chemistApi.ts` |
| Detail | GET | `/partners/:id` | **Implemented** in `chemistApi.ts` — was hitting fake `/chemists/:id`, now points at `/partners/:id`; response shape assumed to mirror one list item (`{ success, data: { profile, business: [] } }`) until confirmed against a real logged-in response |
| Create | POST | `/partners/create` | **Implemented** — corrected from the original `/partners` guess after a real curl was confirmed. Body in §2 |
| Update | PUT | `/partners/:id` | **Implemented**, per original swagger list — full-object replace, same body shape as create; not yet independently confirmed against a real response |
| Delete | DELETE | `/partners/:id` | Hard delete |
| Deactivate | PATCH | `/partners/:id/deactivate` | **Implemented** in `chemistApi.ts` (no body) |
| Activate | PATCH | `/partners/:id/activate` | **Implemented** in `chemistApi.ts` (no body) — confirmed by backend, mirrors deactivate |
| Geotag | POST | `/partners/:partnerId/geotag` | `multipart/form-data`: `latitude*`, `longitude*`, `accuracy?`, `image*` (binary) |

Activate/deactivate row actions on `ChemistListPage.tsx` and the
Activate/Deactivate buttons on `ChemistDetailsPage.tsx` (via
`PartnerSummaryHeader`) are wired to `useActivateChemistMutation` /
`useDeactivateChemistMutation`, each invalidating the `Chemists` list/detail/
KPI cache tags and showing a toast on success/failure.

## 2. Create/Update request body

```json
{
  "type": "CHEMIST",
  "businessName": "string",
  "ownerFirstName": "string",
  "ownerLastName": "string",
  "email": "user@example.com",
  "phone": "string",
  "country": "91",
  "gstNumber": "string",
  "panNumber": "string",
  "drugLicenseNumber": "string",
  "drugLicenseExpiry": "2026-07-30",
  "addressLine1": "string",
  "addressLine2": "string",
  "landmark": "string",
  "city": "string",
  "district": "string",
  "state": "string",
  "pincode": "string",
  "regionId": "uuid",
  "territoryId": "uuid",
  "assignedMedicalRepresentativeId": "uuid"
}
```

Field notes:
- `type` is always `"CHEMIST"` for this module — hardcode, don't expose in
  the form.
- `country` is a dial code (`"91"`), not free text — default it, don't ask
  the user to type it.
- `drugLicenseExpiry` is `YYYY-MM-DD`.
- `regionId` / `assignedMedicalRepresentativeId` are UUIDs selected from real
  dropdowns: region via `getRegions()` (`GET /regions`), MR via the new
  `getMedicalRepOptions` query (`GET /medical-representatives`) — both
  **implemented**.
- `territoryId` is accepted by the API (per the confirmed create payload)
  but is **deliberately not sent** — removed from the UI entirely per
  instruction, since no territory picker/listing endpoint exists. If the
  backend rejects a request for missing `territoryId`, that will surface as
  an API error to revisit (see §10).

## 3. Zod schema — `chemistFormSchema.ts` (implemented)

**Decision:** keep every field that was already in the UI (the `locations`
field array — address/latitude/longitude/scan radius/buffer radius — and
`notes`), even though `POST /partners/create` / `PUT /partners/:id` has no
matching field for them. They stay as local UI state and are simply not
sent to the API. Geotagging is a separate, post-creation action via the
`/geotag` endpoint against an existing `partnerId` (§8, not yet built) —
the `locations` fields on this form are a placeholder for that until it
exists.

`chemistFormSchema.ts` now documents this split explicitly with comments
(`// --- API: ... ---` vs `// --- UI only: ... ---` blocks) and exports:
- `chemistFormSchema` / `ChemistFormValues` / `chemistFormDefaults` — as
  before, covering the full field set (API + UI-only).
- `ChemistApiPayload` — the exact subset of fields
  `POST /partners/create` / `PUT /partners/:id` accept.
- `toChemistApiPayload(values)` — strips `locations` and `notes` (and adds
  `type: 'CHEMIST'`) before a request is sent. `ChemistFormPage.tsx` calls
  this right before `createChemist`/`updateChemist`.

Validation added beyond the original draft: GST number is validated as a
15-character alphanumeric string (`^[0-9A-Z]{15}$`), matching the format of
the confirmed real GST value (`27ABCDE1234F1Z5`).

## 4. `chemistApi.ts` — endpoints to add

Keep the existing `mapPartnerChemist` mapper and mock/real pattern. Add:

```ts
// getChemistDetail already implemented — see chemistApi.ts.
// Points at GET /partners/:id, transformResponse unwraps { success, data }
// through the same mapPartnerChemist() used by the list endpoint.

// createChemist / updateChemist already implemented — see chemistApi.ts.
// createChemist: POST /partners/create, body = toChemistApiPayload(values)
//   (strips locations/notes, adds type: 'CHEMIST').
// updateChemist: PUT /partners/:id, same payload shape, keyed by { id, payload }.
// Both invalidate the Chemists list/detail/KPI cache tags on success.

deleteChemist: builder.mutation<void, string>({
  query: (id) => ({
    tag: 'Chemists',
    url: `/partners/${id}`,
    method: 'DELETE',
    mockResolver: () => Promise.resolve(),
  }),
  invalidatesTags: [{ type: 'Chemists', id: 'LIST' }],
}),

// activateChemist / deactivateChemist already implemented — see chemistApi.ts.
// PATCH /partners/:id/activate and /partners/:id/deactivate, no body,
// invalidating the Chemists list/detail/KPI cache tags on success.

uploadChemistGeotag: builder.mutation<void, { partnerId: string; latitude: number; longitude: number; accuracy?: number; image: File }>({
  query: ({ partnerId, ...body }) => {
    const formData = new FormData()
    formData.append('latitude', String(body.latitude))
    formData.append('longitude', String(body.longitude))
    if (body.accuracy != null) formData.append('accuracy', String(body.accuracy))
    formData.append('image', body.image)
    return {
      tag: 'Chemists',
      url: `/partners/${partnerId}/geotag`,
      method: 'POST',
      data: formData,
      mockResolver: () => Promise.resolve(),
    }
  },
  invalidatesTags: (_r, _e, { partnerId }) => [{ type: 'Chemists', id: partnerId }],
}),
```

Check `mockOrRealBaseQuery` / `apiClient` — confirm axios is configured to
NOT force `Content-Type: application/json` globally, or the geotag
multipart request will get mis-encoded. If it does, the base query may need
a way to pass through a raw `FormData` body without JSON headers.

## 5. Server-side pagination/search/sort — `CommonTable` + `getChemists`

This is the biggest structural gap. Today:
- `chemistApi.ts` `transformResponse` throws away `totalItems`/`totalPages`
  and returns only `Chemist[]`.
- `CommonTable.tsx` does its own client-side `search` filter, `sort`, and
  `.slice()` for paging — fine for mock data, wrong once the server is
  already filtering/paging by `page`/`limit`/`search`/`sortOrder` params.

Two endpoints are already sending page/limit/search to the server
(`ChemistListPage.tsx` passes `page: 1, limit: 10` statically — page never
actually changes when the user pages).

Target approach — introduce server-driven mode to `CommonTable` without
breaking its other (still-mock) consumers:

1. `chemistApi.ts`: change `getChemists` to return the full envelope, not
   just `Chemist[]`:
   ```ts
   getChemists: builder.query<
     { items: Chemist[]; totalItems: number; totalPages: number; currentPage: number; pageSize: number },
     ChemistQueryParams | void
   >({
     ...
     transformResponse: (response: PartnerListApiResponse) => ({
       items: response.data.items.map(mapPartnerChemist),
       totalItems: response.data.totalItems,
       totalPages: response.data.totalPages,
       currentPage: response.data.currentPage,
       pageSize: response.data.pageSize,
     }),
     ...
   })
   ```
2. `useChemists.ts`: accept/track `page`, `limit`, forward them into
   `useGetChemistsQuery`, and return `totalItems` alongside `chemists`.
3. `ChemistListPage.tsx`: lift `page`/`rowsPerPage` into local state (they
   currently live inside `CommonTable`), pass them into `useChemists`, and
   pass `page`/`rowsPerPage`/`totalItems`/`onPageChange`/
   `onRowsPerPageChange` down into `CommonTable` instead of feeding it the
   full unpaginated array.
4. `CommonTable.tsx`: add optional server-mode props, e.g.:
   ```ts
   serverPagination?: {
     page: number
     rowsPerPage: number
     totalRows: number
     onPageChange: (page: number) => void
     onRowsPerPageChange: (rowsPerPage: number) => void
   }
   ```
   When `serverPagination` is passed: skip the internal `filteredRows` /
   `sortedRows` / `pagedRows` slicing for search+paging (rows are already
   the correct page from the server), and wire `TablePagination`'s
   `count`/`page`/`rowsPerPage` to the passed-in values instead of local
   state. Sort: either (a) disable client `sortBy` when server mode is on
   and pass `sortBy`/`sortOrder` through to `useChemists` params (already
   accepted by `chemistApi.ts` as `sortBy`/`sortOrder`), forwarding an
   `onSortChange` callback the same way as pagination, or (b) if full
   server-side sort-per-column isn't ready on backend, leave client sort
   only within the current page (acceptable interim, but document it as a
   known limitation — sorting won't reorder across pages until server sort
   is wired for every sortable column).
   Debounce the `search` input before it's sent to `useChemists` (300ms) so
   each keystroke doesn't fire a new request — reuse whatever debounce
   utility already exists in the repo (check `src/hooks/` and
   `src/utils/`), or add one.
5. Other `CommonTable` consumers (Dealers, Approval Requests, etc.) keep
   working unchanged since `serverPagination` is optional — don't touch
   them in this pass.

## 6. Row actions — `ChemistListPage.tsx`

Activate/Deactivate are **implemented** — wired to `useActivateChemistMutation`
/ `useDeactivateChemistMutation` with `hidden` toggling based on
`row.status`, and a toast on success/failure. Still open:

```ts
{
  label: 'Delete Chemist',
  onClick: (row) => setDeleteTarget(row), // open a confirm dialog, don't delete on click
  danger: true,
},
```
Delete must go through a confirmation dialog (destructive, irreversible) —
check if the repo already has a reusable confirm-dialog component (grep for
`ConfirmDialog` / `AlertDialog` under `src/components/common/`) before
building a new one.

## 7. Details page — `ChemistDetailsPage.tsx` / `useChemistDetail.ts`

`useChemistDetail.ts` should call `useGetChemistDetailQuery(chemistId)`
against the now-real endpoint (§4). Check whether `PartnerDetailsFieldsCard`,
`PartnerStatisticsCards`, `LocationCard`, etc. expect fields the real
`Chemist` mapper doesn't currently populate (e.g. `totalScans`,
`totalRedemptions`, `PointsHistory`, `interestedProducts`, `documents` are
all hardcoded to empty/0 in `mapPartnerChemist` today — confirm with
backend whether these come from other endpoints, e.g. wallet/scan-history
APIs already integrated elsewhere in the app, like
`useUserRedemptions` already used on this page for redemption history).

## 8. Geotag capture UI

New requirement not yet represented anywhere in the UI. Needs:
- An "Add/Update Geotag" action (likely on `ChemistDetailsPage.tsx`'s
  `LocationCard`, or as a row action) that opens a form/dialog capturing
  latitude, longitude (from browser geolocation or manual entry), optional
  accuracy, and an image file input, then calls
  `uploadChemistGeotag` (§4).

**Map picker for lat/long on the create/edit form** — separate from the
above, `ChemistFormPage.tsx`'s "Geo-tagging & Scanning Range" card has an
"Open in Maps" button that is still a no-op. The intended behavior is an
embedded Google Maps dialog: click a point on the map, it fills the
`locations[i].latitude`/`longitude` fields. **Blocked**: no Google Maps
JavaScript API key is configured anywhere in the project (checked `.env`,
`.env.example`, `package.json` — none found, no Maps SDK installed either).
Needs a billing-enabled Google Cloud project with the Maps JavaScript API
enabled; the key would go in `VITE_GOOGLE_MAPS_API_KEY` once provided.

## 9. Suggested implementation order

1. `chemistFormSchema.ts` — replace with real-API shape (§3). **Done** —
   kept all pre-existing UI-only fields alongside the new API fields.
2. `chemistApi.ts` — add detail/create/update/activate/deactivate endpoints;
   change `getChemists` to return the full envelope (§4, §5.1). **Done**
   except `deleteChemist` and `uploadChemistGeotag`, and the `getChemists`
   envelope change (§5) — still pending.
3. `useChemists.ts` / `useChemistDetail.ts` — thread through pagination
   state and the new envelope shape. **Pending** (§5).
4. `CommonTable.tsx` — add optional `serverPagination` prop (§5.4), keep
   backward compatible. **Pending**.
5. `ChemistListPage.tsx` — lift page/limit state, wire search debounce, wire
   real row actions incl. delete-confirm dialog (§6). Activate/deactivate
   row actions **done**; pagination lift and delete-confirm still pending.
6. `ChemistFormPage.tsx` — rebuild fields to match §3, add region/MR inputs
   and State/District/City dropdowns, wire `createChemist`/`updateChemist`
   mutations on submit, handle loading/error state and API validation
   errors surfaced from `getApiErrorMessage`. **Done** — Region and Assigned
   MR are both real dropdowns (`GET /regions`, `GET /medical-representatives`
   via `getMedicalRepOptions`); City/District/State are cascading
   Autocomplete dropdowns backed by `src/constants/indiaLocations.ts`;
   Territory removed entirely (§2).
7. `ChemistDetailsPage.tsx` / `useChemistDetail.ts` — point at real detail
   endpoint, reconcile field gaps (§7). **Done** — also wired
   activate/deactivate here.
8. Geotag capture UI (§8). **Pending**.
9. Delete action + confirm dialog. **Pending**.

## 10. Things to confirm with backend before/while implementing

- ~~Real "activate" endpoint~~ — confirmed: `PATCH /partners/:id/activate`,
  implemented.
- MR name resolution for `assignedMedicalRepresentativeId` — **done**.
  `GET /medical-representatives/:id` confirmed and wired into
  `medicalRepsApi.ts`'s `getMedicalRepDetail` (real endpoint, mapped onto
  the existing `MedicalRepresentative` type), reused from
  `PartnerSummaryHeader.tsx` to resolve the UUID into a display name. Note:
  only this one query was flipped to real (via a new `MedicalRepDetail` mode
  tag in `baseApi.ts`) — the MR list, KPIs, replacement-options, and
  create/update/delete mutations in that feature are still mock pending
  their own real-endpoint confirmation.
- MR option list for dropdowns — **done**. `getMedicalRepOptions` in
  `medicalRepsApi.ts` calls the confirmed real
  `GET /medical-representatives?page=1&limit=50&status=ACTIVE&sortBy=createdAt&sortOrder=desc`
  and is used by both the create/edit form and the list page's filter
  drawer (via MUI `Autocomplete`, searchable by typing — client-side filter
  over the fetched 50; if the real MR count grows past that, this should
  switch to server-side `search` param filtering, which the endpoint
  already accepts).
- Territory — **resolved by instruction**: removed from UI entirely, not
  sent on create/update (§2). If backend requires it, this will need
  revisiting once a real territory listing endpoint exists.
- Whether scan history / points history / redemption history / interested
  products / documents (currently hardcoded empty in `mapPartnerChemist`)
  have dedicated endpoints, or are out of scope for this pass.
- Exact validation error response shape from `POST /partners/create` /
  `PUT /partners/:id`, so form-level field errors (e.g. duplicate GST/PAN)
  can be mapped back onto the correct react-hook-form field instead of a
  generic toast (currently shown via `getApiErrorMessage` + a single toast).
- Confirm `PUT /partners/:id`'s real request/response shape independently —
  it's implemented per the original swagger list but, unlike create, hasn't
  been checked against an actual curl/response.
