/**
 * Setlar va 1+1 / 2+1 (BUY_X_GET_Y) aksiyalari — umumiy kontrakt:
 * D:\Milliy\API_CONTRACT_SETS_PROMOS.md. Backendda hali yo'q; barcha maydonlar ixtiyoriy.
 * Bu fayl serverda ham, klientda ham ishlaydi (sof funksiyalar).
 */

export interface Promotion {
  uuid?: string;
  type: "BUY_X_GET_Y";
  buyQuantity: number;
  getQuantity: number;
  /** "1+1", "2+1" — backend `label` bersa o'sha, aks holda `${buy}+${get}` */
  label: string;
  sameProduct?: boolean;
  productUuids?: string[];
}

/** Kontrakt §2 dagi ham to'liq, ham mahsulotdagi qisqa ko'rinishni o'qiydi. Noto'g'ri bo'lsa undefined. */
export function normalizePromotion(raw: unknown): Promotion | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  if (r.is_active === false) return undefined;
  if (r.type !== undefined && r.type !== "BUY_X_GET_Y") return undefined;
  const buy = Math.round(Number(r.buy_quantity));
  const get = Math.round(Number(r.get_quantity));
  if (!Number.isFinite(buy) || !Number.isFinite(get) || buy < 1 || get < 1) return undefined;
  const label = typeof r.label === "string" && r.label.trim() ? r.label.trim() : `${buy}+${get}`;
  return {
    uuid: typeof r.uuid === "string" ? r.uuid : undefined,
    type: "BUY_X_GET_Y",
    buyQuantity: buy,
    getQuantity: get,
    label,
    sameProduct: typeof r.same_product === "boolean" ? r.same_product : undefined,
    productUuids: Array.isArray(r.products) ? r.products.filter((x): x is string => typeof x === "string") : undefined,
  };
}

/**
 * Kontrakt §3: group = buy + get; free = floor(qty / group) * get; pay = qty - free.
 * Faqat ko'rsatish uchun — yakuniy hisobni server qiladi.
 */
export function promoSplit(qty: number, promo: Pick<Promotion, "buyQuantity" | "getQuantity">) {
  const group = promo.buyQuantity + promo.getQuantity;
  const free = group > 0 ? Math.floor(Math.max(0, qty) / group) * promo.getQuantity : 0;
  return { group, free, pay: Math.max(0, qty) - free };
}

/** "dd-MM-yyyy" yoki ISO → "yyyy-MM-dd" (taqqoslash uchun satr); noto'g'ri bo'lsa undefined */
export function parseDmy(raw?: string | null): string | undefined {
  const s = raw?.trim();
  if (!s) return undefined;
  const dmy = s.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : undefined;
}

/** Bugungi sana Asia/Tashkent bo'yicha "yyyy-MM-dd" */
export function todayInTashkent(now = new Date()): string {
  // en-CA → "2026-10-19"
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(now);
}
