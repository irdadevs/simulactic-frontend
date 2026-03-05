import type { Metadata } from "next";
import { Montserrat, Roboto_Condensed } from "next/font/google";
import "../styles/globals.css";
import styles from "../styles/skeleton.module.css";
import { NavBar } from "../ui/components/layout/navigation/NavBar";

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
        <main className={styles.appShell}>{children}</main>
      </body>
    </html>
  );
}
