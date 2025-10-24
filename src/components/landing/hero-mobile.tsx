"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardIcon,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ShoppingCart,
  Users,
  Zap,
  Globe,
  MessageCircle,
  Moon,
  Sun,
} from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Logo } from "./logo";
import { contentConfig } from "./content";
import { PartnersSection } from "./hero/partners-section";

export function HeroMobile() {
  const [mode, setMode] = useState<"client" | "vendor">("client");
  const { theme, setTheme } = useTheme();
  const content = contentConfig[mode];

  // Apply theme classes based on mode
  const themeClasses = mode === "client" ? "client-theme" : "vendor-theme";

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-background via-background to-muted ${themeClasses} ${theme}`}
    >
      {/* Mobile Header - Simplified */}
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
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 hover:text-primary transition-colors"
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

      {/* Mobile Hero Section */}
      <section className="px-4 py-8">
        <div className="text-center">
          {/* Mode Toggle - Mobile optimized */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1 mb-6 mx-auto max-w-xs">
            <button
              onClick={() => setMode("vendor")}
              className={`flex-1 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                mode === "vendor"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              🏪 Vendeur
            </button>
            <button
              onClick={() => setMode("client")}
              className={`flex-1 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                mode === "client"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              🛒 Client
            </button>
          </div>

          {/* Badge */}
          <Badge variant="secondary" className="mb-4 text-sm">
            {content.badge}
          </Badge>

          {/* Title with Typewriter */}
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
            <TypeAnimation
              sequence={[content.title[0], 2000, content.title[1], 2000]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="block"
            />
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-muted-foreground mb-8 max-w-sm mx-auto">
            {content.subtitle}
          </p>

          {/* CTA Buttons - Stacked on mobile */}
          <div className="space-y-3 mb-8">
            <Button
              size="lg"
              className="w-full text-base py-3 hover:text-primary"
            >
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
              className="w-full text-base py-3 hover:text-primary"
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

          {/* Mobile Animation */}
          <div className="mb-8">
            <div className="relative h-64 w-full max-w-sm mx-auto">
              <DotLottieReact src="hero-animation.lottie" loop autoplay />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Features Section */}
      <section className="px-4 py-8 bg-background">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-3 text-foreground">
              {content.features.title}
            </h2>
            <p className="text-muted-foreground">{content.features.subtitle}</p>
          </div>

          {/* Features Grid - 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-4">
            {content.features.items.map((feature, index) => (
              <Card key={index} className="group">
                <CardHeader className="pb-3">
                  <CardIcon className="group-hover:scale-110 transition-transform duration-200 w-8 h-8">
                    {feature.icon === "MessageCircle" && (
                      <MessageCircle className="w-4 h-4" />
                    )}
                    {feature.icon === "ShoppingCart" && (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    {feature.icon === "Users" && <Users className="w-4 h-4" />}
                    {feature.icon === "Zap" && <Zap className="w-4 h-4" />}
                    {feature.icon === "Globe" && <Globe className="w-4 h-4" />}
                    {feature.icon === "CheckCircle" && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </CardIcon>
                  <CardTitle className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground leading-tight">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile How It Works */}
      <section className="px-4 py-8 bg-muted/50">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-3 text-foreground">
              {content.howItWorks.title}
            </h2>
            <p className="text-muted-foreground">
              {content.howItWorks.subtitle}
            </p>
          </div>

          {/* Steps - Vertical stack on mobile */}
          <div className="space-y-4">
            {content.howItWorks.steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-background rounded-lg p-4"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">
                    {step.number}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile CTA Section */}
      <section className="px-4 py-8 bg-card">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            {content.cta.title}
          </h2>
          <p className="text-muted-foreground mb-6">{content.cta.subtitle}</p>

          <div className="space-y-3">
            <Button
              size="lg"
              variant="secondary"
              className="w-full text-base py-3 hover:text-primary"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {content.cta.primaryButton}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full text-base py-3 hover:text-primary"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {content.cta.secondaryButton}
            </Button>
          </div>
        </div>
      </section>

      {/* Mobile Partners Section */}
      <PartnersSection mode={mode} />

      {/* Mobile Footer */}
      <footer className="bg-card relative border-t border-border text-card-foreground px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo />
              </div>
              <p className="text-sm text-muted-foreground">
                {content.footer.description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground text-sm">
                Produit
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    Tarifs
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground text-sm">
                Entreprise
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    À propos
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    Carrières
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground text-sm">
                Légal
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    Confidentialité
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors text-sm"
                  >
                    RGPD
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mb-6 font-wear-tear font-thin text-muted-foreground">
            <span className="font-wear-tear text-4xl text-foreground">
              DROP IN DROP
            </span>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex justify-center space-x-6 mb-4">
              <a
                href="/coming-soon"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-6 h-6" />
              </a>
              <a
                href="/coming-soon"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a
                href="/coming-soon"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
            </div>
            <div className="text-center text-muted-foreground text-sm">
              <p>
                &copy; {new Date().getFullYear()} drop-In-drop. Tous droits
                réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
