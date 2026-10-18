import { SHOW_API_GAPS } from "@/lib/format";

/**
 * Backendda yetishmayotgan ma'lumot/funksiya belgisi (dashed amber "API" pill).
 * Tafsilotlar va taklif etilgan kontrakt: API_GAPS.md. NEXT_PUBLIC_SHOW_API_GAPS=false — yashiriladi.
 */
export default function ApiGap({
  title,
  label,
  className = "",
}: {
  /** Tooltip: nima yetishmaydi va qaysi endpoint kerak */
  title: string;
  /** Pill ichidagi qo'shimcha matn (ixtiyoriy) */
  label?: string;
  className?: string;
}) {
  if (!SHOW_API_GAPS) return null;
  return (
    <span
      title={title}
      aria-label={`API yetishmaydi: ${title}`}
      data-api-gap=""
      className={`inline-flex shrink-0 cursor-help select-none items-center gap-1 rounded-full border border-dashed border-amber-500 bg-amber-50 px-2 py-0.5 align-middle text-[10.5px] font-extrabold uppercase leading-none tracking-wide text-amber-700 ${className}`}
    >
      API
      {label && <span className="font-semibold normal-case tracking-normal">· {label}</span>}
    </span>
  );
}
