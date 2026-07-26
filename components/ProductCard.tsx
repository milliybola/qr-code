import { formatPrice, mainImage, type Product } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  const image = mainImage(product);
  const hasDiscount = !!product.discount && product.discount > 0;
  const finalPrice = hasDiscount
    ? product.price - (product.price * (product.discount ?? 0)) / 100
    : product.price;

  return (
    <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 sm:flex-col sm:gap-0 sm:p-4">
      <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-milliy-cream sm:w-full">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="milliy-girih-bg h-full w-full" />
        )}
        {hasDiscount && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-milliy-red px-2 py-0.5 text-xs font-semibold text-white">
            -{product.discount}%
          </span>
        )}
        {product.is_new && !hasDiscount && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-milliy-turquoise-2 px-2 py-0.5 text-xs font-semibold text-white">
            Yangi
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center sm:mt-3 sm:justify-start">
        <h3 className="line-clamp-2 text-sm font-semibold text-milliy-text sm:text-base">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 hidden text-xs text-gray-500 sm:block">
            {product.description}
          </p>
        )}
        <div className="mt-1.5 flex items-baseline gap-2 sm:mt-2">
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
