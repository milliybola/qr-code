import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-2">
        <Link href="/" className="font-script text-3xl text-milliy-blue">
          MilliyGo
        </Link>
      </div>
      <div className="milliy-ikat-strip h-1.5 w-full" />
    </header>
  );
}
