"use client";

import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ui/theme-provider";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { contentConfig } from "./content";

interface LandingHeaderProps {
  mode: "client" | "vendor";
  setMode: (mode: "client" | "vendor") => void;
}

export function LandingHeader({ mode, setMode }: LandingHeaderProps) {
  const { theme, setTheme } = useTheme();
  const content = contentConfig[mode];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Badge variant="secondary">{content.badge}</Badge>
          <div className="flex items-center gap-4">
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
        </div>
      </div>
    </header>
  );
}
