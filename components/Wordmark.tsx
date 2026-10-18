import { MilliyStar } from "./Icons";

export default function Wordmark({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-black tracking-heading text-ink ${className}`}
      style={{ fontSize: size }}
    >
      <MilliyStar size={Math.round(size * 0.7)} className="text-gold" />
      <span>
        Milliy<span className="text-green">Go</span>
      </span>
    </span>
  );
}
