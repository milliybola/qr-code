import Link from "next/link";
import StatusScreen from "@/components/StatusScreen";
import { IconPlate } from "@/components/Icons";

export default function NotFound() {
  return (
    <StatusScreen
      icon={<IconPlate size={36} />}
      title="Sahifa topilmadi"
      text="Bunday sahifa yo'q. Menyuni ochish uchun stoldagi QR-kodni skaner qiling."
    >
      <Link href="/" className="rounded-card bg-ink py-3.5 text-[15px] font-extrabold text-white">
        Bosh sahifa
      </Link>
    </StatusScreen>
  );
}
