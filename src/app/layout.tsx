import type { Metadata } from "next";
import { Montserrat, Roboto_Condensed } from "next/font/google";
import "sileo/styles.css";
import "../styles/globals.css";
import layoutStyles from "../styles/layout.module.css";
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
  title: "Simulactic Frontend",
  description: "Frontend skeleton with auth and galaxy dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${robotoCondensed.variable} ${montserrat.variable}`}>
        <NavBar />
        <ToastViewport />
        <main className={layoutStyles.appShell}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
