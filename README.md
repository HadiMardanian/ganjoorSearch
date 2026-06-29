# جستجوی اشعار فارسی

اپلیکیشن React برای جستجوی سریع و زیبای کلمات در اشعار فارسی، با استفاده از API عمومی [گنجور](https://ganjoor.net).

## ویژگی‌ها

- جستجوی کلمه در اشعار با فیلتر شاعر و قالب
- دو حالت نمایش: بیت matching / غزل کامل
- کش هوشمند با TanStack Query
- fetch موازی برای سرعت بیشتر
- لیست مجازی برای scroll روان
- خروجی CSV و Excel (همه صفحات نتایج)
- کپی متن و لینک به گنجور
- RTL و UI فارسی

## نصب و اجرا

```bash
git checkout main
git pull
npm install
npm run dev
```

اپ در `http://localhost:5173/ganjoorSearch/` اجرا می‌شود.

## Build

```bash
npm run build
npm run verify
npm run preview
```

خروجی در پوشه `dist/` قرار می‌گیرد. base path برای GitHub Pages: `/ganjoorSearch/`

## استک فنی

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- TanStack Query + React Virtual
- API: `https://api.ganjoor.net`

## CORS

در development از proxy داخلی Vite استفاده می‌شود. در production می‌توانید:

- مستقیم به `https://api.ganjoor.net` (پیش‌فرض)
- یا Worker پروکسی در [`workers/api-proxy.js`](workers/api-proxy.js) با متغیر build:

```bash
VITE_API_BASE=https://your-worker.example.com npm run build
```

## لایسنس

داده‌های اشعار متعلق به پروژه گنجور است. کد این پروژه متن‌باز است.
