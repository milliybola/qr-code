import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchCategories, fetchPartner } from "@/lib/api";
import Header from "@/components/Header";
import RestaurantHero from "@/components/RestaurantHero";
import CategoryNav from "@/components/CategoryNav";
import ProductGrid from "@/components/ProductGrid";
import FooterAd from "@/components/FooterAd";
import StickyOrderButton from "@/components/StickyOrderButton";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uuid } = await params;
  const partner = await fetchPartner(uuid);

  if (!partner) {
    return { title: "Topilmadi — MilliyGo" };
  }

  return {
    title: `${partner.name} — MilliyGo menyu`,
    description: partner.description ?? `${partner.name} menyusi MilliyGo orqali`,
    openGraph: partner.banner
      ? { images: [{ url: partner.banner }], title: partner.name }
      : undefined,
  };
}

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { uuid } = await params;
  const [partner, categories] = await Promise.all([
    fetchPartner(uuid),
    fetchCategories(uuid),
  ]);

  if (!partner) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-milliy-cream pb-24">
      <Header />
      <RestaurantHero partner={partner} />

      {categories.length > 0 ? (
        <>
          <CategoryNav categories={categories} />
          <ProductGrid categories={categories} />
        </>
      ) : (
        <div className="mx-auto max-w-5xl px-4 py-16 text-center text-milliy-text/70">
          Hozircha menyu to&apos;ldirilmoqda. Iltimos, birozdan so&apos;ng qayta
          urinib ko&apos;ring.
        </div>
      )}

      <StickyOrderButton />
      <FooterAd />
    </div>
  );
}
