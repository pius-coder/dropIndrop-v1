import { Hero } from "@/components/landing/hero";
import { HeroMobile } from "@/components/landing/hero-mobile";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Desktop Hero - Hidden on mobile */}
      <div className="hidden md:block">
        <Hero />
      </div>

      {/* Mobile Hero - Hidden on desktop */}
      <div className="block md:hidden">
        <HeroMobile />
      </div>
    </main>
  );
}
