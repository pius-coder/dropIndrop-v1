"use client";

import { Moon, Sun, MessageCircle } from "lucide-react";

interface MobileHeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export function MobileHeader({ theme, setTheme }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground font-wear-tear">
            drop-In-drop
          </span>
        </div>

        <div className="flex items-center gap-2">
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
    </header>
  );
}
