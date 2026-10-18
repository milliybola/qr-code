"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Wordmark from "@/components/Wordmark";
import SafeImage from "@/components/SafeImage";
import ApiGap from "@/components/ApiGap";

export default function QrPoster({
  uuid,
  name,
  logo,
  menuUrl: fixedUrl,
}: {
  uuid: string;
  name: string;
  logo?: string;
  menuUrl?: string;
}) {
  const [menuUrl, setMenuUrl] = useState(fixedUrl ?? "");

  useEffect(() => {
    if (!fixedUrl) setMenuUrl(`${window.location.origin}/${uuid}`);
  }, [uuid, fixedUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 print:p-0">
      <div className="card flex w-full max-w-sm flex-col items-center p-8 print:border-0">
        <Wordmark size={20} />
        {logo && (
          <div className="relative mt-5 h-20 w-20 overflow-hidden rounded-[22px] border border-line">
            <SafeImage src={logo} alt={name} sizes="80px" priority iconSize={28} />
          </div>
        )}
        <h1 className="mt-4 text-center text-[26px] font-black leading-tight tracking-heading text-ink">{name}</h1>
        <p className="mt-1 text-[14px] font-semibold text-green">QR menyu</p>

        <div className="mt-6 rounded-tile border border-line bg-white p-4">
          {menuUrl ? (
            <QRCodeSVG value={menuUrl} size={232} level="M" marginSize={0} />
          ) : (
            <div className="skeleton h-[232px] w-[232px] rounded-lg" />
          )}
        </div>

        <p className="mt-5 max-w-xs text-center text-[14px] text-muted">
          Menyuni ko&apos;rish uchun QR-kodni telefon kamerasi bilan skaner qiling
        </p>
        <p className="mt-2 break-all text-center text-[11px] text-faint">{menuUrl}</p>
        <div className="mt-2 print:hidden">
          <ApiGap title="Stol raqami QR'da yo'q: har bir stol uchun alohida QR (?table=<id>) backendda stol modeli kerak — API_GAPS.md #2" label="stol" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="mt-6 rounded-card bg-ink px-6 py-3.5 text-[15px] font-extrabold text-white print:hidden"
      >
        Chop etish
      </button>
    </div>
  );
}
