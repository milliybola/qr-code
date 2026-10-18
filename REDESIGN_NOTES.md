# REDESIGN_NOTES — QR menyu, superapp uslubida

Branch: `redesign/superapp-style`. Namuna: superapp `lib/features/food/restaurant_detail_page.dart`,
`widgets/restaurant/menu_item_tile.dart`, `widgets/product_bottom_sheet.dart`, `widgets/milliy_brand.dart`.

## Topilgan va tuzatilgan xatolar

| # | Xato | Tuzatish |
|---|---|---|
| 1 | `rating` backendda satr (`"4.80"`), kod `typeof === "number"` tekshirardi — reyting **hech qachon** ko'rinmasdi | `toNumber()` bilan o'qiladi |
| 2 | `sale_price` umuman hisobga olinmasdi; narxlar satr bo'lsa-da `number` deb tiplangan (`"25000.00" - …` tasodifan ishlardi) | superapp `MenuItem.finalPrice` qoidasi: `sale_price` (agar `< price`) ustun, keyin `discount` %. `sale_price == price` chegirma emas |
| 3 | Tarmoq/5xx xatosi ham "Bu restoran topilmadi" (404) ko'rinardi; menyu xatosi esa "menyu to'ldirilmoqda" deb yashirilardi | `ApiError` → `app/[uuid]/error.tsx` ("Qayta urinish" = `router.refresh()+reset()`); ISR regeneratsiyada xato bo'lsa eski sahifa qoladi. 404 → `notFound()` |
| 4 | `loading.tsx` tufayli mavjud bo'lmagan restoran/`favicon.ico` **HTTP 200** qaytarardi (soft-404) | Segment `loading.tsx` olib tashlandi; skelet faqat menyu qismi uchun `<Suspense>` ichida. Endi 404 to'g'ri. `app/icon.svg` qo'shildi |
| 5 | Sahifa har so'rovda dinamik (ƒ) render qilinardi | `generateStaticParams(){return []}` + `revalidate=60` → on-demand ISR (keshdan ~3 ms) |
| 6 | `logo` ishlatilmasdi; QR posterda yumaloq "logo" o'rnida muqova (banner) chiqardi | Hero va posterda `logo`, muqovada `banner` |
| 7 | Kategoriya chipini bosganda `scrollIntoView` (rail) parallel ketayotgan `window.scrollTo` smooth'ini Chrome'da to'xtatib qo'yardi; 700 ms qulf uzun sahifada yetmasdi | Rail `scrollLeft` orqali markazlashtiriladi; scroll-spy `scroll`+rAF (superapp `_onScroll` mantig'i), qulf `scrollend` yoki 1 s |
| 8 | Sticky chiplar `top-[52px]`, header esa ~58 px — chiplar header ostiga kirardi | Aniq o'lchamlar: panel 56 px, chiplar 52 px, `scroll` ofseti shulardan |
| 9 | `toLocaleString("uz-UZ")` Node/brauzer ICU'siga bog'liq | `formatSum()` — superapp bilan bir xil "30 000" (NBSP) |
| 10 | Nisbiy `/media/...` rasm manzillari qo'llab-quvvatlanmasdi; `<img>` optimallashtirilmagan, muqova lazy emas | `absUrl()`; `next/image` (`remotePatterns: mytizim.uz/media/**`, AVIF/WebP, `sizes`), birinchi 4 karta va muqova `priority`, qolgani lazy; boshqa host / `.ico` / `.svg` → `unoptimized`; xato bo'lsa placeholder |
| 11 | `is_open` faqat bayroq; `opening_hours` (obyekt) `string` deb tiplangan, umuman ishlatilmagan | `opening_hours` o'qiladi: "09:00–22:00", hafta kunlari; "hozir ochiq" = `is_open` && kun && soat (Asia/Tashkent, tungi smena, `23:59:59` = kun oxiri) |
| 12 | Footer'da "50+ restoran" — tasdiqlanmagan raqam (to'qilgan ma'lumot) | Olib tashlandi |
| 13 | Root `not-found` yo'q edi (inglizcha standart sahifa) | `app/not-found.tsx` (o'zbekcha) |
| 14 | `description` ko'pincha nom bilan bir xil, `title` "." — keraksiz takror | `clean()` — "."/"," bo'sh hisoblanadi, nom bilan bir xil tavsif yashiriladi |

## Yangi tuzilma

```
lib/api.ts        server: fetchPartner / fetchMenu / fetchSets / fetchPromotions / fetchPromoBanners, normallashtirish, ApiError
lib/promos.ts     umumiy kontrakt: normalizePromotion, promoSplit (§3), parseDmy, todayInTashkent
lib/format.ts     formatSum / formatPrice, SHOW_API_GAPS
components/
  RestaurantHero  (server) muqova + logo, nom 30px/900, Reyting | Ish vaqti, manzil, Ochiq/Yopiq kartasi, aksiya bannerlari
  MenuView        (client) sticky panel (scroll'da restoran nomi), sticky chiplar + scroll-spy, Setlar, kategoriyalar,
                  pastki "Faqat ko'rish uchun" panel, qidiruv oynasi
  ProductCard     kvadrat rasm r=22, −N% (qizil) va 1+1 (oltin) badge, narx 17/900 (chegirmada qizil + chizilgan eski narx)
  ProductSheet    bottom sheet: rasmlar, narx, tavsif, set tarkibi, 1+1 izohi, ESC/backdrop yopadi, body scroll lock
  SafeImage, ApiGap, Skeletons, AppFooter, StatusScreen, Wordmark, Icons
app/[uuid]/page.tsx   ISR; restoran → 404 tekshiruvi, menyu <Suspense> (hero darhol, menyu skeleti)
app/[uuid]/error.tsx  backend xatosi
app/[uuid]/qr         poster (NEXT_PUBLIC_SITE_URL bo'lsa shu domen QR'ga yoziladi)
```

Dizayn tokenlari (`tailwind.config.ts`): ink `#111111`, muted `#6B7280`, line `#EEF0F3`, chip `#F2F3F5`,
green `#15803D` / bright `#16A34A` / soft `#E8F7EE`, gold `#F5B400` / soft `#FFF4CC`, sale `#EF4444`;
radius 16/20/22/24; sarlavhalar 800–900, `-0.4px`. Shrift: Outfit (o'zgaruvchan, 900 gacha); Satisfy olib tashlandi.

## Holatlar
- **Yopiq**: qizil-och karta "Muassasa hozir yopiq · Ish vaqti: …" — menyu baribir ko'rinadi (QR menyu ko'rish uchun).
- **Bo'sh menyu**: "Hozircha menyu mavjud emas".
- **404** (noto'g'ri UUID / yo'q restoran): "Restoran topilmadi", HTTP 404, `noindex`.
- **Backend xatosi**: "Menyuni yuklab bo'lmadi" + "Qayta urinish".
- **Setlar / 1+1**: backend bermaguncha faqat ApiGap; bersa bo'lim va badge avtomatik chiqadi (`API_GAPS.md` #3–#4).
- **Buyurtma**: API yo'q → view-only; "Ofitsiantni chaqirish" disabled + ApiGap (`API_GAPS.md` #1–#2).

## Env
`.env.example`: `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SHOW_API_GAPS` (standart `true`).
`NEXT_PUBLIC_*` build vaqtida kiritiladi — o'zgartirgach qayta build kerak.

## Tekshirildi
- `npm run build` — o'tadi (`/[uuid]` ● ISR, First Load 115 kB).
- `next start` + jonli API: 3 ta haqiqiy restoran 200; yo'q UUID / `not-a-uuid` / `favicon.ico` → 404; qayta so'rov keshdan ~3 ms.
- Headless Chrome (375 px, CDP): gorizontal overflow yo'q; chip bosilganda bo'limga aylantiradi va faol chip yangilanadi;
  karta → bottom sheet, ESC yopadi, scroll lock tiklanadi; qidiruv "pits" → "Uchar pitsa"; konsolda xato yo'q.

## Ishga tushirishdan oldin (blockers)
1. Production'da `NEXT_PUBLIC_SHOW_API_GAPS=false` qo'yish (aks holda mijozlar "API" belgilarini ko'radi).
2. `NEXT_PUBLIC_SITE_URL` ni QR menyu domeniga sozlash (poster QR'i va canonical/OG uchun); chop etilgan QR'lar shu domenga bog'lanadi.
3. Hosting `next start` (Node) bo'lishi kerak — `next/image` optimizatori va ISR shunga tayanadi (static export emas).
4. Brauzerda qo'lda ko'rib chiqish (iOS Safari: sticky + bottom sheet + safe-area), chunki faqat headless Chrome'da tekshirildi.
