import type { Metadata } from "next";
import { ThemeProvider } from "@/context/ThemeContext";
import { AnaglyphProvider } from "@/context/AnaglyphContext";
import { Menu } from "@/components/Menu";
import { DevControls } from "@/components/DevControls";
import { SVGFilters } from "@/components/SVGFilters";
import { Preloader } from "@/components/Preloader";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERF WORLD",
  description: "Seamless 3D Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          <AnaglyphProvider>
            <Preloader>
              <SVGFilters />
              <Menu />
              <main id="main-content" className="relative min-h-screen">
                {children}
              </main>
              <DevControls />
            </Preloader>
          </AnaglyphProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
