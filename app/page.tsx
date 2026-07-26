import FooterAd from "@/components/FooterAd";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-milliy-cream">
      <div className="milliy-ikat-strip h-2 w-full" />

      <section className="milliy-girih-bg flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="font-script text-6xl text-milliy-blue sm:text-7xl">MilliyGo</h1>
        <p className="mt-4 max-w-md text-milliy-text/80">
          Restoran va kafelarning QR-menyusini ko&apos;rish uchun stoldagi
          QR-kodni telefoningiz kamerasi bilan skaner qiling.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-milliy-gold/40 bg-white px-5 py-2 text-sm text-milliy-text/70 shadow-sm">
          📷 QR-kodni skaner qilib, menyuga o&apos;ting
        </div>
      </section>

      <FooterAd />
    </main>
  );
}
