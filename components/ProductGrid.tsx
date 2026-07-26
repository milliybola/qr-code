import type { Category } from "@/lib/api";
import ProductCard from "./ProductCard";

export default function ProductGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      {categories.map((category) => (
        <section key={category.id} id={`category-${category.id}`} className="scroll-mt-28">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-milliy-text">
            <span className="inline-block h-5 w-1.5 rounded-full bg-milliy-gold" />
            {category.category_details?.name ?? category.name}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
