/** 30000 → "30 000" (superapp formatSum bilan bir xil; locale'ga bog'liq emas — SSR/CSR bir xil) */
export function formatSum(value: number): string {
  const n = Math.round(Number(value) || 0);
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return n < 0 ? `-${s}` : s;
}

export function formatPrice(value: number): string {
  return `${formatSum(value)} so'm`;
}

/** NEXT_PUBLIC_SHOW_API_GAPS — standart: true. "false"/"0" bo'lsa ApiGap belgilari yashiriladi. */
export const SHOW_API_GAPS = !["false", "0", "off", "no"].includes(
  (process.env.NEXT_PUBLIC_SHOW_API_GAPS ?? "true").toLowerCase()
);
