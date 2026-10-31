import type { Metadata } from "next";
import { Great_Vibes, Jost, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const script = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Jewellery Store — Classic Jewellery Collection",
  description: "Elegant jewellery for every story. Guest checkout via WhatsApp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${script.variable} ${display.variable} ${sans.variable}`}>
      <body>
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
