import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merch | ERF WORLD",
  description: "ERF WORLD Merchandise - Hoodies, T-shirts and more",
};

export default function MerchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

