import type { Metadata } from "next";
import { Montserrat, Roboto_Condensed } from "next/font/google";
import { Suspense } from "react";
import "sileo/styles.css";
import "../styles/globals.css";
import { publicEnv } from "../config/env";
import layoutStyles from "../styles/layout.module.css";
import { TrafficTracker } from "../ui/components/layout/TrafficTracker";
import { Footer } from "../ui/components/layout/navigation/Footer";
import { NavBar } from "../ui/components/layout/navigation/NavBar";
import { ToastViewport } from "../ui/components/layout/ToastViewport";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const montserrat = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: "Simulactic | Interactive Galaxy Simulator",
    template: "%s | Simulactic",
  },
  description:
    "Simulactic is an interactive galaxy simulation platform where users create galaxies, explore systems in 3D, and track growth through personal and admin dashboards.",
  keywords: [
    "galaxy simulator",
    "3d space simulation",
    "astronomy app",
    "procedural galaxies",
    "simulactic",
  ],
  openGraph: {
    title: "Simulactic | Interactive Galaxy Simulator",
    description:
      "Create your own galaxies, explore systems in 3D, and follow your simulation growth with a full dashboard experience.",
    type: "website",
    locale: "en_US",
    siteName: "Simulactic",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulactic | Interactive Galaxy Simulator",
    description:
      "Create, explore, and manage galaxies in an immersive 3D simulation platform.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${robotoCondensed.variable} ${montserrat.variable}`}>
        <Suspense fallback={null}>
          <NavBar />
        </Suspense>
        <Suspense fallback={null}>
          <TrafficTracker />
        </Suspense>
        <ToastViewport />
        <main className={layoutStyles.appShell}>{children}</main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
