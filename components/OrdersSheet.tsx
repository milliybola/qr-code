"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import { listOrders, TableApiError, type TableBill, type TableOrder } from "@/lib/tableApi";
import { useCart } from "./CartProvider";
import { useTable } from "./TableProvider";
import { useScrollLock } from "./ProductSheet";
import { IconClose, IconMinus, IconPlus } from "./Icons";
import { callSummary, isPending } from "@/lib/callText";

const POLL_MS = 6000;
const MAX_PEOPLE = 20;

/** Hisobga kiradigan buyurtma: kassa tasdiqlagan, hali to'lanmagan (serverdagi qoida bilan bir xil). */
const NOT_BILLED = ["PENDING", "NEW", "REJECTED", "CANCELLED"];
const isBillable = (o: TableOrder) => !o.is_paid && !NOT_BILLED.includes(o.status);

type Tone = "wait" | "ok" | "ready" | "done" | "bad";

const STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "Tasdiqlanmoqda", tone: "wait" },
  NEW: { label: "Tasdiqlanmoqda", tone: "wait" },
  ACCEPTED: { label: "Qabul qilindi", tone: "ok" },
  PREPARING: { label: "Tayyorlanmoqda", tone: "ok" },
  READY_FOR_PICKUP: { label: "Tayyor", tone: "ready" },
  PICKED_UP: { label: "Berildi", tone: "done" },
  ON_THE_WAY: { label: "Berildi", tone: "done" },
  DELIVERED: { label: "Berildi", tone: "done" },
  COMPLETED: { label: "Berildi", tone: "done" },
  REJECTED: { label: "Rad etildi", tone: "bad" },
  CANCELLED: { label: "Bekor qilindi", tone: "bad" },
};

const TONE_CLASS: Record<Tone, string> = {
  wait: "bg-gold-soft text-ink",
  ok: "bg-green-tint text-green",
  ready: "bg-green text-white",
  done: "bg-chip text-ink-2",
  bad: "bg-red-50 text-red-700",
};

function timeOf(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function OrderCard({ order, mine }: { order: TableOrder; mine: boolean }) {
  const st = STATUS[order.status] ?? { label: order.status_display, tone: "done" as Tone };
  const bad = st.tone === "bad";
  return (
    <li className={`rounded-card border p-3.5 ${bad ? "border-red-200 bg-red-50/40" : "border-line bg-white"}`}>
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-black text-ink">#{order.order_number ?? "—"}</span>
        <span className="text-[12.5px] text-muted">{timeOf(order.created_at)}</span>
        {mine && <span className="rounded-md bg-chip px-1.5 py-0.5 text-[11px] font-bold text-ink-2">Sizniki</span>}
        {order.is_paid ? (
          <span className="ml-auto rounded-full bg-green px-2.5 py-1 text-[12px] font-extrabold text-white">To&apos;langan</span>
        ) : (
          <span className={`ml-auto rounded-full px-2.5 py-1 text-[12px] font-extrabold ${TONE_CLASS[st.tone]}`}>{st.label}</span>
        )}
      </div>
      <ul className="mt-2 space-y-0.5">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between gap-3 text-[14px] text-ink-2">
            <span className="min-w-0">
              {it.quantity - it.free_quantity > 0 ? it.quantity - it.free_quantity : it.quantity}× {it.name}
              {it.free_quantity > 0 && <span className="ml-1 text-[12px] font-bold text-green">+{it.free_quantity} sovg&apos;a</span>}
            </span>
            <span className="shrink-0 tabular-nums">{formatPrice(it.line_total)}</span>
          </li>
        ))}
      </ul>
      {bad && order.reject_reason && (
        <p className="mt-2 rounded-tile bg-red-50 px-3 py-2 text-[13.5px] font-bold text-red-700">Sabab: {order.reject_reason}</p>
      )}
      {!bad && order.waiter_name && <p className="mt-2 text-[12.5px] text-muted">Ofitsiant: {order.waiter_name}</p>}
      {order.comment && <p className="mt-1 text-[12.5px] text-muted">Izoh: {order.comment}</p>}
      {!bad && (
        <p className="mt-2 text-right text-[14px] font-black text-ink">
          {formatPrice(order.total_price)}
          {order.service_charge_amount > 0 && (
            <span className="ml-1 text-[11.5px] font-semibold text-muted">(xizmat haqi bilan)</span>
          )}
        </p>
      )}
    </li>
  );
}

/** Stolning buyurtmalari, ularning holati va umumiy hisob. Ochiq turganda har 6 soniyada yangilanadi. */
export default function OrdersSheet() {
  const { ordersOpen, setOrdersOpen, mine, syncSession, calls, setCalls, callBusy, callError, sendCall } = useCart();
  const table = useTable();
  useScrollLock(ordersOpen);

  const [orders, setOrders] = useState<TableOrder[] | null>(null);
  const [bill, setBill] = useState<TableBill | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Oldingi hisob yopildi (to'landi) va yangi buyurtma hali yo'q */
  const [closed, setClosed] = useState(false);
  /** Hisob ko'rinishi: butun stol yoki faqat shu qurilmadan berilgan buyurtmalar */
  const [scope, setScope] = useState<"table" | "mine">("table");
  const [people, setPeople] = useState(2);
  const alive = useRef(true);

  const ref = table.status === "ok" ? { tableUuid: table.tableUuid, token: table.token } : null;
  const tableUuid = ref?.tableUuid;
  const token = ref?.token;

  const load = useCallback(async () => {
    if (!tableUuid || !token) return;
    try {
      const d = await listOrders({ tableUuid, token });
      if (!alive.current) return;
      setOrders(d.orders);
      setBill(d.bill);
      setCalls(d.calls);
      setClosed(syncSession(d.session));
      setError(null);
    } catch (e) {
      if (alive.current) setError(e instanceof TableApiError ? e.message : "Buyurtmalarni yuklab bo'lmadi.");
    }
  }, [tableUuid, token, setCalls, syncSession]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!ordersOpen) return;
    void load();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, POLL_MS);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOrdersOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [ordersOpen, load, setOrdersOpen]);

  // "Meniki": faqat shu qurilmadan berilgan, hali to'lanmagan buyurtmalar
  const own = useMemo(() => (orders ?? []).filter((o) => mine.has(o.uuid) && isBillable(o)), [orders, mine]);
  const ownTotal = own.reduce((sum, o) => sum + o.total_price, 0);

  if (!ordersOpen || !ref) return null;

  const hasBill = !!bill && bill.orders_count > 0;
  const showMine = scope === "mine" && own.length > 0;
  const total = showMine ? ownTotal : (bill?.total ?? 0);
  const perPerson = Math.ceil(total / people / 100) * 100; // so'mni yuzliklarga yaxlitlaymiz

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Buyurtmalarim">
      <button type="button" aria-label="Yopish" onClick={() => setOrdersOpen(false)} className="anim-fade absolute inset-0 bg-black/45" />
      <div className="anim-sheet relative flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-sheet bg-white sm:rounded-sheet">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[20px] font-black tracking-heading text-ink">Buyurtmalar va hisob</h2>
            <p className="text-[12.5px] text-muted">{table.status === "ok" ? table.name : ""}</p>
          </div>
          <button type="button" onClick={() => setOrdersOpen(false)} aria-label="Yopish" className="flex h-10 w-10 items-center justify-center rounded-full bg-chip text-ink">
            <IconClose size={20} />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-3">
          {error && !orders && <p className="py-8 text-center text-[14.5px] font-semibold text-red-700">{error}</p>}
          {!error && !orders && <p className="py-8 text-center text-[14.5px] text-muted">Yuklanmoqda…</p>}
          {orders && orders.length === 0 && (
            <p className="py-10 text-center text-[15px] font-semibold text-muted">
              {closed ? "Hisob yopildi — rahmat! Yangi buyurtma berishingiz mumkin." : "Hozircha buyurtma yo'q."}
            </p>
          )}
          {orders && orders.length > 0 && (
            <ul className="space-y-3 pb-2">
              {[...orders].reverse().map((o) => (
                <OrderCard key={o.uuid} order={o} mine={mine.has(o.uuid)} />
              ))}
            </ul>
          )}
          {error && orders && <p className="pb-2 text-center text-[12.5px] text-muted">Yangilab bo&apos;lmadi — qayta urinamiz…</p>}
        </div>

        <div className="border-t border-line px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
          {hasBill ? (
            <>
              {own.length > 0 && (
                <div className="mb-3 grid grid-cols-2 gap-1 rounded-full bg-chip p-1 text-[13.5px] font-extrabold" role="tablist" aria-label="Hisob turi">
                  {(["table", "mine"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="tab"
                      aria-selected={scope === k}
                      onClick={() => setScope(k)}
                      className={`rounded-full py-2 ${scope === k ? "bg-white text-ink shadow-sm" : "text-ink-2"}`}
                    >
                      {k === "table" ? "Butun stol" : "Mening buyurtmalarim"}
                    </button>
                  ))}
                </div>
              )}
              <dl className="space-y-1 text-[14px]">
                {!showMine && (
                  <>
                    <div className="flex justify-between text-ink-2">
                      <dt>Taomlar</dt>
                      <dd className="tabular-nums">{formatPrice(bill!.subtotal)}</dd>
                    </div>
                    {bill!.service_charge_amount > 0 && (
                      <div className="flex justify-between text-ink-2">
                        <dt>Xizmat haqi</dt>
                        <dd className="tabular-nums">{formatPrice(bill!.service_charge_amount)}</dd>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between text-[18px] font-black text-ink">
                  <dt>{showMine ? "Mening hisobim" : "Stol hisobi"}</dt>
                  <dd className="tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>
              {showMine && (
                <p className="mt-1 text-[12.5px] text-muted">
                  Kassada ayting: {own.map((o) => `#${o.order_number ?? "—"}`).join(", ")} — faqat shular to&apos;lanadi.
                </p>
              )}
              <div className="mt-3 flex items-center justify-between rounded-tile bg-chip px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Kishilar sonini kamaytirish"
                    onClick={() => setPeople((n) => Math.max(2, n - 1))}
                    disabled={people <= 2}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink disabled:opacity-40"
                  >
                    <IconMinus size={16} />
                  </button>
                  <span className="min-w-[4.5rem] text-center text-[14px] font-extrabold text-ink">{people} kishi</span>
                  <button
                    type="button"
                    aria-label="Kishilar sonini oshirish"
                    onClick={() => setPeople((n) => Math.min(MAX_PEOPLE, n + 1))}
                    disabled={people >= MAX_PEOPLE}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink disabled:opacity-40"
                  >
                    <IconPlus size={16} />
                  </button>
                </div>
                <p className="text-right text-[13px] text-ink-2">
                  Teng bo&apos;lsak: <b className="tabular-nums text-ink">{formatPrice(perPerson)}</b>
                </p>
              </div>
            </>
          ) : (
            <p className="text-[13.5px] text-muted">
              {orders && orders.some((o) => o.is_paid) && !orders.some(isBillable)
                ? "Hisob to'landi — rahmat!"
                : "Hisob tasdiqlangan buyurtmalardan hosil bo'ladi."}
            </p>
          )}
          {hasBill && (
            <button
              type="button"
              onClick={() => void sendCall("BILL")}
              disabled={callBusy || isPending(calls, "BILL")}
              className="mt-3 w-full rounded-full bg-green py-3.5 text-[15.5px] font-black text-white disabled:opacity-60"
            >
              {isPending(calls, "BILL") ? "Hisob so'raldi — kuting" : "Hisobni so'rash"}
            </button>
          )}
          {(callError || callSummary(calls)) && (
            <p className="mt-2 text-center text-[13px] font-bold text-green" aria-live="polite">{callError ?? callSummary(calls)}</p>
          )}
          <p className="mt-2 text-[12px] text-muted">To&apos;lov — kassada. Hisobni bo&apos;lib to&apos;lash uchun ofitsiantga ayting.</p>
        </div>
      </div>
    </div>
  );
}
