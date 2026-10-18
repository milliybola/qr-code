"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { MenuCategory, MenuProduct, MenuSet } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { ProductCard, SetCard } from "./ProductCard";
import ProductSheet, { useScrollLock, type SheetItem } from "./ProductSheet";
import SafeImage from "./SafeImage";
import ApiGap from "./ApiGap";
import Wordmark from "./Wordmark";
import { IconBell, IconClose, IconEye, IconSearch } from "./Icons";

const BAR_H = 56;
const TABS_H = 52;
const SETS_ID = "sets";

interface Section {
  id: string;
  name: string;
}

/** Lotin/kirill apostrof va katta-kichik harflarni tenglashtirish */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u02BB\u02BC\u2018\u2019`]/g, "'")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function MenuView({
  restaurantName,
  logo,
  categories,
  sets,
  hasPromotions,
  hero,
  footer,
}: {
  restaurantName: string;
  logo?: string;
  categories: MenuCategory[];
  sets: MenuSet[];
  hasPromotions: boolean;
  /** Server komponentlari (RestaurantHero, AppFooter) — sticky panel ostida/oxirida */
  hero: React.ReactNode;
  footer: React.ReactNode;
}) {
  const sections = useMemo<Section[]>(
    () => [
      ...(sets.length > 0 ? [{ id: SETS_ID, name: "Setlar" }] : []),
      ...categories.map((c) => ({ id: `c${c.id}`, name: c.name })),
    ],
    [categories, sets.length]
  );

  const [active, setActive] = useState(sections[0]?.id);
  const [showBarTitle, setShowBarTitle] = useState(false);
  const [sheet, setSheet] = useState<SheetItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const programmatic = useRef(false);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Scroll-spy: tablar ostidan o'tgan oxirgi bo'lim — joriy (superapp _onScroll) ──
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      setShowBarTitle(window.scrollY > 250);
      if (programmatic.current) return;
      const line = BAR_H + TABS_H + 16;
      let current = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(`section-${s.id}`);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      // Sahifa oxiriga yetganda oxirgi bo'lim
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1]?.id ?? current;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    const onScrollEnd = () => {
      if (programmatic.current) {
        programmatic.current = false;
        compute();
      }
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScrollEnd);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sections]);

  // Faol chipni rail markaziga olib kelish — scrollLeft orqali (scrollIntoView sahifa
  // aylantirishini Chrome'da to'xtatib qo'yadi)
  useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!rail || !chip) return;
    const left = chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    setActive(id);
    programmatic.current = true;
    clearTimeout(unlockTimer.current);
    // scrollend qo'llab-quvvatlanmasa ham qulf ochiladi
    unlockTimer.current = setTimeout(() => (programmatic.current = false), 1000);
    const top = el.getBoundingClientRect().top + window.scrollY - BAR_H - TABS_H + 1;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }, []);

  const closeSheet = useCallback(() => setSheet(null), []);
  const openProduct = useCallback((product: MenuProduct) => setSheet({ kind: "product", product }), []);

  let eagerBudget = 4; // birinchi ekrandagi rasmlar — priority

  return (
    <>
      {/* Yopishqoq panel: brend/nom + qidiruv, ostida kategoriya chiplari */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <div className="relative min-w-0 flex-1">
            <div
              className={`absolute inset-0 flex items-center transition-all duration-200 ${
                showBarTitle ? "-translate-y-2 opacity-0" : "translate-y-0 opacity-100"
              }`}
              aria-hidden={showBarTitle}
            >
              <Wordmark size={19} />
              <span className="ml-2 rounded-full bg-chip px-2 py-0.5 text-[11px] font-bold text-muted">QR menyu</span>
            </div>
            <div
              className={`flex h-14 items-center gap-2 transition-all duration-200 ${
                showBarTitle ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              aria-hidden={!showBarTitle}
            >
              {logo && (
                <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg bg-chip">
                  <SafeImage src={logo} alt="" sizes="28px" iconSize={14} />
                </span>
              )}
              <span className="truncate text-[17px] font-extrabold tracking-heading text-ink">{restaurantName}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Menyudan qidirish"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-chip text-ink active:scale-95"
          >
            <IconSearch size={22} />
          </button>
        </div>
      </div>

      {hero}

      {sections.length > 0 && (
        <div className="sticky top-14 z-30 mt-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
          <nav aria-label="Kategoriyalar" className={`border-b border-line ${showBarTitle ? "shadow-bar" : ""}`}>
            <div ref={railRef} className="no-scrollbar mx-auto flex h-[52px] max-w-3xl items-center gap-2 overflow-x-auto px-4">
              {sections.map((s) => {
                const on = s.id === active;
                return (
                  <button
                    key={s.id}
                    type="button"
                    data-section={s.id}
                    onClick={() => scrollToSection(s.id)}
                    aria-current={on ? "true" : undefined}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[15px] transition-colors duration-150 ${
                      on ? "bg-ink font-extrabold text-white" : "bg-chip font-semibold text-ink-2 hover:bg-[#E9EBEE]"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      <main className="mx-auto max-w-3xl px-4 pb-10">
        {/* Kelajak funksiyalar uchun API belgilar (faqat NEXT_PUBLIC_SHOW_API_GAPS=true) */}
        {(sets.length === 0 || !hasPromotions) && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {sets.length === 0 && (
              <ApiGap title="Setlar (kombo): GET /partner/sets/?partner=<uuid> hali yo'q — API_GAPS.md #3" label="Setlar" />
            )}
            {!hasPromotions && (
              <ApiGap
                title="1+1 / 2+1 aksiyalar: GET /partner/promotions/?partner=<uuid> yoki product.promotion hali yo'q — API_GAPS.md #4"
                label="1+1 / 2+1"
              />
            )}
          </div>
        )}

        {sets.length > 0 && (
          <section id={`section-${SETS_ID}`} aria-labelledby="h-sets" className="pt-6">
            <h2 id="h-sets" className="h-section mb-3">
              Setlar
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {sets.map((s) => (
                <SetCard key={s.uuid} set={s} onOpen={() => setSheet({ kind: "set", set: s })} />
              ))}
            </div>
          </section>
        )}

        {categories.map((c) => (
          <section key={c.id} id={`section-c${c.id}`} aria-labelledby={`h-c${c.id}`} className="pt-6">
            <h2 id={`h-c${c.id}`} className="h-section mb-3">
              {c.name}
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-[18px] sm:grid-cols-3">
              {c.products.map((p) => {
                const eager = eagerBudget-- > 0;
                return <ProductCard key={p.id} product={p} eager={eager} onOpen={() => openProduct(p)} />;
              })}
            </div>
          </section>
        ))}
      </main>

      {footer}

      {/* Pastki panel: ko'rish rejimi belgisi (stoldan buyurtma API'si yo'q) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-3 rounded-tile border border-line bg-white p-2.5 pl-3.5 shadow-float">
          <IconEye size={20} className="hidden shrink-0 text-muted min-[400px]:block" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13.5px] font-extrabold text-ink">Faqat ko&apos;rish uchun</p>
            <p className="truncate text-[12px] text-muted">Buyurtmani ofitsiantga ayting</p>
          </div>
          <span className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Tez orada: ofitsiantni chaqirish"
              aria-label="Ofitsiantni chaqirish (tez orada)"
              className="flex items-center gap-1.5 rounded-full bg-green-soft px-3.5 py-2 text-[13px] font-extrabold text-green opacity-60"
            >
              <IconBell size={16} />
              <span className="min-[420px]:hidden">Ofitsiant</span>
              <span className="hidden min-[420px]:inline">Ofitsiantni chaqirish</span>
            </button>
            <ApiGap title="Ofitsiant chaqirish / stol buyurtmasi: POST /tables/<table>/call-waiter/ va stol identifikatori yo'q — API_GAPS.md #1, #2" />
          </span>
        </div>
      </div>

      <ProductSheet item={sheet} onClose={closeSheet} />

      {searchOpen && (
        <SearchOverlay
          categories={categories}
          sets={sets}
          onClose={() => setSearchOpen(false)}
          onPick={(item) => {
            setSearchOpen(false);
            setSheet(item);
          }}
        />
      )}
    </>
  );
}

function SearchOverlay({
  categories,
  sets,
  onClose,
  onPick,
}: {
  categories: MenuCategory[];
  sets: MenuSet[];
  onClose: () => void;
  onPick: (item: SheetItem) => void;
}) {
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  useScrollLock(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const all = useMemo(
    () => [
      ...sets.map((s) => ({ key: `s-${s.uuid}`, name: s.name, image: s.image, price: s.price, cat: "Setlar", item: { kind: "set", set: s } as SheetItem, hay: norm(`${s.name} ${s.items.map((i) => i.name).join(" ")}`) })),
      ...categories.flatMap((c) =>
        c.products.map((p) => ({
          key: `p-${p.id}`,
          name: p.name,
          image: p.image,
          price: p.price,
          cat: c.name,
          item: { kind: "product", product: p } as SheetItem,
          hay: norm(`${p.name} ${p.description ?? ""} ${c.name}`),
        }))
      ),
    ],
    [categories, sets]
  );

  const query = norm(dq.trim());
  const results = query ? all.filter((r) => r.hay.includes(query)) : all;

  return (
    <div className="anim-fade fixed inset-0 z-[55] flex flex-col bg-white" role="dialog" aria-modal="true" aria-label="Menyudan qidirish">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
        <label className="flex h-12 flex-1 items-center gap-2.5 rounded-card bg-chip px-3.5">
          <IconSearch size={20} className="text-muted" />
          <input
            autoFocus
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Menyudan qidirish"
            className="h-full w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-faint"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Tozalash" className="text-muted">
              <IconClose size={18} />
            </button>
          )}
        </label>
        <button type="button" onClick={onClose} className="px-2 text-[15px] font-bold text-green">
          Bekor
        </button>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto overscroll-contain px-4 pb-8">
        {results.length === 0 ? (
          <p className="pt-16 text-center text-[15px] text-muted">Hech narsa topilmadi</p>
        ) : (
          <ul className="divide-y divide-[#F0F1F3]">
            {results.map((r) => (
              <li key={r.key}>
                <button type="button" onClick={() => onPick(r.item)} className="flex w-full items-center gap-3 py-2.5 text-left">
                  <span className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-xl bg-chip">
                    <SafeImage src={r.image} alt="" sizes="52px" iconSize={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">{r.name}</span>
                    <span className="block truncate text-[12.5px] text-muted">{r.cat}</span>
                  </span>
                  <span className="shrink-0 text-[15px] font-extrabold text-ink">{formatPrice(r.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
