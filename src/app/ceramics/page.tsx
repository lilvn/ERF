import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ceramics | ERF WORLD",
  description: "ERF WORLD ceramics studio and pottery",
};

export default function CeramicsPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="absolute top-0 left-0 right-0 pt-20 z-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-center">CERAMICS</h1>
      </header>
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
}

