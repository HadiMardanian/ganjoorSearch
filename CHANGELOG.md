# Changelog

All notable changes to GanjoorSearch are documented here.

## [2.7.4] - 2026-06-29

### Fixed
- Poetry verses are center-aligned (not forced to the RTL margin edge)
- Latin/technical UI strings (CSV, Excel, iOS install labels, page number input) render LTR
- Replaced physical `text-right` with logical `text-start` on Persian list items

## [2.7.3] - 2026-06-29

### Added
- Browse session persistence in poet PWA: category path, poem list page, open poem, and tab are restored after closing and reopening the app

## [2.7.2] - 2026-06-29

### Fixed
- Poet install no longer installs the wrong poet (e.g. حافظ → فردوسی): manifest race between install modal and active poet app resolved
- Install modal no longer resets gallery selection when poet list refetches (`initialPoetId` vs user pick)
- Install prompt runs before modal close so manifest is not restored to default mid-install
- Per-poet static manifest files (`manifests/poet-{id}.webmanifest`) for reliable Chrome PWA install

## [2.7.1] - 2026-06-29

### Fixed
- Poet install: button no longer stuck on «در حال نصب» (prompt timeout, manifest icons without blob URLs)
- Poet app mode activates immediately after selecting a poet (URL state sync with `usePoetApp`)
- Standalone PWA launch redirects to poet browse when a stored poet exists
- «شروع مرور آثار» button to use poet app without waiting for install prompt
- Search state cleared when entering poet app mode

## [2.7.0] - 2026-06-29

### Added
- Premium poet app shell: compact sticky header, fixed bottom navigation, safe-area support
- Category path navigation (`bpath`) with breadcrumbs and correct back stack (`pushState`)
- Immersive poem reader: couplet layout, font size controls, share sheet, swipe prev/next
- Continue reading card on poet home from last-read position
- Search results in poet app open the same in-app reader
- iOS install guide: separate «added to home» vs «dismiss» actions

### Changed
- Poet PWA hides site footer; attribution moved to header menu
- `theme-color` meta syncs with light/dark theme
- Manifest `start_url` includes `tab=browse` explicitly
- Category and poem lists: icons, fade-in animations, larger touch targets

## [2.6.0] - 2026-06-29

### Added
- Poet app browse mode: category tree, poem lists, and in-app poem reader
- Tabs «مرور آثار» and «جستجو» in installed poet PWA
- API: `fetchPoetDetail`, `fetchCategoryDetail` for Ganjoor catalog navigation
- Prev/next poem navigation within a category list
- URL params: `tab`, `bcat`, `poem`, `plist` for browse state

### Changed
- Installed poet app opens on browse home (not empty search) after install
- Poet app header subtitle reflects browse/read experience

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
