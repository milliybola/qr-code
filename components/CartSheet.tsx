"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice, formatSum } from "@/lib/format";
import { placeOrder, quoteCart, TableApiError, type Quote } from "@/lib/tableApi";
import { useCart } from "./CartProvider";
import { useTable } from "./TableProvider";
import { useScrollLock } from "./ProductSheet";
import SafeImage from "./SafeImage";
import { IconClose, IconMinus, IconPlus } from "./Icons";

const GUEST_KEY = "qr-guest-name";

export function Stepper({ qty, onChange, size = "md" }: { qty: number; onChange: (q: number) => void; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const btn = `${dim} flex items-center justify-center rounded-full bg-chip text-ink active:scale-95`;
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className={btn} aria-label="Kamaytirish" onClick={() => onChange(qty - 1)}>
        <IconMinus size={16} />
      </button>
      <span className="min-w-[26px] text-center text-[15px] font-black tabular-nums text-ink">{qty}</span>
      <button type="button" className={btn} aria-label="Ko'paytirish" onClick={() => onChange(qty + 1)}>
        <IconPlus size={16} />
      </button>
    </div>
  );
}

/** Savat: server hisoblagan narx (sovg'a, aksiya, xizmat haqi) bilan; "Buyurtma berish" — tasdiqlash uchun ofitsiantga ketadi. */
export default function CartSheet() {
  const { cartOpen, setCartOpen, lines, setQty, clear, rememberOrder, setOrdersOpen } = useCart();
  const table = useTable();
  useScrollLock(cartOpen);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [guest, setGuest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    try {
      setGuest(localStorage.getItem(GUEST_KEY) ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  const ref = table.status === "ok" ? { tableUuid: table.tableUuid, token: table.token } : null;
  const itemsKey = lines.map((l) => `${l.uuid}:${l.qty}`).join(",");

  // Savat o'zgarsa — narxni serverdan qayta hisoblaymiz (kechiktirib, so'rovlar to'planmasin)
  useEffect(() => {
    if (!cartOpen || !ref || lines.length === 0) {
      setQuote(null);
      return;
    }
    const id = ++reqId.current;
    setQuoting(true);
    setQuoteError(null);
    const t = setTimeout(() => {
      quoteCart(ref, lines.map((l) => ({ product_uuid: l.uuid, quantity: l.qty })))
        .then((q) => {
          if (id === reqId.current) setQuote(q);
        })
        .catch((e: unknown) => {
          if (id !== reqId.current) return;
          setQuote(null);
          setQuoteError(e instanceof TableApiError ? e.message : "Narxni hisoblab bo'lmadi.");
        })
        .finally(() => {
          if (id === reqId.current) setQuoting(false);
        });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartOpen, itemsKey, table.status]);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  if (!cartOpen || !ref) return null;

  const priced = new Map(quote?.items.map((q) => [q.product_uuid, q]));

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const name = guest.trim();
      try {
        localStorage.setItem(GUEST_KEY, name);
      } catch {
        /* ignore */
      }
      const order = await placeOrder(ref, {
        items: lines.map((l) => ({ product_uuid: l.uuid, quantity: l.qty })),
        comment: comment.trim() || undefined,
        guest_name: name || undefined,
      });
      rememberOrder(order.uuid);
      clear();
      setComment("");
      setCartOpen(false);
      setOrdersOpen(true);
    } catch (e) {
      setSubmitError(e instanceof TableApiError ? e.message : "Buyurtmani yuborib bo'lmadi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = lines.length > 0 && !!quote && !quoting && !submitting;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Savat">
      <button type="button" aria-label="Yopish" onClick={() => setCartOpen(false)} className="anim-fade absolute inset-0 bg-black/45" />
      <div className="anim-sheet relative flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-sheet bg-white sm:rounded-sheet">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[20px] font-black tracking-heading text-ink">Savat</h2>
            <p className="text-[12.5px] text-muted">{table.status === "ok" ? table.name : ""}</p>
          </div>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Yopish" className="flex h-10 w-10 items-center justify-center rounded-full bg-chip text-ink">
            <IconClose size={20} />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-3">
          {lines.length === 0 ? (
            <p className="py-10 text-center text-[15px] font-semibold text-muted">Savat bo&apos;sh. Menyudan tanlang.</p>
          ) : (
            <ul className="divide-y divide-line">
              {lines.map((l) => {
                const q = priced.get(l.uuid);
                return (
                  <li key={l.uuid} className="flex items-center gap-3 py-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-chip">
                      <SafeImage src={l.image} alt="" sizes="56px" iconSize={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[14.5px] font-bold leading-snug text-ink">{l.name}</p>
                      <p className="text-[13px] text-muted">
                        {formatPrice(q?.unit_price ?? l.price)}
                        {q && q.free_quantity > 0 && (
                          <span className="ml-1.5 rounded-md bg-gold-soft px-1.5 py-0.5 text-[11.5px] font-black text-ink">
                            + {q.free_quantity} ta sovg&apos;a
                          </span>
                        )}
                      </p>
                    </div>
                    <Stepper qty={l.qty} onChange={(n) => setQty(l.uuid, n)} size="sm" />
                  </li>
                );
              })}
            </ul>
          )}

          {lines.length > 0 && (
            <div className="mt-2 space-y-3 pb-2">
              <input
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                maxLength={60}
                placeholder="Ismingiz (ixtiyoriy)"
                className="w-full rounded-tile border border-line bg-chip/50 px-3.5 py-3 text-[15px] text-ink outline-none focus:border-green"
              />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={300}
                rows={2}
                placeholder="Izoh (masalan: piyozsiz)"
                className="w-full resize-none rounded-tile border border-line bg-chip/50 px-3.5 py-3 text-[15px] text-ink outline-none focus:border-green"
              />
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-line px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
            {quoteError ? (
              <p className="mb-3 rounded-tile bg-red-50 px-3 py-2.5 text-[13.5px] font-bold text-red-700" role="alert">
                {quoteError}
              </p>
            ) : (
              <dl className={`space-y-1 text-[14px] ${quoting ? "opacity-50" : ""}`}>
                <div className="flex justify-between text-ink-2">
                  <dt>Taomlar</dt>
                  <dd className="tabular-nums">{quote ? formatPrice(quote.subtotal) : "…"}</dd>
                </div>
                {quote && quote.service_charge_amount > 0 && (
                  <div className="flex justify-between text-ink-2">
                    <dt>Xizmat haqi ({formatSum(quote.service_charge_percent)}%)</dt>
                    <dd className="tabular-nums">{formatPrice(quote.service_charge_amount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-[17px] font-black text-ink">
                  <dt>Jami</dt>
                  <dd className="tabular-nums">{quote ? formatPrice(quote.total_price) : "…"}</dd>
                </div>
              </dl>
            )}
            {submitError && (
              <p className="mt-2 rounded-tile bg-red-50 px-3 py-2.5 text-[13.5px] font-bold text-red-700" role="alert">
                {submitError}
              </p>
            )}
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submit}
              className="mt-3 w-full rounded-full bg-green py-3.5 text-[16px] font-black text-white disabled:opacity-50"
            >
              {submitting ? "Yuborilmoqda…" : "Buyurtma berish"}
            </button>
            <p className="mt-2 text-center text-[12px] text-muted">Ofitsiant tasdiqlaydi. To&apos;lov — kassada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
