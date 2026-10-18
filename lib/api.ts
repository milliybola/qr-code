/**
 * MilliyGo backend (mytizim.uz) bilan ishlash — faqat serverda chaqiriladi
 * (Server Components / ISR). Barcha javoblar "xom" (Raw*) turlarda o'qiladi va
 * UI uchun normallashtirilgan turlarga o'giriladi.
 *
 * Qoidalar:
 *  - Backend bermagan narsa to'qib chiqarilmaydi: maydon bo'lmasa — undefined.
 *  - 404 / noto'g'ri UUID → null (sahifa notFound()).
 *  - Tarmoq / 5xx xatosi → ApiError tashlanadi (error.tsx; ISR eski sahifani saqlaydi).
 *  - Ixtiyoriy kelajak endpointlari (setlar, 1+1 aksiyalar) xato bersa — jim [].
 */
import { parseDmy, todayInTashkent, type Promotion, normalizePromotion } from "./promos";

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "https://mytizim.uz").replace(/\/+$/, "");
const REVALIDATE = 60;
const TIMEOUT_MS = 8000;
const OPTIONAL_TIMEOUT_MS = 3500;

// ─── Xom (backend) turlari ──────────────────────────────────────────────
type Num = number | string | null | undefined;

interface RawImage {
  id?: number;
  image?: string | null;
  is_main?: boolean;
  is_active?: boolean;
}

interface RawProduct {
  id: number;
  uuid?: string;
  name?: string;
  description?: string | null;
  price?: Num;
  sale_price?: Num;
  discount?: Num;
  is_active?: boolean;
  is_available?: boolean;
  stock_status?: string | null;
  images?: RawImage[] | null;
  // Kelajak (API_CONTRACT_SETS_PROMOS.md): mahsulotdagi qisqa aksiya ko'rinishi
  promotion?: unknown;
}

interface RawCategory {
  id: number;
  uuid?: string;
  is_active?: boolean;
  category_details?: {
    uuid?: string;
    name?: string;
    description?: string | null;
    logo?: string | null;
    category_type?: string;
  } | null;
  name?: string;
  products?: RawProduct[] | null;
}

interface RawOpeningHours {
  mon?: boolean;
  tue?: boolean;
  wed?: boolean;
  thu?: boolean;
  fri?: boolean;
  sat?: boolean;
  sun?: boolean;
  from_hour?: string | null;
  to_hour?: string | null;
}

interface RawPartner {
  uuid?: string;
  id?: number;
  name?: string;
  description?: string | null;
  address?: string | null;
  logo?: string | null;
  banner?: string | null;
  phone?: string | null;
  rating?: Num;
  is_open?: boolean | null;
  partner_type?: string | null;
  opening_hours?: RawOpeningHours | string | null;
}

interface RawPromoBanner {
  id: number;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  partner_details?: { uuid?: string } | null;
}

interface RawSet {
  uuid?: string;
  name?: string;
  description?: string | null;
  image?: string | null;
  price?: Num;
  old_price?: Num;
  items?: { product?: string; name?: string; image?: string | null; quantity?: Num }[] | null;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

// ─── UI turlari ─────────────────────────────────────────────────────────
export interface MenuProduct {
  id: number;
  uuid?: string;
  name: string;
  description?: string;
  /** To'lanadigan narx (sale_price yoki discount qo'llangan) */
  price: number;
  /** Chizilgan eski narx — faqat haqiqiy chegirma bo'lsa */
  oldPrice?: number;
  /** Chegirma foizi — faqat > 0 bo'lsa */
  discountPercent?: number;
  image?: string;
  images: string[];
  stockStatus?: string;
  promotion?: Promotion;
}

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  type?: string;
  products: MenuProduct[];
}

export interface MenuSetItem {
  productUuid?: string;
  name: string;
  image?: string;
  quantity: number;
}

export interface MenuSet {
  uuid: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  oldPrice?: number;
  items: MenuSetItem[];
}

export interface PromoBanner {
  id: number;
  title?: string;
  image: string;
}

export interface OpeningHours {
  /** "09:00–22:00" */
  text?: string;
  /** Hafta kunlari (dushanba=0) — false bo'lsa dam olish kuni */
  days?: boolean[];
  from?: string;
  to?: string;
}

export interface Partner {
  uuid: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  logo?: string;
  cover?: string;
  rating?: number;
  /** Backenddagi is_open bayrog'i */
  isOpenFlag?: boolean;
  /** is_open + ish vaqti (Toshkent vaqti) bo'yicha hozir ochiqmi; noma'lum bo'lsa null */
  openNow: boolean | null;
  hours?: OpeningHours;
  partnerType?: string;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Yordamchilar ───────────────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(uuid: string): boolean {
  return UUID_RE.test(uuid);
}

export function toNumber(v: Num): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : undefined;
}

/** Nisbiy (/media/...) va http:// manzillarni to'liq https ga o'giradi */
export function absUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const u = url.trim();
  if (!u) return undefined;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${API_BASE}${u}`;
  if (u.startsWith("http://")) return `https://${u.slice(7)}`;
  return u;
}

function clean(s?: string | null): string | undefined {
  const t = typeof s === "string" ? s.trim() : "";
  // Backendda bo'sh joy o'rniga "." / "," yozilgan holatlar uchrab turadi
  return t && !/^[.,\-\s]+$/.test(t) ? t : undefined;
}

function unwrap<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in (json as Record<string, unknown>)) {
    return (json as { data: T }).data;
  }
  return json as T;
}

async function getJson(path: string, timeoutMs = TIMEOUT_MS): Promise<{ status: number; json: unknown }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: REVALIDATE },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    throw new ApiError(`Tarmoq xatosi: ${path} (${(e as Error)?.message ?? e})`);
  }
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    if (res.ok) throw new ApiError(`JSON emas: ${path}`, res.status);
  }
  return { status: res.status, json };
}

// ─── Restoran ───────────────────────────────────────────────────────────
const HHMM = /^(\d{1,2}):(\d{2})/;

function normalizeHours(raw: RawPartner["opening_hours"]): OpeningHours | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return clean(raw) ? { text: clean(raw) } : undefined;
  const from = raw.from_hour?.match(HHMM);
  const to = raw.to_hour?.match(HHMM);
  const keys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
  const days = keys.map((k) => raw[k] !== false);
  if (!from || !to) return { days };
  const f = `${from[1].padStart(2, "0")}:${from[2]}`;
  const t = `${to[1].padStart(2, "0")}:${to[2]}`;
  return { from: f, to: t, days, text: `${f}–${t}` };
}

function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** is_open (admin bayrog'i) + ish kuni + soat oralig'i, Asia/Tashkent bo'yicha */
export function computeOpenNow(flag: boolean | undefined, hours: OpeningHours | undefined, now = new Date()): boolean | null {
  if (flag === false) return false;
  if (!hours?.from || !hours.to) return typeof flag === "boolean" ? flag : null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dayIdx = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
  if (hours.days && dayIdx >= 0 && hours.days[dayIdx] === false) return false;
  const cur = Number(get("hour")) * 60 + Number(get("minute"));
  const start = minutes(hours.from);
  let end = minutes(hours.to);
  if (end === 23 * 60 + 59) end = 24 * 60; // "23:59:59" — kun oxirigacha
  // to < from — tungi ish vaqti (masalan 18:00–02:00)
  return start <= end ? cur >= start && cur < end : cur >= start || cur < end;
}

function normalizePartner(raw: RawPartner, uuid: string): Partner | null {
  const name = clean(raw?.name);
  if (!name) return null;
  const hours = normalizeHours(raw.opening_hours);
  const rating = toNumber(raw.rating);
  const isOpenFlag = typeof raw.is_open === "boolean" ? raw.is_open : undefined;
  return {
    uuid: raw.uuid ?? uuid,
    name,
    description: clean(raw.description),
    address: clean(raw.address),
    phone: clean(raw.phone),
    logo: absUrl(raw.logo),
    cover: absUrl(raw.banner),
    rating: rating && rating > 0 ? rating : undefined,
    isOpenFlag,
    openNow: computeOpenNow(isOpenFlag, hours),
    hours,
    partnerType: raw.partner_type ?? undefined,
  };
}

/** null — restoran yo'q (404 yoki noto'g'ri UUID). Tarmoq/5xx — ApiError. */
export async function fetchPartner(uuid: string): Promise<Partner | null> {
  if (!isValidUuid(uuid)) return null;
  const { status, json } = await getJson(`/partner/${uuid}/`);
  if (status === 404) return null;
  if (status < 200 || status >= 300) throw new ApiError(`/partner/${uuid}/ → HTTP ${status}`, status);
  return normalizePartner(unwrap<RawPartner>(json), uuid);
}

// ─── Menyu ──────────────────────────────────────────────────────────────
function normalizeProduct(p: RawProduct): MenuProduct | null {
  const name = clean(p.name);
  const base = toNumber(p.price);
  if (!name || base === undefined) return null;

  const sale = toNumber(p.sale_price);
  const disc = toNumber(p.discount);
  let price = base;
  let oldPrice: number | undefined;
  let discountPercent: number | undefined;

  // superapp MenuItem.finalPrice bilan bir xil qoida: sale_price ustun, keyin discount (%).
  // sale_price == price (masalan "30000.00"/"30000.00") — chegirma emas.
  if (sale !== undefined && sale > 0 && sale < base) {
    price = sale;
    oldPrice = base;
    const pct = Math.round((1 - sale / base) * 100);
    discountPercent = pct > 0 ? pct : undefined;
  } else if (disc !== undefined && disc > 0 && disc < 100) {
    price = Math.round((base * (100 - disc)) / 100);
    oldPrice = base;
    discountPercent = Math.round(disc);
  }

  const imgs = (p.images ?? []).filter((i) => i && i.is_active !== false && i.image);
  const sorted = [...imgs.filter((i) => i.is_main), ...imgs.filter((i) => !i.is_main)];
  const images = sorted.map((i) => absUrl(i.image)).filter((u): u is string => !!u);

  const desc = clean(p.description);
  const stock = clean(p.stock_status);
  return {
    id: p.id,
    uuid: p.uuid,
    name,
    // Ko'pincha tavsif nom bilan bir xil ("Burger" / "Burger") — takrorlamaymiz
    description: desc && desc.toLowerCase() !== name.toLowerCase() ? desc : undefined,
    price,
    oldPrice,
    discountPercent,
    image: images[0],
    images,
    stockStatus: stock && stock !== "Mavjud" ? stock : undefined,
    promotion: normalizePromotion(p.promotion),
  };
}

export interface MenuData {
  categories: MenuCategory[];
  /** Kelajak: backend kategoriya javobiga `sets` qo'shsa */
  inlineSets: MenuSet[];
}

/** Restoran menyusi. Tarmoq/5xx — ApiError; 404 — bo'sh menyu. */
export async function fetchMenu(uuid: string): Promise<MenuData> {
  if (!isValidUuid(uuid)) return { categories: [], inlineSets: [] };
  const { status, json } = await getJson(`/partner/category/?partner=${uuid}`);
  if (status === 404) return { categories: [], inlineSets: [] };
  if (status < 200 || status >= 300) throw new ApiError(`/partner/category/ → HTTP ${status}`, status);

  const data = unwrap<{ categories?: RawCategory[]; sets?: RawSet[] } | RawCategory[]>(json);
  const rawCats: RawCategory[] = Array.isArray(data) ? data : data?.categories ?? [];
  const rawSets: RawSet[] = !Array.isArray(data) && Array.isArray(data?.sets) ? data.sets : [];

  const categories = rawCats
    .filter((c) => c && c.is_active !== false)
    .map<MenuCategory>((c) => ({
      id: c.id,
      name: clean(c.category_details?.name) ?? clean(c.name) ?? "Boshqa",
      description: clean(c.category_details?.description),
      logo: absUrl(c.category_details?.logo),
      type: c.category_details?.category_type ?? undefined,
      products: (c.products ?? [])
        .filter((p) => p && p.is_active !== false && p.is_available !== false)
        .map(normalizeProduct)
        .filter((p): p is MenuProduct => !!p),
    }))
    .filter((c) => c.products.length > 0);

  return { categories, inlineSets: normalizeSets(rawSets) };
}

// ─── Kelajak: Setlar va 1+1 / 2+1 (D:\Milliy\API_CONTRACT_SETS_PROMOS.md) ─
function isLive(start?: string | null, end?: string | null, active?: boolean): boolean {
  if (active === false) return false;
  const today = todayInTashkent();
  const s = parseDmy(start);
  const e = parseDmy(end);
  if (s && today < s) return false;
  if (e && today > e) return false;
  return true;
}

function normalizeSets(raw: RawSet[]): MenuSet[] {
  return raw
    .filter((s) => s && isLive(s.start_date, s.end_date, s.is_active))
    .map<MenuSet | null>((s) => {
      const name = clean(s.name);
      const price = toNumber(s.price);
      if (!s.uuid || !name || price === undefined) return null;
      const old = toNumber(s.old_price);
      return {
        uuid: s.uuid,
        name,
        description: clean(s.description),
        image: absUrl(s.image),
        price,
        oldPrice: old && old > price ? old : undefined,
        items: (s.items ?? [])
          .map((i) => ({
            productUuid: i?.product,
            name: clean(i?.name) ?? "",
            image: absUrl(i?.image),
            quantity: Math.max(1, Math.round(toNumber(i?.quantity) ?? 1)),
          }))
          .filter((i) => i.name),
      };
    })
    .filter((s): s is MenuSet => !!s);
}

/** GET /partner/sets/?partner=<uuid> — hali backendda yo'q; xato bo'lsa []. */
export async function fetchSets(uuid: string): Promise<MenuSet[]> {
  if (!isValidUuid(uuid)) return [];
  try {
    const { status, json } = await getJson(`/partner/sets/?partner=${uuid}`, OPTIONAL_TIMEOUT_MS);
    if (status < 200 || status >= 300) return [];
    const data = unwrap<RawSet[] | { sets?: RawSet[]; results?: RawSet[] }>(json);
    const list = Array.isArray(data) ? data : data?.sets ?? data?.results ?? [];
    return Array.isArray(list) ? normalizeSets(list) : [];
  } catch {
    return [];
  }
}

/** GET /partner/promotions/?partner=<uuid> — hali backendda yo'q; xato bo'lsa []. */
export async function fetchPromotions(uuid: string): Promise<Promotion[]> {
  if (!isValidUuid(uuid)) return [];
  try {
    const { status, json } = await getJson(`/partner/promotions/?partner=${uuid}`, OPTIONAL_TIMEOUT_MS);
    if (status < 200 || status >= 300) return [];
    const data = unwrap<unknown[] | { promotions?: unknown[]; results?: unknown[] }>(json);
    const list = Array.isArray(data) ? data : data?.promotions ?? data?.results ?? [];
    if (!Array.isArray(list)) return [];
    return list
      .filter((p) => {
        const r = p as { start_date?: string; end_date?: string; is_active?: boolean };
        return isLive(r?.start_date, r?.end_date, r?.is_active);
      })
      .map(normalizePromotion)
      .filter((p): p is Promotion => !!p);
  } catch {
    return [];
  }
}

/** Ro'yxat ko'rinishidagi aksiyalarni mahsulotlarga biriktiradi (mahsulotda o'zi bo'lmasa) */
export function attachPromotions(categories: MenuCategory[], promos: Promotion[]): MenuCategory[] {
  if (promos.length === 0) return categories;
  return categories.map((c) => ({
    ...c,
    products: c.products.map((p) => {
      if (p.promotion || !p.uuid) return p;
      const hit = promos.find((pr) => pr.productUuids?.includes(p.uuid!));
      return hit ? { ...p, promotion: hit } : p;
    }),
  }));
}

/** Mavjud endpoint: /promotions/promos/ — shu restoranning amaldagi bannerlari. Xato bo'lsa []. */
export async function fetchPromoBanners(uuid: string): Promise<PromoBanner[]> {
  if (!isValidUuid(uuid)) return [];
  try {
    const { status, json } = await getJson(`/promotions/promos/`, OPTIONAL_TIMEOUT_MS);
    if (status < 200 || status >= 300) return [];
    const list = unwrap<RawPromoBanner[]>(json);
    if (!Array.isArray(list)) return [];
    return list
      .filter((b) => b?.partner_details?.uuid?.toLowerCase() === uuid.toLowerCase())
      .filter((b) => isLive(b.start_date, b.end_date, b.is_active))
      .map((b) => ({ id: b.id, title: clean(b.title), image: absUrl(b.image) ?? "" }))
      .filter((b) => b.image);
  } catch {
    return [];
  }
}
