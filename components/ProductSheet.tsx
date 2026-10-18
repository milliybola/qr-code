"use client";

import { useEffect, useRef, useState } from "react";
import type { MenuProduct, MenuSet } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { promoSplit } from "@/lib/promos";
import SafeImage from "./SafeImage";
import ApiGap from "./ApiGap";
import { Badges, PriceRow } from "./ProductCard";
import { IconBell, IconClose } from "./Icons";

export type SheetItem = { kind: "product"; product: MenuProduct } | { kind: "set"; set: MenuSet };

/** Body scroll'ini qulflash (iOS'da ham sakramasligi uchun scrollbar kengligini saqlaymiz) */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { overflow, paddingRight } = document.body.style;
    const sb = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sb > 0) document.body.style.paddingRight = `${sb}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [active]);
}

function PromoExplainer({ product }: { product: MenuProduct }) {
  const promo = product.promotion!;
  const { group } = promoSplit(0, promo);
  // Misol: bitta to'liq guruh — kontrakt §3 formulasi bo'yicha
  const ex = promoSplit(group, promo);
  return (
    <div className="mt-4 rounded-tile bg-gold-soft p-3.5">
      <p className="text-[16px] font-black tracking-heading text-ink">
        <span className="mr-1.5 rounded-lg bg-gold px-1.5 py-0.5 text-[13px]">{promo.label}</span>
        aksiya
      </p>
      <p className="mt-1 text-[13.5px] font-medium text-ink-2">
        {group} ta olsangiz — {ex.free} tasi bepul ({ex.pay} tasi uchun to&apos;laysiz:{" "}
        <b>{formatPrice(ex.pay * product.price)}</b>).
      </p>
      <p className="mt-1 text-[11.5px] text-muted">Yakuniy hisobni restoran kassasi qiladi.</p>
    </div>
  );
}

export default function ProductSheet({ item, onClose }: { item: SheetItem | null; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [imgIdx, setImgIdx] = useState(0);
  useScrollLock(!!item);

  useEffect(() => {
    setImgIdx(0);
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;

  const isSet = item.kind === "set";
  const name = isSet ? item.set.name : item.product.name;
  const price = isSet ? item.set.price : item.product.price;
  const oldPrice = isSet ? item.set.oldPrice : item.product.oldPrice;
  const description = isSet ? item.set.description : item.product.description;
  const images = isSet ? (item.set.image ? [item.set.image] : []) : item.product.images;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={name}>
      <button type="button" aria-label="Yopish" onClick={onClose} className="anim-fade absolute inset-0 bg-black/45" />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="anim-sheet relative flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-sheet bg-white outline-none sm:rounded-sheet"
      >
        <div className="overflow-y-auto overscroll-contain pb-[max(16px,env(safe-area-inset-bottom))]">
          {/* Rasm(lar) */}
          <div className="relative aspect-square max-h-[56svh] w-full bg-chip sm:aspect-[4/3]">
            <SafeImage
              key={images[imgIdx] ?? "none"}
              src={images[imgIdx]}
              alt={name}
              sizes="(max-width: 640px) 100vw, 512px"
              priority
              iconSize={56}
            />
            {!isSet && <Badges product={item.product} />}
            {isSet && (
              <span className="absolute left-3 top-3 rounded-lg bg-gold px-2 py-1 text-[12px] font-black text-ink">SET</span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Yopish"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-ink shadow-float"
            >
              <IconClose size={22} />
            </button>
            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    aria-label={`Rasm ${i + 1}`}
                    onClick={() => setImgIdx(i)}
                    className={`h-2 rounded-full transition-all ${i === imgIdx ? "w-5 bg-white" : "w-2 bg-white/60"}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="px-5 pt-4">
            <h2 className="text-[24px] font-black leading-tight tracking-heading text-ink">{name}</h2>
            <div className="mt-2">
              <PriceRow price={price} oldPrice={oldPrice} size="lg" />
            </div>

            {description && <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{description}</p>}

            {isSet && item.set.items.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[15px] font-extrabold text-ink">Set tarkibi</h3>
                <ul className="mt-2 divide-y divide-line rounded-card border border-line">
                  {item.set.items.map((it, i) => (
                    <li key={`${it.productUuid ?? it.name}-${i}`} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-chip">
                        <SafeImage src={it.image} alt="" sizes="40px" iconSize={16} />
                      </div>
                      <span className="flex-1 text-[14.5px] font-semibold text-ink">{it.name}</span>
                      <span className="text-[14px] font-extrabold text-muted">×{it.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isSet && item.product.promotion && <PromoExplainer product={item.product} />}

            {!isSet && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
                <span>Tarkib, gramm, kaloriya</span>
                <ApiGap title="Mahsulotda tarkib (ingredients), og'irlik/porsiya (weight), allergenlar yo'q — API_GAPS.md #6" />
              </div>
            )}

            {/* Ko'rish rejimi — buyurtma API'si yo'q */}
            <div className="mt-5 flex items-center gap-3 rounded-tile border border-line bg-chip/60 p-3.5">
              <IconBell size={22} className="shrink-0 text-green" />
              <p className="flex-1 text-[13.5px] font-semibold text-ink-2">
                Buyurtma berish uchun ofitsiantga ayting
              </p>
              <ApiGap title="Stoldan buyurtma / savat endpointi yo'q — API_GAPS.md #1" label="buyurtma" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
