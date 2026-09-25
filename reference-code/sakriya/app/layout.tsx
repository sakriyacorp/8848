import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/Nav";
import CursorLens from "@/components/CursorLens";
import Effects from "@/components/Effects";
import Wordmark from "@/components/Wordmark";

export const metadata: Metadata = {
  metadataBase: new URL("https://sakriya.net"),
  title: "Sakriya — Operator. Investor. Builder.",
  description:
    "Sakriya builds local businesses, real estate, and operating systems — between Kathmandu, Nepal and Virginia, United States.",
  openGraph: {
    title: "Sakriya — Operator. Investor. Builder.",
    description:
      "Building local businesses, real estate, and operating systems — between Kathmandu, Nepal and Virginia, United States.",
    url: "https://sakriya.net",
    type: "website",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="atmos" />
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="grain" />
        <CursorLens />
        <Effects />
        <Nav />
        {children}
        <footer>
          <div className="wordmark-stage">
            <Wordmark />
          </div>
          <div className="cols">
            <a href="mailto:sakriyacorp@gmail.com">sakriyacorp@gmail.com</a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          </div>
          <div>© 2026 Sakriya Adhikari. All rights reserved.</div>
          <div className="sig">KATHMANDU · VIRGINIA</div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
