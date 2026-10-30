/**
 * Stol QR menyusi API'si — faqat BRAUZERDAN chaqiriladi (har mehmon o'z IP'si bilan: backend anonim
 * so'rovlarni IP bo'yicha cheklaydi, shuning uchun server komponentidan emas).
 * Barcha endpointlar stol tokeni bilan: /partner/tables/public/<stol uuid>/…/?t=<token>
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "https://mytizim.uz").replace(/\/+$/, "");

export interface TableRef {
  tableUuid: string;
  token: string;
}

export class TableApiError extends Error {
  constructor(
    message: string,
    public status: number,
    /** Backend `code`: QR_INVALID, QR_NOT_ENABLED, CLOSED, TOO_MANY_PENDING … */
    public code?: string,
  ) {
    super(message);
  }
}

export interface CartItemInput {
  product_uuid: string;
  /** TO'LANADIGAN son — 1+1 / 2+1 sovg'ani server qo'shadi */
  quantity: number;
}

export interface QuoteLine {
  product_uuid: string;
  name: string;
  quantity: number;
  paid_quantity: number;
  free_quantity: number;
  unit_price: number;
  promotion_label: string;
  line_total: number;
}

export interface Quote {
  items: QuoteLine[];
  subtotal: number;
  service_charge_percent: number;
  service_charge_amount: number;
  total_price: number;
}

export interface OrderItemRow {
  name: string;
  quantity: number;
  free_quantity: number;
  unit_price: number;
  line_total: number;
}

export interface TableOrder {
  uuid: string;
  order_number: string | null;
  status: string;
  status_display: string;
  created_at: string;
  /** Kassada to'langan (hisobdan chiqqan) */
  is_paid: boolean;
  comment: string | null;
  guest_name: string | null;
  reject_reason: string | null;
  waiter_name: string | null;
  items: OrderItemRow[];
  service_charge_percent: number;
  service_charge_amount: number;
  total_price: number;
}

export type CallKind = "CALL" | "BILL";

export interface TableCall {
  kind: CallKind;
  kind_display: string;
  /** PENDING — xodim hali olmadi; ACKNOWLEDGED — xodim "Boraman" dedi */
  status: "PENDING" | "ACKNOWLEDGED";
  status_display: string;
  handled_by_name: string | null;
  created_at: string;
}

/** Stolning joriy "o'tirishi": hamma buyurtma to'langach yopiladi, keyingi mehmon yangisini oladi. */
export interface TableSession {
  uuid: string;
  opened_at: string;
}

export interface TableBill {
  subtotal: number;
  service_charge_amount: number;
  total: number;
  orders_count: number;
}

/** Backend javobidagi son maydonlari ba'zan satr ("25000.00") bo'lib keladi. */
const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** DRF xatolari: {message} | {detail} | {items: "…"} | {items: ["…"]} | {field: {…}} */
function messageOf(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const b = body as Record<string, unknown>;
  if (typeof b.message === "string") return b.message;
  if (typeof b.detail === "string") return b.detail;
  for (const v of Object.values(b)) {
    if (typeof v === "string") return v;
    // {items: ["…"]} yoki {items: [{product_uuid: ["…"]}]} — birinchi o'qiladigan xabar
    const parts = Array.isArray(v) ? v : [v];
    for (const part of parts) {
      if (typeof part === "string") return part;
      if (part && typeof part === "object") {
        const inner = messageOf(part, "");
        if (inner) return inner;
      }
    }
  }
  return fallback;
}

async function call<T>(ref: TableRef, path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}/partner/tables/public/${encodeURIComponent(ref.tableUuid)}${path}?t=${encodeURIComponent(ref.token)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) },
      cache: "no-store",
    });
  } catch {
    throw new TableApiError("Internet aloqasi yo'q. Qayta urinib ko'ring.", 0);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const fallback = res.status === 429 ? "Juda ko'p so'rov. Biroz kutib qayta urinib ko'ring." : "Xatolik yuz berdi. Qayta urinib ko'ring.";
    throw new TableApiError(messageOf(body, fallback), res.status, typeof body?.code === "string" ? body.code : undefined);
  }
  return body?.data as T;
}

export async function quoteCart(ref: TableRef, items: CartItemInput[]): Promise<Quote> {
  const d = await call<Quote>(ref, "/quote/", { method: "POST", body: JSON.stringify({ items }) });
  return {
    items: d.items.map((l) => ({
      ...l,
      quantity: num(l.quantity),
      paid_quantity: num(l.paid_quantity),
      free_quantity: num(l.free_quantity),
      unit_price: num(l.unit_price),
      line_total: num(l.line_total),
    })),
    subtotal: num(d.subtotal),
    service_charge_percent: num(d.service_charge_percent),
    service_charge_amount: num(d.service_charge_amount),
    total_price: num(d.total_price),
  };
}

const normalizeOrder = (o: TableOrder): TableOrder => ({
  ...o,
  service_charge_percent: num(o.service_charge_percent),
  service_charge_amount: num(o.service_charge_amount),
  total_price: num(o.total_price),
  items: o.items.map((i) => ({
    ...i,
    quantity: num(i.quantity),
    free_quantity: num(i.free_quantity),
    unit_price: num(i.unit_price),
    line_total: num(i.line_total),
  })),
});

export async function placeOrder(
  ref: TableRef,
  payload: { items: CartItemInput[]; comment?: string; guest_name?: string },
): Promise<TableOrder> {
  return normalizeOrder(await call<TableOrder>(ref, "/orders/", { method: "POST", body: JSON.stringify(payload) }));
}

export async function listOrders(
  ref: TableRef,
): Promise<{ session: TableSession | null; orders: TableOrder[]; bill: TableBill; calls: TableCall[] }> {
  const d = await call<{ session?: TableSession | null; orders: TableOrder[]; bill: TableBill; calls?: TableCall[] }>(ref, "/orders/");
  return {
    session: d.session ?? null,
    calls: d.calls ?? [],
    orders: d.orders.map(normalizeOrder),
    bill: {
      subtotal: num(d.bill.subtotal),
      service_charge_amount: num(d.bill.service_charge_amount),
      total: num(d.bill.total),
      orders_count: d.bill.orders_count,
    },
  };
}

/** Ofitsiantni chaqirish / hisob so'rash. Takroriy bosish yangi signal yaratmaydi (server: already). */
export async function requestCall(ref: TableRef, kind: CallKind): Promise<{ already: boolean; calls: TableCall[] }> {
  const d = await call<{ already: boolean; calls: TableCall[] }>(ref, "/call/", { method: "POST", body: JSON.stringify({ kind }) });
  return { already: d.already, calls: d.calls ?? [] };
}
