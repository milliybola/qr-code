import type { CallKind, TableCall } from "./tableApi";

const latest = (calls: TableCall[], kind: CallKind) => [...calls].reverse().find((c) => c.kind === kind);

/** Mehmonga ko'rsatiladigan holat matni: "Ofitsiant chaqirildi — kuting" / "Ofitsiant keladi · Ali". Chaqiruv bo'lmasa null. */
export function callSummary(calls: TableCall[]): string | null {
  const rows = [
    { call: latest(calls, "CALL"), waiting: "Ofitsiant chaqirildi — kuting", taken: "Ofitsiant keladi" },
    { call: latest(calls, "BILL"), waiting: "Hisob so'raldi — kuting", taken: "Ofitsiant hisob bilan keladi" },
  ];
  // Avval kutilayotganlar (xodim hali olmagan), keyin qabul qilinganlar
  const waiting = rows.find((r) => r.call?.status === "PENDING");
  if (waiting) return waiting.waiting;
  const taken = rows.find((r) => r.call?.status === "ACKNOWLEDGED");
  if (taken) return taken.call?.handled_by_name ? `${taken.taken} · ${taken.call.handled_by_name}` : taken.taken;
  return null;
}

export const isPending = (calls: TableCall[], kind: CallKind) => latest(calls, kind)?.status === "PENDING";
