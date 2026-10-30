import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  attachPromotions,
  fetchMenu,
  fetchPartner,
  fetchPromoBanners,
  fetchPromotions,
  fetchSets,
  type Partner,
} from "@/lib/api";
import RestaurantHero from "@/components/RestaurantHero";
import MenuView from "@/components/MenuView";
import AppFooter from "@/components/AppFooter";
import TableProvider from "@/components/TableProvider";
import TableBanner from "@/components/TableBanner";
import CartProvider from "@/components/CartProvider";
import CartSheet from "@/components/CartSheet";
import OrdersSheet from "@/components/OrdersSheet";
import { MenuBodySkeleton, TopBarSkeleton } from "@/components/Skeletons";
import { IconPlate } from "@/components/Icons";

// ISR: sahifa 60 soniya keshlanadi; backend vaqtincha ishlamasa eski nusxa ko'rsatiladi.
// Eslatma: segment darajasida loading.tsx ATAYIN yo'q — u butun sahifani stream qilib,
// notFound() da ham HTTP 200 qaytarardi. Skelet faqat menyu qismi uchun (Suspense).
export const revalidate = 60;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uuid } = await params;
  const partner = await fetchPartner(uuid).catch(() => null);
  if (!partner) return { title: "Menyu — MilliyGo", robots: { index: false } };

  const image = partner.cover ?? partner.logo;
  return {
    title: `${partner.name} — menyu | MilliyGo`,
    description: partner.description ?? `${partner.name} menyusi — MilliyGo QR menyu`,
    alternates: { canonical: `/${partner.uuid}` },
    openGraph: { title: partner.name, description: partner.description, images: image ? [{ url: image }] : undefined },
  };
}

function loadMenu(uuid: string) {
  return Promise.all([fetchMenu(uuid), fetchSets(uuid), fetchPromotions(uuid), fetchPromoBanners(uuid)]);
}

async function MenuSection({ partner, data }: { partner: Partner; data: ReturnType<typeof loadMenu> }) {
  // fetchMenu xatosi (tarmoq/5xx) shu yerda tashlanadi → error.tsx
  const [menu, sets, promos, banners] = await data;

  const categories = attachPromotions(menu.categories, promos);
  const allSets = sets.length > 0 ? sets : menu.inlineSets;
  const hasPromotions = promos.length > 0 || categories.some((c) => c.products.some((p) => p.promotion));
  const hero = <RestaurantHero partner={partner} banners={banners} />;

  if (categories.length === 0 && allSets.length === 0) {
    return (
      <>
        <TopBarSkeleton loading={false} />
        {hero}
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-chip text-faint">
            <IconPlate size={32} />
          </div>
          <p className="mt-4 text-[18px] font-black tracking-heading text-ink">Hozircha menyu mavjud emas</p>
          <p className="mt-1 text-[14px] text-muted">Restoran menyuni to&apos;ldirmoqda. Ofitsiantdan so&apos;rang.</p>
        </div>
        <AppFooter compact />
      </>
    );
  }

  return (
    <MenuView
      restaurantName={partner.name}
      logo={partner.logo}
      categories={categories}
      sets={allSets}
      hasPromotions={hasPromotions}
      hero={hero}
      footer={<AppFooter />}
    />
  );
}

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { uuid } = await params;

  // Menyu so'rovlari restoran bilan parallel boshlanadi (fetch'lar Next data cache'da 60s)
  const data = loadMenu(uuid);
  data.catch(() => {}); // notFound() bo'lsa "unhandled rejection" chiqmasin

  const partner = await fetchPartner(uuid);
  if (!partner) notFound();

  return (
    <TableProvider partnerUuid={partner.uuid}>
    <CartProvider>
    <div className="min-h-screen bg-white">
      <TableBanner />
      <Suspense
        fallback={
          <>
            <TopBarSkeleton />
            <RestaurantHero partner={partner} banners={[]} />
            <MenuBodySkeleton />
          </>
        }
      >
        <MenuSection partner={partner} data={data} />
      </Suspense>
    </div>
    <CartSheet />
    <OrdersSheet />
    </CartProvider>
    </TableProvider>
  );
}
