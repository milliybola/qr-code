const PLAY_MARKET_URL =
  "https://play.google.com/store/apps/details?id=uz.milliyapp.milliygo";
const TELEGRAM_URL = "https://t.me/milliygo_app";
const INSTAGRAM_URL = "https://www.instagram.com/milliyapp/";
const PHONE_DISPLAY = "+998 90 496 90 07";
const PHONE_HREF = "tel:+998904969007";
const EMAIL = "info@milliyapp.uz";
const WEBSITE_DISPLAY = "milliyapp.uz";
const WEBSITE_URL = "https://milliyapp.uz";

export default function FooterAd() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-10 overflow-hidden bg-milliy-blue text-white">
      <div className="milliy-ikat-strip h-2 w-full" />
      <div className="milliy-girih-bg absolute inset-0 opacity-[0.05]" />

      <div className="relative mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-center text-xl font-bold sm:text-2xl">
          Bu va yana <span className="text-milliy-gold-hover">50+</span> restorandan
          buyurtma bering — <span className="font-script text-2xl sm:text-3xl">MilliyGo</span> ilovasida!
        </h2>

        <div className="mt-6 flex justify-center">
          <a
            href={PLAY_MARKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-2xl bg-black px-6 py-3 shadow-lg transition hover:bg-black/80"
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
              <path d="M3 20.5V3.5c0-.6.31-1.12.78-1.43L13.5 12 3.78 21.93c-.47-.31-.78-.83-.78-1.43zM16.81 15.12 6.05 21.34l8.49-8.49 2.27 2.27zM20.16 10.81c.5.29.84.83.84 1.19s-.34.9-.84 1.19l-2.6 1.51-2.47-2.47V12l2.47-2.47 2.6 1.28zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z" />
            </svg>
            <span className="text-left leading-tight">
              <span className="block text-[10px] text-gray-300">Yuklab oling</span>
              <span className="block text-base font-semibold">Google Play</span>
            </span>
          </a>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <a href={PHONE_HREF} className="flex flex-col items-center gap-1 hover:text-milliy-gold-hover">
            <span>📞</span>
            {PHONE_DISPLAY}
          </a>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 hover:text-milliy-gold-hover"
          >
            <span>✈️</span>
            Telegram
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 hover:text-milliy-gold-hover"
          >
            <span>📷</span>
            Instagram
          </a>
          <a href={`mailto:${EMAIL}`} className="flex flex-col items-center gap-1 hover:text-milliy-gold-hover">
            <span>✉️</span>
            {EMAIL}
          </a>
        </div>

        <div className="mt-6 text-center">
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-milliy-gold-hover underline underline-offset-2"
          >
            {WEBSITE_DISPLAY}
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-white/60">
          © {year} MilliyGo. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
}
