"use client";

const PLAY_MARKET_URL =
  "https://play.google.com/store/apps/details?id=uz.milliyapp.milliygo";

export default function StickyOrderButton() {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <a
        href={PLAY_MARKET_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full bg-milliy-gold px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-milliy-gold-hover"
      >
        📱 Ilovada buyurtma bering
      </a>
    </div>
  );
}
