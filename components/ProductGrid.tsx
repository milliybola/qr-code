import type { Category } from "@/lib/api";
import ProductCard from "./ProductCard";

export default function ProductGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      {categories.map((category) => (
        <section key={category.id} id={`category-${category.id}`} className="scroll-mt-28">
          <h2 className="mb-4 flex items-center gap-2.5">
            <span className="inline-block h-6 w-1.5 rounded-full bg-gradient-to-b from-milliy-gold to-milliy-gold-hover" />
            <span className="text-xl font-bold text-milliy-text">
              {category.category_details?.name ?? category.name}
            </span>
            <span className="ml-auto rounded-full bg-milliy-gold/10 px-2.5 py-0.5 text-xs font-semibold text-milliy-gold">
              {category.products.length}
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
