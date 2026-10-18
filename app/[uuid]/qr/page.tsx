import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchPartner } from "@/lib/api";
import QrPoster from "./QrPoster";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

export const metadata: Metadata = { robots: { index: false } };

export default async function QrPage({ params }: PageProps) {
  const { uuid } = await params;
  const partner = await fetchPartner(uuid);
  if (!partner) notFound();

  // QR manzili env'dan (chop etiladigan poster ishlab chiqarish domeniga ishora qilishi shart);
  // bo'lmasa klientda window.location.origin ishlatiladi.
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  return (
    <QrPoster
      uuid={partner.uuid}
      name={partner.name}
      logo={partner.logo}
      menuUrl={base ? `${base}/${partner.uuid}` : undefined}
    />
  );
}
