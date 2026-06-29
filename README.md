# جستجوی اشعار فارسی

اپلیکیشن React برای جستجوی سریع و زیبای کلمات در اشعار فارسی، با استفاده از API عمومی [گنجور](https://ganjoor.net).

## ویژگی‌ها

- جستجوی کلمه در اشعار با فیلتر شاعر و قالب
- دو حالت نمایش: بیت matching / غزل کامل
- کش هوشمند با TanStack Query
- fetch موازی برای سرعت بیشتر
- لیست مجازی برای scroll روان
- خروجی CSV
- کپی متن و لینک به گنجور
- RTL و UI فارسی

## نصب و اجرا

```bash
npm install
npm run dev
```

اپ در `http://localhost:5173` اجرا می‌شود. در محیط توسعه، درخواست‌های API از طریق Vite proxy به `api.ganjoor.net` هدایت می‌شوند.

## Build

```bash
npm run build
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

در production، درخواست‌ها مستقیماً به API گنجور ارسال می‌شوند. در صورت مشکل CORS، از proxy در `vite.config.ts` (dev) یا یک Cloudflare Worker (production) استفاده کنید.

## لایسنس

داده‌های اشعار متعلق به پروژه گنجور است. کد این پروژه متن‌باز است.
