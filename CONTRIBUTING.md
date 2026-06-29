# Contributing to GanjoorSearch / مشارکت در گنجورسرچ

Thank you for helping improve GanjoorSearch! This guide is bilingual (English first, then Persian).

از اینکه در بهبود گنجورسرچ مشارکت می‌کنید سپاسگزاریم. این راهنما دو زبانه است (ابتدا English، سپس فارسی).

---

## English

### Ways to contribute

- **Bug reports** — describe steps, expected vs actual behavior, browser/OS
- **Feature ideas** — explain the user problem, not only the solution
- **Pull requests** — fixes, tests, docs, UX improvements
- **Translations & copy** — Persian UI text, README, this guide

### Before you start

1. Check [open issues](https://github.com/HadiMardanian/ganjoorSearch/issues) and existing PRs
2. For large changes, open an issue first to align on scope
3. Poetry data comes from Ganjoor — do not commit poem corpora into this repo

### Development setup

```bash
git clone https://github.com/HadiMardanian/ganjoorSearch.git
cd ganjoorSearch
npm install
npm run dev
```

### Quality checks

Run these before opening a PR:

```bash
npm run lint
npm run test:unit
npm run build
```

Optional (hits live Ganjoor API):

```bash
npm run verify:integration
```

### Pull request guidelines

1. **Branch** from `main` with a clear name, e.g. `fix/export-filename` or `feat/search-history`
2. **One concern per PR** when possible (easier review)
3. **Tests** — add/update Vitest tests for logic in `src/utils/`; manual QA notes for UI
4. **Persian UX** — keep labels natural; prefer «قطعه» for result counts, not a specific form like «غزل»
5. **No unrelated refactors** — keep diffs focused
6. **CHANGELOG** — add a short entry under `Unreleased` or the next version in [CHANGELOG.md](CHANGELOG.md)

### Code conventions

| Area | Convention |
|------|------------|
| Language | TypeScript, strict mode |
| UI | RTL-first; Persian copy in components |
| API | `src/api/ganjoor.ts` + TanStack Query hooks |
| Matching | `src/utils/matchCore.ts` — single source for search/highlight |
| Export | `src/utils/export.ts` — verse rows from `excerpt` |
| Styles | Tailwind 4 + `src/index.css` CSS variables |

### Project structure

```
src/
  api/          Ganjoor client + React Query hooks
  components/   UI, search form, results, export
  hooks/        URL state, theme, search history
  utils/        match, excerpt, export, paging
scripts/        verify.mjs (live API integration)
workers/        optional CORS proxy (Cloudflare)
```

### Commit messages

Use clear, complete sentences. Examples:

- `Fix category dropdown stale data after poet change`
- `Add export filename from search term`
- `docs: bilingual README and contribution guide`

### Questions?

Open a [GitHub issue](https://github.com/HadiMardanian/ganjoorSearch/issues) or comment on an existing discussion.

---

## فارسی

### روش‌های مشارکت

- **گزارش باگ** — مراحل بازتولید، رفتار مورد انتظار vs واقعی، مرورگر/سیستم‌عامل
- **پیشنهاد قابلیت** — مشکل کاربر را توضیح دهید، نه فقط راه‌حل فنی
- **Pull Request** — رفع باگ، تست، مستندات، بهبود UX
- **متن و ترجمه** — برچسب‌های فارسی UI، README، این راهنما

### قبل از شروع

1. [issueهای باز](https://github.com/HadiMardanian/ganjoorSearch/issues) و PRهای موجود را ببینید
2. برای تغییرات بزرگ، ابتدا issue باز کنید تا scope مشخص شود
3. دادهٔ اشعار از گنجور است — corpus اشعار را در repo commit نکنید

### راه‌اندازی محیط توسعه

```bash
git clone https://github.com/HadiMardanian/ganjoorSearch.git
cd ganjoorSearch
npm install
npm run dev
```

### بررسی کیفیت

قبل از PR این دستورات را اجرا کنید:

```bash
npm run lint
npm run test:unit
npm run build
```

اختیاری (به API زندهٔ گنجور وصل می‌شود):

```bash
npm run verify:integration
```

### راهنمای Pull Request

1. از `main` **branch** بسازید، مثلاً `fix/export-filename`
2. هر PR **یک موضوع** — review آسان‌تر
3. **تست** — برای منطق در `src/utils/` تست Vitest اضافه/به‌روز کنید؛ برای UI یادداشت QA دستی
4. **UX فارسی** — برچسب‌ها طبیعی باشند؛ برای شمارش نتایج «قطعه»، نه «غزل»
5. **بدون refactor اضافی** — diff متمرکز بماند
6. **CHANGELOG** — ورودی کوتاه در [CHANGELOG.md](CHANGELOG.md)

### قراردادهای کد

| بخش | قرارداد |
|-----|---------|
| زبان | TypeScript، حالت strict |
| UI | RTL-first؛ متن فارسی در کامپوننت‌ها |
| API | `src/api/ganjoor.ts` + hooks مربوط به TanStack Query |
| تطبیق | `src/utils/matchCore.ts` — منبع واحد جستجو/هایلایت |
| Export | `src/utils/export.ts` — ردیف بیت از `excerpt` |
| استایل | Tailwind 4 + متغیرهای CSS در `src/index.css` |

### ساختار پروژه

```
src/
  api/          کلاینت گنجور + React Query
  components/   UI، فرم جستجو، نتایج، export
  hooks/        state در URL، تم، تاریخچه جستجو
  utils/        match، excerpt، export، paging
scripts/        verify.mjs (تست integration با API زنده)
workers/        پروکسی اختیاری CORS (Cloudflare)
```

### پیام commit

جملات واضح و کامل. نمونه:

- `Fix category dropdown stale data after poet change`
- `Add export filename from search term`
- `docs: bilingual README and contribution guide`

### سوال دارید؟

[Issue در GitHub](https://github.com/HadiMardanian/ganjoorSearch/issues) باز کنید یا در بحث موجود نظر بدهید.
