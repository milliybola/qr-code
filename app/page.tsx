import AppFooter from "@/components/AppFooter";
import Wordmark from "@/components/Wordmark";

export default function HomePage() {
  return (
    <main className="flex min-h-[100svh] flex-col bg-white">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center px-4">
        <Wordmark size={19} />
      </div>
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-10">
        <div className="girih-bg h-40 w-full rounded-tile" aria-hidden />
        <h1 className="h-display mt-6 text-[32px] leading-[1.1]">Restoran menyusi — telefoningizda</h1>
        <p className="mt-3 max-w-md text-[15.5px] text-muted">
          Menyuni ko&apos;rish uchun stoldagi QR-kodni telefoningiz kamerasi bilan skaner qiling.
        </p>
        <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-green-soft px-4 py-2 text-[14px] font-bold text-green">
          QR-kodni skaner qiling → menyu ochiladi
        </div>
      </section>
      <AppFooter compact />
    </main>
  );
}
