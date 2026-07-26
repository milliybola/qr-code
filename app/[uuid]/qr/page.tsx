import { notFound } from "next/navigation";
import { fetchPartner } from "@/lib/api";
import QrPoster from "./QrPoster";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

export default async function QrPage({ params }: PageProps) {
  const { uuid } = await params;
  const partner = await fetchPartner(uuid);

  if (!partner) {
    notFound();
  }

  return <QrPoster uuid={uuid} name={partner.name} banner={partner.banner} />;
}
