import Wordmark from "./Wordmark";

/** Bo'sh / xato / topilmadi holatlari uchun umumiy ekran */
export default function StatusScreen({
  icon,
  title,
  text,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-[100svh] flex-col bg-white px-4">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center">
        <Wordmark size={19} />
      </div>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center pb-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-chip text-muted">{icon}</div>
        <h1 className="mt-5 text-[24px] font-black leading-tight tracking-heading text-ink">{title}</h1>
        <p className="mt-2 text-[15px] text-muted">{text}</p>
        {children && <div className="mt-7 flex w-full flex-col gap-2.5">{children}</div>}
      </div>
    </main>
  );
}
