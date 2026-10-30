"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Stol rejimi: QR havolasi `/<hamkor>?table=<stol uuid>&t=<token>`.
 * Token brauzerdan (har mehmon o'z IP'si bilan) backendda tekshiriladi — sahifaning o'zi keshlanadi (ISR).
 * Natija sessionStorage'da saqlanadi: sahifa yangilansa yoki `?table` olib tashlansa ham stol esdan chiqmaydi.
 */
export type TableState =
  | { status: "none" } // oddiy menyu (stolsiz)
  | { status: "loading" }
  | { status: "ok"; tableUuid: string; token: string; name: string; filialName: string | null }
  | { status: "invalid" } // QR yaroqsiz yoki eskirgan (QR yangilangan, stol o'chirilgan, token buzilgan)
  | { status: "disabled" }; // restoran tarifida stol QR menyusi yo'q

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "https://mytizim.uz").replace(/\/+$/, "");

const TableContext = createContext<TableState>({ status: "none" });
export const useTable = () => useContext(TableContext);

const storageKey = (partnerUuid: string) => `qr-table:${partnerUuid}`;

interface Saved {
  tableUuid: string;
  token: string;
}

function readSaved(partnerUuid: string): Saved | null {
  try {
    const raw = sessionStorage.getItem(storageKey(partnerUuid));
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function writeSaved(partnerUuid: string, v: Saved | null) {
  try {
    if (v) sessionStorage.setItem(storageKey(partnerUuid), JSON.stringify(v));
    else sessionStorage.removeItem(storageKey(partnerUuid));
  } catch {
    /* private mode: stol faqat shu sahifa uchun */
  }
}

export default function TableProvider({ partnerUuid, children }: { partnerUuid: string; children: React.ReactNode }) {
  const [state, setState] = useState<TableState>({ status: "none" });

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const fromUrl = q.get("table") && q.get("t") ? { tableUuid: q.get("table")!, token: q.get("t")! } : null;
    const saved = fromUrl ?? readSaved(partnerUuid);
    if (!saved) return; // stolsiz menyu

    const ctrl = new AbortController();
    setState({ status: "loading" });
    fetch(`${API_BASE}/partner/tables/public/${encodeURIComponent(saved.tableUuid)}/?t=${encodeURIComponent(saved.token)}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (res.ok && body?.data?.partner?.uuid === partnerUuid) {
          writeSaved(partnerUuid, saved);
          setState({
            status: "ok",
            tableUuid: saved.tableUuid,
            token: saved.token,
            name: body.data.table.name,
            filialName: body.data.table.filial_name ?? null,
          });
        } else if (res.status === 403 && body?.code === "QR_NOT_ENABLED") {
          writeSaved(partnerUuid, null);
          setState({ status: "disabled" });
        } else if (res.status === 404 || res.ok) {
          // 404 — QR yaroqsiz; 200 lekin boshqa restoran — begona QR
          writeSaved(partnerUuid, null);
          setState({ status: "invalid" });
        } else {
          // Tarmoq/5xx: QR'ni yaroqsiz deb e'lon qilmaymiz, oddiy menyu ko'rsatamiz
          setState({ status: "none" });
        }
      })
      .catch((e) => {
        if (e?.name !== "AbortError") setState({ status: "none" });
      });
    return () => ctrl.abort();
  }, [partnerUuid]);

  const value = useMemo(() => state, [state]);
  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}
