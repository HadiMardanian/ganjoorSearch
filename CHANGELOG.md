# Changelog

All notable changes to GanjoorSearch are documented here.

## [2.5.0] - 2026-06-29

### Added
- Poet-specific PWA install flow: gallery, preview, Android install button
- Dynamic per-poet manifest with custom name, start URL, and icons
- `usePwaInstall` hook for `beforeinstallprompt` and install detection
- `usePoetApp` locked poet mode when launched from installed PWA (`?poet=&source=pwa`)
- iOS three-step Add to Home Screen guide (`IosInstallGuide`)
- Poet avatar with letter fallback; `scripts/generate-poet-icons.mjs` for build-time PNG icons
- Service worker caches poet icons and manifest shell (v2)
- Header CTA: «نصب اپ شاعر دلخواه» when app is not installed

### Changed
- Header shows poet branding in locked poet app mode
- Poet picker hidden when poet is locked in installed PWA

## [2.4.1] - 2026-06-29

### Fixed
- Dark theme: unified CSS variables for surfaces, text, borders, and highlights
- Empty state, search guide, cards, and forms no longer show white boxes on dark background
- Improved contrast for muted text, buttons, toasts, and gradients in dark mode

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
