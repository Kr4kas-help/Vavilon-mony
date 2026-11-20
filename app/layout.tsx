import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Tinos, Onest } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const serif = Tinos({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Money Wise — из долгов к мечте",
  description:
    "Расскажите о доходе, долгах и целях. Получите понятный план: сколько отдавать, сколько откладывать и когда исполнится желаемое.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#120D08",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
