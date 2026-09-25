import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant, Jost, Noto_Serif_Devanagari } from "next/font/google";
import "@/styles/globals.css";
import { site } from "@/config/site";
import { SITE_URL } from "@/lib/site-url";
import { restaurantJsonLd } from "@/lib/jsonld";
import { availableDishImages } from "@/lib/dish-images";
import { cn } from "@/lib/cn";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Effects } from "@/components/fx/Effects";
import { Cursor } from "@/components/fx/Cursor";
import { ClientShell } from "@/components/layout/ClientShell";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

const devanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["500"],
  variable: "--font-np",
  display: "swap",
  preload: false,
});

const INTRO_GATE =
  "try{if(localStorage.getItem('8848-intro-seen')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('intro-seen')}catch(e){}";

const TITLE = `${site.fullName} · Harrisonburg, VA`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.fullName,
  openGraph: {
    title: TITLE,
    description: site.description,
    siteName: site.fullName,
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#17110d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(cormorant.variable, cinzel.variable, jost.variable, devanagari.variable)} suppressHydrationWarning>
      <body>
        {/* Before first paint: skip the intro on return visits and for reduced motion. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brass focus:px-4 focus:py-2 focus:text-choc"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <ClientShell available={availableDishImages()} />
        <Effects />
        <Cursor />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd(SITE_URL)) }} />
      </body>
    </html>
  );
}
