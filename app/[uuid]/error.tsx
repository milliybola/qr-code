"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import StatusScreen from "@/components/StatusScreen";
import { IconRefresh } from "@/components/Icons";

/** Backend/tarmoq xatosi (ApiError) — 404 dan farqli, qayta urinish mumkin */
export default function MenuError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      icon={<IconRefresh size={34} />}
      title="Menyuni yuklab bo'lmadi"
      text="Internet aloqasini tekshiring yoki birozdan so'ng qayta urinib ko'ring."
    >
      <button
        type="button"
        onClick={() =>
          // Server komponent xatosi — server ma'lumotini ham qayta so'raymiz
          startTransition(() => {
            router.refresh();
            reset();
          })
        }
        className="rounded-card bg-green py-3.5 text-[15px] font-extrabold text-white active:scale-[0.99]"
      >
        Qayta urinish
      </button>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-card bg-chip py-3.5 text-[15px] font-bold text-ink"
      >
        Sahifani yangilash
      </button>
    </StatusScreen>
  );
}
