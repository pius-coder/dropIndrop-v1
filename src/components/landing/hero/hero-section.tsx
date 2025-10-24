"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MessageCircle, Moon, Sun } from "lucide-react";
import { TypeAnimation } from "react-type-animation";

interface HeroSectionProps {
  mode: "client" | "vendor";
  setMode: (mode: "client" | "vendor") => void;
  theme: string;
  setTheme: (theme: string) => void;
  content: any;
}

export function HeroSection({
  mode,
  setMode,
  theme,
  setTheme,
  content,
}: HeroSectionProps) {
  return (
    <section
      id="hero-section"
      className="container h-[calc(100vh-72px)] mx-auto px-4 py-16 justify-center items-center flex flex-col"
    >
      <div className="text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Badge variant="secondary">{content.badge}</Badge>
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <span
              className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${
                mode === "vendor"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              🏪 Vendeur
            </span>
            <button
              onClick={() => setMode(mode === "client" ? "vendor" : "client")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                mode === "client" ? "bg-primary" : "bg-primary"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  mode === "client" ? "translate-x-1" : "translate-x-6"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${
                mode === "client"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              🛒 Client
            </span>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 text-foreground" />
            )}
          </button>
        </div>
        <div>
          <span className="font-wear-tear text-7xl text-foreground">
            drop In drop
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-foreground">
          <TypeAnimation
            sequence={[content.title[0], 2000, content.title[1], 2000]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
            className="block"
          />
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {content.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8 py-3">
            {content.primaryButton.icon === "ShoppingCart" && (
              <ShoppingCart className="w-5 h-5 mr-2" />
            )}
            {content.primaryButton.icon === "MessageCircle" && (
              <MessageCircle className="w-5 h-5 mr-2" />
            )}
            {content.primaryButton.text}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg text-foreground px-8 py-3"
          >
            {content.secondaryButton.icon === "ShoppingCart" && (
              <ShoppingCart className="w-5 h-5 mr-2" />
            )}
            {content.secondaryButton.icon === "MessageCircle" && (
              <MessageCircle className="w-5 h-5 mr-2" />
            )}
            {content.secondaryButton.text}
          </Button>
        </div>
      </div>
    </section>
  );
}
