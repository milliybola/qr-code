import type { Metadata } from "next";
import { Outfit, Satisfy } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const satisfy = Satisfy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-satisfy",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://milliyapp.uz"),
  title: "MilliyGo — QR menyu",
  description: "Restoran menyusini QR-kod orqali ko'ring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className={`${outfit.variable} ${satisfy.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
