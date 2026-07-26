import Link from "next/link";

export default function NotFound() {
  return (
    <div className="milliy-girih-bg flex min-h-screen flex-col items-center justify-center bg-milliy-cream px-6 text-center">
      <h1 className="font-script text-5xl text-milliy-blue">MilliyGo</h1>
      <p className="mt-6 text-xl font-semibold text-milliy-text">
        Bu restoran topilmadi
      </p>
      <p className="mt-2 max-w-sm text-milliy-text/70">
        QR-kod noto&apos;g&apos;ri yoki restoran hozircha mavjud emas bo&apos;lishi
        mumkin.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-milliy-gold px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-milliy-gold-hover"
      >
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
