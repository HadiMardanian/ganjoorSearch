# Multi-poet / multi-category search — API research

## Ganjoor search endpoint

`GET /api/ganjoor/poems/search?term=...&poetId=...&catId=...&PageNumber=...&PageSize=...`

## Findings (2026-06-29)

| Approach | Result |
|----------|--------|
| `poetId=2,3` (comma-separated) | Returns empty `[]` — **not supported** |
| Single `poetId=2` | Works |
| Single `catId=24` | Works |

## Implementation strategy (GanjoorSearch)

1. **URL state:** `poet=1,2,3` and `cat=24,25` (comma-separated IDs)
2. **Search:** parallel requests per `(poetId, catId)` combination, merge results, dedupe by `fullUrl`
3. **Pagination:** each combo uses the same `PageNumber`; merged page capped at `pageSize` (approximate totals)
4. **Categories UI:** multi-select enabled only when exactly **one** poet is selected (categories are per-poet)
5. **Export:** same merge logic via `searchPoemsMerged`

## Limits

- Max 5 poets and 5 categories per search (client-side guard) to avoid API storms
