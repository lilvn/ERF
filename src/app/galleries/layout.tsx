import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galleries | ERF WORLD",
  description: "Explore ERF WORLD art galleries in immersive 3D",
};

export default function GalleriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

