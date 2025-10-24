"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { TypeAnimation } from "react-type-animation";

interface MobileHeroSectionProps {
  mode: "client" | "vendor";
  setMode: (mode: "client" | "vendor") => void;
  content: any;
}

export function MobileHeroSection({
  mode,
  setMode,
  content,
}: MobileHeroSectionProps) {
  return (
    <section className="px-4 py-8">
      <div className="text-center">
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1 mb-6 mx-auto max-w-xs">
          <button
            onClick={() => setMode("vendor")}
            className={`flex-1 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
              mode === "vendor"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            🏪 Vendeur
          </button>
          <button
            onClick={() => setMode("client")}
            className={`flex-1 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
              mode === "client"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            🛒 Client
          </button>
        </div>

        <Badge variant="secondary" className="mb-4 text-sm">
          {content.badge}
        </Badge>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
          <TypeAnimation
            sequence={[content.title[0], 2000, content.title[1], 2000]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
            className="block"
          />
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-sm mx-auto">
          {content.subtitle}
        </p>

        <div className="space-y-3 mb-8">
          <Button size="lg" className="w-full text-base py-3">
            {content.primaryButton.icon === "ShoppingCart" && (
              <ShoppingCart className="w-5 h-5 mr-2" />
            )}
            {content.primaryButton.icon === "MessageCircle" && (
              <MessageCircle className="w-5 h-5 mr-2" />
            )}
            {content.primaryButton.text}
          </Button>

          <Button size="lg" variant="outline" className="w-full text-base py-3">
            {content.secondaryButton.icon === "ShoppingCart" && (
              <ShoppingCart className="w-5 h-5 mr-2" />
            )}
            {content.secondaryButton.icon === "MessageCircle" && (
              <MessageCircle className="w-5 h-5 mr-2" />
            )}
            {content.secondaryButton.text}
          </Button>
        </div>

        <div className="mb-8">
          <div className="relative h-64 w-full max-w-sm mx-auto">
            <DotLottieReact src="hero-animation.lottie" loop autoplay />
          </div>
        </div>
      </div>
    </section>
  );
}
