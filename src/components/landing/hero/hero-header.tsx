"use client";

import { LandingHeader } from "../landing-header";

interface HeroHeaderProps {
  showHeader: boolean;
  mode: "client" | "vendor";
  setMode: (mode: "client" | "vendor") => void;
}

export function HeroHeader({ showHeader, mode, setMode }: HeroHeaderProps) {
  if (!showHeader) return null;

  return <LandingHeader mode={mode} setMode={setMode} />;
}
