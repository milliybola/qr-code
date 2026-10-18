import type { Partner, PromoBanner } from "@/lib/api";
import SafeImage from "./SafeImage";
import ApiGap from "./ApiGap";
import { IconClock, IconLock, IconPin, IconStar } from "./Icons";

function Divider() {
  return <span className="mx-3.5 h-[30px] w-px shrink-0 bg-[#E5E7EB]" aria-hidden />;
}

function InfoCell({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {icon}
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[15.5px] font-extrabold text-ink">{value}</div>
        <div className="text-[12.5px] text-muted">{label}</div>
      </div>
    </div>
  );
}

export default function RestaurantHero({ partner, banners }: { partner: Partner; banners: PromoBanner[] }) {
  const open = partner.openNow;
  const hours = partner.hours?.text;

  return (
    <header className="mx-auto max-w-3xl px-4 pt-3">
      {/* Muqova + logo */}
      <div className="relative">
        <div className="relative h-[168px] w-full overflow-hidden rounded-tile sm:h-[220px]">
          {partner.cover ? (
            <SafeImage src={partner.cover} alt={partner.name} sizes="(max-width: 768px) 100vw, 768px" priority />
          ) : (
            <div className="girih-bg absolute inset-0" aria-hidden />
          )}
        </div>
        <div className="absolute -bottom-7 left-4 h-[72px] w-[72px] overflow-hidden rounded-[20px] border-[3px] border-white bg-white shadow-float">
          <div className="relative h-full w-full">
            {partner.logo ? (
              <SafeImage src={partner.logo} alt="" sizes="72px" priority fit="cover" iconSize={24} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-green-soft text-2xl font-black text-green">
                {partner.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-10">
        <h1 className="h-display text-[30px] leading-[1.1] sm:text-[34px]">{partner.name}</h1>
        {partner.description && partner.description !== partner.name && (
          <p className="mt-1.5 text-[14.5px] text-muted">{partner.description}</p>
        )}

        {/* Reyting · Ish vaqti · Holat */}
        <div className="mt-4 flex items-center overflow-hidden">
          {typeof partner.rating === "number" && (
            <>
              <InfoCell
                icon={<IconStar size={26} className="shrink-0 text-gold" />}
                value={partner.rating.toFixed(1)}
                label="Reyting"
              />
              <Divider />
            </>
          )}
          {hours ? (
            <InfoCell icon={<IconClock size={24} className="shrink-0 text-green" />} value={hours} label="Ish vaqti" />
          ) : (
            <InfoCell
              icon={<IconClock size={24} className="shrink-0 text-faint" />}
              value={<ApiGap title="opening_hours bo'sh — ish vaqti ko'rsatilmaydi" />}
              label="Ish vaqti"
            />
          )}
        </div>

        {partner.address && (
          <p className="mt-3 flex items-start gap-1.5 text-[13.5px] text-muted">
            <IconPin size={16} className="mt-0.5 shrink-0" />
            <span>{partner.address}</span>
          </p>
        )}

        {/* Holat kartasi */}
        <div className="mt-4">
          {open === false ? (
            <div className="flex items-center gap-3 rounded-tile bg-closed-bg p-3.5">
              <IconLock size={22} className="shrink-0 text-closed-icon" />
              <p className="text-[14px] font-bold text-closed-fg">
                Muassasa hozir yopiq{hours ? ` · Ish vaqti: ${hours}` : ""}
                <span className="block text-[12.5px] font-medium opacity-80">Menyuni ko&apos;rishingiz mumkin</span>
              </p>
            </div>
          ) : open === true ? (
            <div className="flex items-center gap-3 rounded-tile bg-green-soft p-3.5">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-bright opacity-40" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-bright" />
              </span>
              <p className="text-[16px] font-black tracking-heading text-green">
                Hozir ochiq
                {partner.hours?.to && (
                  <span className="ml-1.5 text-[13.5px] font-semibold tracking-normal text-green-bright">
                    · {partner.hours.to} gacha
                  </span>
                )}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Restoran aksiya bannerlari (/promotions/promos/) */}
      {banners.length > 0 && (
        <div className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="relative aspect-[2/1] w-[86%] shrink-0 snap-start overflow-hidden rounded-tile border border-line sm:w-[60%]"
            >
              <SafeImage src={b.image} alt={b.title ?? "Aksiya"} sizes="(max-width: 640px) 86vw, 460px" />
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
