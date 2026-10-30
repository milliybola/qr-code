"use client";

import { useTable } from "./TableProvider";

/** Menyu tepasidagi stol holati: stol nomi yoki "QR yaroqsiz" ogohlantirishi. Stolsiz menyuda hech narsa chiqmaydi. */
export default function TableBanner() {
  const table = useTable();

  if (table.status === "ok") {
    return (
      <div className="bg-green text-white" role="status">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2 text-[13.5px] font-extrabold">
          <span aria-hidden className="h-2 w-2 rounded-full bg-gold" />
          <span className="truncate">{table.name}</span>
          {table.filialName && <span className="truncate font-semibold opacity-85">· {table.filialName}</span>}
        </div>
      </div>
    );
  }

  if (table.status === "invalid") {
    return (
      <div className="border-b border-amber-300 bg-amber-50 text-amber-900" role="alert">
        <p className="mx-auto max-w-3xl px-4 py-2.5 text-[13px] font-bold leading-snug">
          Bu QR kod yaroqsiz yoki eskirgan. Menyuni ko&apos;rishingiz mumkin, buyurtma uchun ofitsiantga murojaat qiling.
        </p>
      </div>
    );
  }

  return null;
}
