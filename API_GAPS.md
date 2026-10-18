# API_GAPS — QR menyu (milliygo-qr-menu)

Bu ro'yxatda backend (`https://mytizim.uz`) **bermaydigan**, lekin QR menyu uchun kerak bo'lgan narsalar bor.
UI'da har biri `<ApiGap>` bilan belgilangan: sariq, punktir chegarali "API" pill, `title` tooltip'ida izoh bor.
Belgilarni yashirish: `NEXT_PUBLIC_SHOW_API_GAPS=false` (standart qiymat `true`, ishga tushirishdan oldin o'chiring).

Hech qanday ma'lumot to'qib chiqarilmagan: maydon kelmasa UI o'sha joyni yashiradi yoki ApiGap qo'yadi.

Setlar va 1+1 / 2+1 aksiyalar uchun **umumiy kontrakt**: [`D:\Milliy\API_CONTRACT_SETS_PROMOS.md`](../API_CONTRACT_SETS_PROMOS.md).
Bu loyiha o'sha kontraktga tayanadi, uni qayta belgilamaydi (§3, #4 ga qarang).

---

## Hozirgi endpointlar (2026-10-19 da tekshirildi)

| Endpoint | Javob shakli | Izoh |
|---|---|---|
| `GET /partner/<uuid>/` | **o'ralmagan** obyekt (`{uuid, name, logo, banner, rating:"4.20", is_open, opening_hours:{mon..sun, from_hour, to_hour}, …, delivery_zones:[…]}`); 404 → `{"detail":"Restoran topilmadi."}` | Ro'yxat endpointi `{success, data}` bilan o'raydi, bu esa o'ramaydi — nomuvofiq. `delivery_zones` poligonlari ~10 KB keraksiz yuk. |
| `GET /partner/category/?partner=<uuid>` | `{success, data:{partner_name, opening_hours, categories:[{id, category_details:{name, logo, category_type}, products:[…], is_active}]}}`; 404 → `{"success":false,"message":"Hamkor topilmadi"}` | Mahsulot: `price:"25000.00"` (satr), `sale_price` (satr\|null), `discount` (foiz, son), `images[{image,is_main,is_active}]`, `stock_status`. |
| `GET /promotions/promos/` | `{success, data:[{id, title, image, is_active, start_date:"dd-MM-yyyy", end_date, partner_details:{uuid,…}}]}` | Hamkor bo'yicha filtr yo'q — barcha bannerlar yuklanib, klient (server komponent) filtrlaydi. |

---

## 1. Stoldan buyurtma va "Ofitsiantni chaqirish" — **yo'q** (ishga tushirishga to'sqinlik qilmaydi; menyu faqat ko'rish uchun)

UI: pastki panel "Faqat ko'rish uchun", ichida o'chirilgan (disabled) "Ofitsiantni chaqirish" tugmasi va ApiGap; mahsulot oynasida (bottom sheet) "Buyurtma berish uchun ofitsiantga ayting" yozuvi va ApiGap.

Taklif:
```
POST /tables/<table_uuid>/call-waiter/          # tizimga kirmagan mijoz, rate-limit: stol bo'yicha 1/30s
  body: { "reason": "call" | "bill" }           → 201 { "uuid", "status": "pending", "created_at" }
  (Ofitsiant ilovasiga WS orqali push: wss://mytizim.uz/ws/partner/<partner_uuid>/waiter/)

POST /tables/<table_uuid>/orders/               # dine-in buyurtma, to'lov stolda
  body: { "items": [ { "product": "<uuid>", "quantity": 2 }, { "set": "<set uuid>", "quantity": 1 } ],
          "comment": "piyozsiz" }
  → 201 { "uuid", "status": "new", "items": [..., "free_quantity"], "total", "discount_amount" }
GET  /tables/<table_uuid>/orders/<uuid>/         # holat: new → accepted → cooking → served
```
Firibgarlikdan himoya: stol QR'ida imzolangan token (`?t=<hmac>`), buyurtmani ofitsiant tasdiqlaydi.

## 2. QR'da stol identifikatori — **yo'q**

Hozir QR = `https://<site>/<partner_uuid>` (restoran darajasida). `/<uuid>/qr` poster sahifasida ApiGap bor.
Taklif: `Table { uuid, partner, number, name, is_active }` modeli + `GET /partner/my/tables/` (hamkor uchun),
QR URL `/<partner_uuid>?table=<table_uuid>&t=<token>`. Frontend `table` parametrini o'qishga tayyor qilinadi.

## 3. Setlar (kombo) — **yo'q** → umumiy kontrakt §1

UI: menyu tepasida ApiGap "Setlar". Backend javob bera boshlashi bilan avtomatik "Setlar" bo'limi (birinchi chip) chiqadi.
Frontend o'qiydi (ikkalasi ham ixtiyoriy):
- `GET /partner/sets/?partner=<uuid>` — massiv, yoki `{data:[…]}` / `{data:{sets|results:[…]}}`;
- yoki `GET /partner/category/` javobidagi `data.sets`.
Maydonlar: `uuid, name, description, image, price, old_price, items[{product, name, image, quantity}], is_active, start_date, end_date`.
Faqat `is_active !== false` va sana oralig'idagi (Asia/Tashkent, `dd-MM-yyyy`) setlar ko'rsatiladi.
> Hozir `GET /partner/sets/?partner=…` `{"detail":"Restoran topilmadi."}` (404) qaytaradi — `/partner/<uuid>/` marshruti bilan to'qnashmoqda shekilli. Backendda `sets/` marshrutini `<uuid>/` dan **oldin** e'lon qiling.

## 4. 1+1 / 2+1 aksiyalar (BUY_X_GET_Y) — **yo'q** → umumiy kontrakt §2–§3

UI: ApiGap "1+1 / 2+1". Ma'lumot kelganda kartada oltin badge (`label` yoki `${buy}+${get}`), mahsulot oynasida
"3 ta olsangiz — 1 tasi bepul (2 tasi uchun to'laysiz: …)" izohi chiqadi.
Frontend o'qiydi: `product.promotion {type, buy_quantity, get_quantity, label}` yoki `GET /partner/promotions/?partner=<uuid>`
(`products: [uuid]` orqali biriktiriladi). Hisob `lib/promos.ts → promoSplit()` — kontrakt §3 formulasi
(`free = floor(qty / (buy+get)) * get`), faqat ko'rsatish uchun.
> `/partner/promotions/?partner=…` ham hozir 404 ("Restoran topilmadi") — xuddi #3 dagi marshrut tartibi masalasi.

## 5. Kategoriya tartibi — `order` maydoni yo'q (UI belgisi yo'q, faqat shu yerda)

Kategoriyalar backend qaytargan tartibda (hozir id kamayish tartibida: "Burgerlar", "Pitsa", …). Taklif: `category.order:int` (yoki `position`), mahsulotlarda ham `order`.

## 6. Mahsulot tafsilotlari — tarkib, og'irlik, allergenlar yo'q

UI: mahsulot oynasida "Tarkib, gramm, kaloriya" + ApiGap. Taklif (mahsulot obyektiga, hammasi ixtiyoriy):
`weight_grams:int`, `volume_ml:int`, `ingredients:string`, `allergens:string[]`, `calories:int`, `is_spicy:bool`, `is_vegetarian:bool`.

## 7. Javob shakli va hajmi (UI belgisi yo'q)

- `/partner/<uuid>/` ni ro'yxat endpointi kabi `{success, data}` ga o'rash (yoki aksincha) — frontend ikkalasini ham qabul qiladi (`unwrap`).
- QR menyu uchun yengil `GET /partner/<uuid>/?fields=uuid,name,logo,banner,rating,is_open,opening_hours,address,description` yoki `delivery_zones`siz alohida serializer.
- `/promotions/promos/?partner=<uuid>` filtri (hozir barcha bannerlar yuklanadi).
- Ko'p hamkorlarda `title`/`description` "." yoki "," bilan to'ldirilgan — frontend ularni bo'sh deb qabul qiladi; admin panelda majburiy maydonlarni bo'sh qoldirishga ruxsat bering.
- `rating` satr (`"4.20"`), sharhlar soni (`review_count`) yo'q — UI faqat reytingni ko'rsatadi.
- Ish vaqti uchun vaqt zonasi ko'rsatilmagan; frontend `Asia/Tashkent` deb hisoblaydi. Tanaffus, kun bo'yicha turli soatlar ham yo'q.
