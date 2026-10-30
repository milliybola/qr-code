"use client";

import type { MenuProduct, MenuSet } from "@/lib/api";
import { formatPrice, formatSum } from "@/lib/format";
import SafeImage from "./SafeImage";
import { useCart } from "./CartProvider";
import { IconPlus } from "./Icons";
import { isUnavailable } from "./ProductSheet";

export function PriceRow({ price, oldPrice, size = "md" }: { price: number; oldPrice?: number; size?: "md" | "lg" }) {
  const sale = oldPrice !== undefined && oldPrice > price;
  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5">
      <span
        className={`font-black tracking-[-0.3px] ${sale ? "text-sale" : "text-ink"} ${
          size === "lg" ? "text-[24px]" : "text-[17px]"
        }`}
      >
        {formatPrice(price)}
      </span>
      {sale && (
        <s className={`text-faint ${size === "lg" ? "text-[15px]" : "text-[12px]"}`} aria-label={`Eski narx ${formatSum(oldPrice!)}`}>
          {formatSum(oldPrice!)}
        </s>
      )}
    </div>
  );
}

export function Badges({ product }: { product: Pick<MenuProduct, "discountPercent" | "promotion"> }) {
  if (!product.discountPercent && !product.promotion) return null;
  return (
    <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
      {product.discountPercent ? (
        <span className="rounded-lg bg-sale px-[7px] py-[3px] text-[12px] font-black leading-none text-white">
          −{product.discountPercent}%
        </span>
      ) : null}
      {product.promotion && (
        <span className="rounded-lg bg-gold px-[7px] py-[3px] text-[12px] font-black leading-none text-ink">
          {product.promotion.label}
        </span>
      )}
    </div>
  );
}

export function ProductCard({ product, onOpen, eager }: { product: MenuProduct; onOpen: () => void; eager?: boolean }) {
  const cart = useCart();
  const canAdd = cart.enabled && !!product.uuid && !isUnavailable(product.stockStatus);
  const inCart = product.uuid ? cart.qtyOf(product.uuid) : 0;
  return (
    <div className="relative">
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-green-bright focus-visible:ring-offset-2"
      aria-label={`${product.name}, ${formatPrice(product.price)}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-chip">
        <SafeImage
          src={product.image}
          alt={product.name}
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 230px"
          priority={eager}
          className="transition-transform duration-300 group-active:scale-[0.98]"
        />
        <Badges product={product} />
        {product.stockStatus && (
          <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-white/95 px-2 py-1 text-[11.5px] font-bold text-ink-2">
            {product.stockStatus}
          </span>
        )}
      </div>
      <div className="mt-2">
        <PriceRow price={product.price} oldPrice={product.oldPrice} />
      </div>
      <h3 className="mt-0.5 line-clamp-2 text-[14px] leading-[1.25] text-ink-2">{product.name}</h3>
    </button>
    {canAdd && (
      <button
        type="button"
        aria-label={`${product.name} — savatga qo'shish`}
        onClick={() => cart.add({ uuid: product.uuid!, name: product.name, price: product.price, image: product.image })}
        className="absolute right-2 top-2 flex h-10 min-w-10 items-center justify-center gap-1 rounded-full bg-green px-2.5 text-[14px] font-black text-white shadow-float active:scale-95"
      >
        {inCart > 0 && <span className="tabular-nums">{inCart}</span>}
        <IconPlus size={18} />
      </button>
    )}
    </div>
  );
}

export function SetCard({ set, onOpen }: { set: MenuSet; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="card flex w-full gap-3 p-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-green-bright"
    >
      <div className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-card bg-chip">
        <SafeImage src={set.image} alt={set.name} sizes="96px" iconSize={24} />
        <span className="absolute left-1.5 top-1.5 rounded-md bg-gold px-1.5 py-0.5 text-[10.5px] font-black text-ink">SET</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <h3 className="line-clamp-1 text-[16px] font-extrabold tracking-heading text-ink">{set.name}</h3>
        {set.items.length > 0 ? (
          <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted">
            {set.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
          </p>
        ) : set.description ? (
          <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted">{set.description}</p>
        ) : null}
        <div className="mt-auto pt-1">
          <PriceRow price={set.price} oldPrice={set.oldPrice} />
        </div>
      </div>
    </button>
  );
}
