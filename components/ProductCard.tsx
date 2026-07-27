import { formatPrice, mainImage, type Product } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  const image = mainImage(product);
  const hasDiscount = !!product.discount && product.discount > 0;
  const finalPrice = hasDiscount
    ? product.price - (product.price * (product.discount ?? 0)) / 100
    : product.price;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-milliy-cream">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="milliy-girih-bg h-full w-full" />
        )}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-milliy-red px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
            -{product.discount}%
          </span>
        )}
        {product.is_new && !hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-milliy-turquoise-2 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
            Yangi
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-milliy-text sm:text-base">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 hidden text-xs text-gray-500 sm:block">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          <span className="text-sm font-bold text-milliy-blue sm:text-base">
            {formatPrice(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
