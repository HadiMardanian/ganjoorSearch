# Changelog

All notable changes to GanjoorSearch are documented here.

## [2.4.0] - 2026-06-29

### Added
- Export enriched full text via `fetchPoem` (parity with UI expand)
- Parallel page fetch for large exports (`p-limit`)
- Export scope: all results vs current page only
- Export filenames include search term
- Accessible confirm modal for large exports
- Copy search link button
- Rich copy (title + text + Ganjoor URL) per result
- Search history (localStorage, last 15 queries)
- Dark mode (light / dark / system)
- Light PWA: manifest + service worker shell cache
- Active filter badges above results
- Open Graph meta tags

### Fixed
- Category dropdown no longer shows stale categories after poet change
- Single page scroll layout (removed nested 70vh scroll)
- Toast errors use `role="alert"`
- Poets/categories load errors surfaced to user
- Scroll-to-top button stays visible when scrolled down

### Changed
- Export UI hidden until a search is performed
- CI deploy uses unit tests only; live API verify runs on schedule

## [2.1.0] - 2026-06-29

### Added
- Unified `matchCore` for search highlight and excerpt
- Export cancel, progress, and volume warning
- Excel SpreadsheetML export
- Verse export from excerpt (UI source of truth)

### Fixed
- Export button loading state per button only

### Changed
- Result counts use «قطعه» instead of «غزل»
- View mode label «متن کامل»
- Category filter restored after mistaken removal

## [2.0.0]

- Full React + Vite rewrite with TanStack Query
- Fast search with plainText results and lazy poem fetch
