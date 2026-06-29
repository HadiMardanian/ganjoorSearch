![GanjoorSearch — جستجوی هوشمند در گنجور](./docs/assets/banner.png)

# GanjoorSearch

**Live demo:** [hadimardanian.github.io/ganjoorSearch](https://hadimardanian.github.io/ganjoorSearch)

A fast, Persian-first web app for searching classical Persian poetry via the public [Ganjoor](https://ganjoor.net) API — plus installable **per-poet PWAs** for browse-and-read like native Ganjoor apps.

---

## English

### Search features

- Search words or short phrases across Ganjoor’s corpus
- Filter by **poet** and **poetic form** (قالب)
- Two view modes: matching **verses** (excerpt) or **full poem**
- Smart highlighting with Persian/Arabic normalization
- Export to **CSV** or **Excel** (current page or all results)
- Copy poem text, rich copy with Ganjoor link, copy search URL
- Search history, dark mode, RTL UI
- URL-synced state (`?q=&poet=&cat=&page=&mode=`)

### Poet app (PWA)

- Install a dedicated home-screen app per poet (custom icon and name)
- **Browse** category tree → poem lists → immersive reader
- **Search** within the same poet; results open in-app reader
- Continue reading, **favorites**, font size / line spacing in reader
- Browse session restored after closing the app (`bpath`, `plist`, open poem)
- Offline reading for recently opened poems (cached locally)
- Android hardware Back: in-app navigation stack before exit

Poet app URL params: `?poet=&source=pwa&tab=browse|search&bpath=&plist=&poem=`

### Quick start

```bash
git clone https://github.com/HadiMardanian/ganjoorSearch.git
cd ganjoorSearch
npm install
npm run dev
```

Open `http://localhost:5173/ganjoorSearch/`

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Generate poet assets + typecheck + production build |
| `npm run build:poet-assets` | Generate all poet icons and manifests (API) |
| `npm run preview` | Preview `dist/` |
| `npm run test:unit` | Vitest (no network) |
| `npm run verify` | Live API checks + unit tests |
| `npm run lint` | ESLint |
| `npm run generate:poet-icons` | Top poets PNG icons |
| `npm run generate:poet-manifests` | Top poets PWA manifests |

### Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · TanStack Query · Vitest

### CORS / production API

- **Development:** Vite proxy to `api.ganjoor.net`
- **Production (default):** direct browser calls to `https://api.ganjoor.net`
- **Optional:** deploy [`workers/api-proxy.js`](workers/api-proxy.js) and build with `VITE_API_BASE`

```bash
cd workers && npx wrangler deploy
VITE_API_BASE=https://your-worker.workers.dev npm run build
```

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) (Persian + English).

### License

Poetry data belongs to [Ganjoor](https://ganjoor.net). This project’s source code is open.

---

## فارسی

### جستجو

- جستجوی کلمه یا عبارت کوتاه در سراسر اشعار گنجور
- فیلتر بر اساس **شاعر** و **قالب** شعر
- دو حالت نمایش: **بیت**های matching یا **متن کامل** شعر
- هایلایت هوشمند با نرمال‌سازی حروف فارسی/عربی
- خروجی **CSV** و **Excel** (صفحهٔ فعلی یا همهٔ نتایج)
- کپی متن، کپی همراه لینک گنجور، کپی لینک جستجو
- تاریخچهٔ جستجو، حالت تاریک، رابط RTL
- همگام‌سازی با URL (`?q=&poet=&cat=&page=&mode=`)

### اپ شاعر (PWA)

- نصب اپ اختصاصی برای هر شاعر روی صفحهٔ اصلی (آیکون و نام شاعر)
- **مرور آثار:** دسته‌بندی → فهرست اشعار → reader تمام‌صفحه
- **جستجو** در همان شاعر؛ نتایج در reader داخلی باز می‌شوند
- ادامه مطالعه، **علاقه‌مندی‌ها**، تنظیم اندازه قلم و فاصله خطوط
- بازگردانی موقعیت مرور بعد از بستن اپ (`bpath`، `plist`، شعر باز)
- مطالعهٔ آفلاین اشعار اخیراً خوانده‌شده (ذخیره محلی)
- دکمه Back اندروید: اول داخل اپ برمی‌گردد، بعد خارج می‌شود

پارامترهای اپ شاعر: `?poet=&source=pwa&tab=browse|search&bpath=&plist=&poem=`

### نصب و اجرا

```bash
git clone https://github.com/HadiMardanian/ganjoorSearch.git
cd ganjoorSearch
npm install
npm run dev
```

آدرس محلی: `http://localhost:5173/ganjoorSearch/`

### دستورات

| دستور | توضیح |
|-------|--------|
| `npm run dev` | سرور توسعه |
| `npm run build` | ساخت آیکون/manifest شاعران + build تولید |
| `npm run build:poet-assets` | تولید آیکون و manifest همهٔ شاعران |
| `npm run preview` | پیش‌نمایش `dist/` |
| `npm run test:unit` | تست Vitest (بدون شبکه) |
| `npm run verify` | تست API زنده + unit |
| `npm run lint` | ESLint |

### استک فنی

React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · TanStack Query · Vitest

### CORS / API در production

- **توسعه:** پروکسی Vite به `api.ganjoor.net`
- **پیش‌فرض production:** فراخوانی مستقیم `https://api.ganjoor.net`
- **اختیاری:** deploy [`workers/api-proxy.js`](workers/api-proxy.js) و build با `VITE_API_BASE`

### مشارکت

راهنمای کامل در [CONTRIBUTING.md](CONTRIBUTING.md) (فارسی + English).

### لایسنس

داده‌های اشعار متعلق به [گنجور](https://ganjoor.net) است. کد این پروژه متن‌باز است.
