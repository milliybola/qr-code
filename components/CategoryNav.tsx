"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/api";

export default function CategoryNav({ categories }: { categories: Category[] }) {
  const [activeId, setActiveId] = useState<number | null>(categories[0]?.id ?? null);
  const railRef = useRef<HTMLDivElement>(null);
  const suppressObserver = useRef(false);
  const suppressTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function scrollToCategory(id: number) {
    const el = document.getElementById(`category-${id}`);
    if (!el) return;

    suppressObserver.current = true;
    setActiveId(id);
    clearTimeout(suppressTimeout.current);
    suppressTimeout.current = setTimeout(() => {
      suppressObserver.current = false;
    }, 700);

    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  }

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`category-${c.id}`))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressObserver.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(Number(visible[0].target.id.replace("category-", "")));
        }
      },
      { rootMargin: "-110px 0px -65% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    if (activeId == null || !railRef.current) return;
    const btn = railRef.current.querySelector<HTMLButtonElement>(`[data-id="${activeId}"]`);
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <nav className="sticky top-[52px] z-30 border-b border-milliy-gold/20 bg-milliy-cream/95 backdrop-blur">
      <div
        ref={railRef}
        className="no-scrollbar mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3"
      >
        {categories.map((c) => {
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              data-id={c.id}
              onClick={() => scrollToCategory(c.id)}
              aria-current={isActive}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-milliy-gold to-milliy-gold-hover text-white shadow-md shadow-milliy-gold/40"
                  : "border border-milliy-gold/30 bg-white text-milliy-text hover:border-milliy-gold/60 hover:bg-milliy-gold-hover/15"
              }`}
            >
              {c.category_details?.name ?? c.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
