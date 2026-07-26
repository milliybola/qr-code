"use client";

import type { Category } from "@/lib/api";

export default function CategoryNav({ categories }: { categories: Category[] }) {
  function scrollToCategory(id: number) {
    const el = document.getElementById(`category-${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  return (
    <nav className="sticky top-[52px] z-30 border-b border-milliy-gold/20 bg-milliy-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => scrollToCategory(c.id)}
            className="shrink-0 whitespace-nowrap rounded-full border border-milliy-gold/40 bg-white px-4 py-1.5 text-sm font-medium text-milliy-text transition hover:bg-milliy-gold-hover/30"
          >
            {c.category_details?.name ?? c.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
