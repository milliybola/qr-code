import Wordmark from "./Wordmark";

const PLAY_MARKET_URL = "https://play.google.com/store/apps/details?id=uz.milliyapp.milliygo";
const TELEGRAM_URL = "https://t.me/milliygo_app";
const INSTAGRAM_URL = "https://www.instagram.com/milliyapp/";
const PHONE_DISPLAY = "+998 90 496 90 07";
const PHONE_HREF = "tel:+998904969007";
const WEBSITE_URL = "https://milliyapp.uz";

export default function AppFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`mx-auto max-w-3xl px-4 ${compact ? "pb-8" : "pb-40"}`}>
      <div className="card overflow-hidden">
        <div className="girih-bg h-3 w-full" aria-hidden />
        <div className="p-5">
          <Wordmark size={22} />
          <p className="mt-2 text-[17px] font-black leading-snug tracking-heading text-ink">
            Uyga yetkazib berish va olib ketish — MilliyGo ilovasida
          </p>
          <p className="mt-1 text-[13.5px] text-muted">Shu va boshqa restoranlardan ilova orqali buyurtma bering.</p>

          <a
            href={PLAY_MARKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-3 rounded-card bg-ink px-4 py-2.5 text-white active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
              <path d="M3 20.5V3.5c0-.6.31-1.12.78-1.43L13.5 12 3.78 21.93c-.47-.31-.78-.83-.78-1.43zM16.81 15.12 6.05 21.34l8.49-8.49 2.27 2.27zM20.16 10.81c.5.29.84.83.84 1.19s-.34.9-.84 1.19l-2.6 1.51-2.47-2.47V12l2.47-2.47 2.6 1.28zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z" />
            </svg>
            <span className="text-left leading-tight">
              <span className="block text-[10.5px] text-white/70">Yuklab oling</span>
              <span className="block text-[15px] font-extrabold">Google Play</span>
            </span>
          </a>

          <div className="mt-5 flex flex-wrap gap-2 text-[13px] font-semibold">
            <a href={PHONE_HREF} className="rounded-full bg-chip px-3 py-1.5 text-ink-2">
              {PHONE_DISPLAY}
            </a>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="rounded-full bg-chip px-3 py-1.5 text-ink-2">
              Telegram
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="rounded-full bg-chip px-3 py-1.5 text-ink-2">
              Instagram
            </a>
            <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="rounded-full bg-chip px-3 py-1.5 text-ink-2">
              milliyapp.uz
            </a>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-[12px] text-faint">© {new Date().getFullYear()} MilliyGo</p>
    </footer>
  );
}
