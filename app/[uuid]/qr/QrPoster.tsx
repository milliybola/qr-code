"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QrPoster({
  uuid,
  name,
  banner,
}: {
  uuid: string;
  name: string;
  banner?: string;
}) {
  const [menuUrl, setMenuUrl] = useState("");

  useEffect(() => {
    setMenuUrl(`${window.location.origin}/${uuid}`);
  }, [uuid]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8 print:p-0">
      <div className="milliy-ikat-strip h-2 w-64" />

      <div className="mt-6 flex flex-col items-center rounded-3xl border-2 border-milliy-gold/40 p-10 shadow-lg print:border-0 print:shadow-none">
        {banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner}
            alt={name}
            className="mb-4 h-20 w-20 rounded-full object-cover"
          />
        )}
        <h1 className="text-center text-2xl font-bold text-milliy-text">{name}</h1>
        <p className="mt-1 font-script text-2xl text-milliy-blue">MilliyGo menyu</p>

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-inner ring-1 ring-black/5">
          {menuUrl && <QRCodeSVG value={menuUrl} size={240} />}
        </div>

        <p className="mt-6 max-w-xs text-center text-sm text-milliy-text/70">
          Menyuni ko&apos;rish uchun QR-kodni telefon kamerasi bilan skaner
          qiling
        </p>
      </div>

      <button
        onClick={() => window.print()}
        className="mt-8 rounded-full bg-milliy-gold px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-milliy-gold-hover print:hidden"
      >
        Chop etish
      </button>
    </div>
  );
}
