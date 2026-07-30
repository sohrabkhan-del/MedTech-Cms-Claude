# Module CRUD Implementation — Prompt Template

Fill in the bracketed placeholders and paste the whole thing to Claude. Only
two things are truly required: the **module name** and the **API details**
(paste raw curl commands / swagger paths / example JSON, however you have
them — don't reshape them first).

---

## PROMPT (copy from here down)

Implement full CRUD for the **[MODULE NAME]** module in this CMS
(`src/features/[FEATURE_FOLDER]/`), following the same pattern already used
for the Chemist module in this repo (`src/features/userManagement/` —
`chemistApi.ts`, `chemistFormSchema.ts`, `ChemistListPage.tsx`,
`ChemistFormPage.tsx`, `ChemistDetailsPage.tsx`, `useChemistDetail.ts`,
`useChemists.ts`). Match its conventions: RTK Query via
`baseApi.injectEndpoints`, the mock/real switch in
`src/store/api/baseApi.ts`'s `featureModeOverrides`, Zod + react-hook-form
for forms, `CommonTable` for the list page.

Here is every API endpoint for this module — use these exactly as given,
don't guess or reshape the paths:

```
[PASTE: list endpoint — full URL with query params, e.g.
GET https://.../partners?page=1&limit=10&type=CHEMIST&sortOrder=desc]

[PASTE: full example JSON response for the list endpoint]

[PASTE: detail endpoint — e.g. GET /partners/:id]

[PASTE: create endpoint + example curl/body — e.g. POST /partners/create]

[PASTE: update endpoint + body — e.g. PUT /partners/:id]

[PASTE: delete endpoint — e.g. DELETE /partners/:id]

[PASTE: activate endpoint — e.g. PATCH /partners/:id/activate]

[PASTE: deactivate endpoint — e.g. PATCH /partners/:id/deactivate]

[PASTE: any other module-specific endpoints — file upload, status change, etc.]
```

Requirements:

1. **Listing page**: search, filters, and column sort must all hit the API
   server-side (not client-side on an already-fetched page) — pass
   `page`/`limit`/`search`/`sortBy`/`sortOrder`/filter params straight
   through to the list endpoint. Debounce the search input (~300ms) before
   it triggers a request. Do not put the raw search string directly into
   any component `key` prop — that forces a remount on every keystroke and
   breaks the input (losing focus, resetting local state). If sorting a
   column, first confirm the backend's actual `sortBy` field names (they
   are often NOT the same as the frontend's display field names — e.g. a
   UI column called "Shop Name" may map to a backend field called
   `businessName`); do not guess these silently, list out the mapping and
   flag any column you're unsure about instead of assuming.
2. **Columns**: show only the necessary columns by default (ask me which,
   don't guess) — every field can still be viewed on the details page.
3. **Create/Edit form**: build with Zod validation. If some fields already
   exist in a current mock/placeholder form but the real API's
   create/update body doesn't have a matching field, KEEP those fields in
   the UI (don't delete UI just because the field isn't in the payload) —
   just don't send them to the API. Tell me explicitly which fields fall
   into that bucket.
4. Any field that's a foreign-key-style ID (region, territory, assigned
   user, category, etc.) needs a real searchable dropdown backed by that
   entity's real list endpoint — not a raw UUID text input — UNLESS no
   such listing endpoint exists yet, in which case: tell me before building
   a plain text input as a fallback, don't silently ship a raw-UUID field.
5. **Activate/Deactivate/Delete** row actions and detail-page buttons must
   call the real endpoints, with success/error toasts, and update the
   correct row's/table's cache afterward (RTK `invalidatesTags`). Delete
   must go through a confirmation dialog — check if a reusable one already
   exists in `src/components/common/` before building a new one.
6. If any field the app currently derives/infers client-side (e.g. a
   "region/zone" computed from a state name) has no real backend equivalent,
   don't force it into a real filter/sort param — tell me it's client-only
   and leave it that way unless I say otherwise.
7. Before changing any shared type used by other features (e.g. a status
   enum reused by multiple modules), grep every consumer first and tell me
   what else it will touch — don't extend a shared type silently as a side
   effect of one module's work.
8. Run the project's real typecheck (`npx tsc -b tsconfig.app.json --noEmit
   --force` — plain `tsc --noEmit` on this repo's project-references setup
   silently reports nothing useful) and lint after every meaningful change,
   not just at the end.
9. If any endpoint's exact response shape is unconfirmed (you don't have a
   real, logged-in example response — only a guess based on similar
   endpoints), say so explicitly in your summary rather than presenting the
   mapper as verified.

Ask me before:
- Guessing a fallback value for any required field that has no UI input yet.
- Deciding what to do when the API accepts a field the UI intentionally
  doesn't expose (send nothing? send a hardcoded default? ask backend?).
- Adding any new third-party dependency (maps SDK, date picker, etc.) —
  check if a required API key/config already exists first; if not, ask
  before building UI around it.

---

## Notes on filling this in (delete before sending, or keep for your own reference)

- You genuinely only need to swap **module name** + **paste the API
  details** — everything else in the requirements list is copy-paste
  reusable across modules, since it encodes lessons already learned
  building the Chemist module (wrong endpoint paths guessed from swagger
  naming conventions turning out to be wrong — e.g. `/partners` vs
  `/partners/create` — country-code phone prefixes leaking into list
  views, territoryId being silently required-but-removable, sort keys not
  matching backend field names, search-in-`key` causing remounts, and a
  shared `PartnerStatus` type rippling into an unrelated feature when
  extended).
- The more literally you paste raw curl commands / actual JSON responses
  (rather than summarizing them in your own words), the fewer wrong
  assumptions get baked into the first draft.
