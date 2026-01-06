import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studios | ERF WORLD",
  description: "ERF WORLD studio spaces and facilities",
};

export default function StudiosPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="absolute top-0 left-0 right-0 pt-20 z-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-center">STUDIOS</h1>
      </header>
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );
}
