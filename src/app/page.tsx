import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | ERF WORLD",
  description: "ERF NYC - Seamless 3D Experience",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="absolute top-0 left-0 right-0 pt-20 z-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-center">ERF NYC</h1>
      </header>
    </div>
  );
}
