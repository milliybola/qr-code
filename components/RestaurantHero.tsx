import type { Partner } from "@/lib/api";

function isCurrentlyOpen(partner: Partner): boolean | null {
  if (typeof partner.is_open === "boolean") return partner.is_open;
  return null;
}

export default function RestaurantHero({ partner }: { partner: Partner }) {
  const open = isCurrentlyOpen(partner);

  return (
    <div className="relative mx-auto mt-4 max-w-5xl overflow-hidden rounded-3xl shadow-md">
      <div className="relative h-48 w-full sm:h-64">
        {partner.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={partner.banner}
            alt={partner.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="milliy-ikat-pattern h-full w-full bg-gradient-to-br from-milliy-blue to-milliy-turquoise" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {open === false && (
          <span className="absolute right-4 top-4 rounded-full bg-milliy-red px-3 py-1 text-xs font-semibold text-white shadow">
            Hozir yopiq
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-6">
          <h1 className="text-2xl font-bold sm:text-3xl">{partner.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/90">
            {typeof partner.rating === "number" && (
              <span className="flex items-center gap-1">
                <span className="text-milliy-gold">★</span>
                {partner.rating.toFixed(1)}
                {partner.review_count ? ` (${partner.review_count})` : ""}
              </span>
            )}
            {partner.delivery_time && <span>⏱ {partner.delivery_time}</span>}
            {open === true && (
              <span className="rounded-full bg-milliy-turquoise-2/90 px-2 py-0.5 text-xs font-medium">
                Ochiq
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
