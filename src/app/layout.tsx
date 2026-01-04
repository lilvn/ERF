import type { Metadata } from "next";
import { ThemeProvider } from "@/context/ThemeContext";
import { Menu } from "@/components/Menu";
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
          <Menu />
          <main id="main-content" className="relative min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
