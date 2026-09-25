import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "@/styles/globals.css";
import { Nav } from "@/components/Nav/Nav";
import { Footer } from "@/components/Footer/Footer";
import { CustomCursor } from "@/components/Cursor/CustomCursor";
import { OverlaysLoader } from "@/components/OverlaysLoader";
import { availableDishImages } from "@/lib/dish-images";
import { restaurantJsonLd } from "@/lib/jsonld";
import { restaurant } from "@/lib/menu";
import { cn } from "@/lib/cn";
import { SITE_URL } from "@/lib/site";

const TITLE = "Natraj Indian Cuisine — Culpeper, VA";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-fraunces",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: `${restaurant.tagline}. Order pickup from ${restaurant.address.line1.split(",")[0]}.`,
  openGraph: {
    title: TITLE,
    description: restaurant.tagline,
    siteName: restaurant.name,
    locale: "en_US",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: restaurant.name }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: restaurant.tagline, images: ["/og.jpg"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(fraunces.variable, instrumentSans.variable)}>
      <body className="font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-red focus:px-4 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <OverlaysLoader available={availableDishImages()} />
        <CustomCursor />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd(SITE_URL)) }}
        />
      </body>
    </html>
  );
}
