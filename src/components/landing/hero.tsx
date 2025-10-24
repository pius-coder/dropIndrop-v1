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
} from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import { useState, useEffect } from "react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Logo } from "./logo";
import { contentConfig } from "./content";
import { LandingHeader } from "./landing-header";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import { PartnersSection } from "./hero/partners-section";

export function Hero() {
  const [mode, setMode] = useState<"client" | "vendor">("client");
  const [showHeader, setShowHeader] = useState(false);
  const { theme, setTheme } = useTheme();
  const content = contentConfig[mode];

  // Apply theme classes based on mode
  const themeClasses = mode === "client" ? "client-theme" : "vendor-theme";

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector(
        "#hero-section"
      ) as HTMLElement;
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        setShowHeader(window.scrollY > heroBottom);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`bg-gradient-to-br space-y-18 mx-auto from-background via-background to-muted ${themeClasses} ${theme}`}
    >
      {/* Header - shows when scrolled past hero section */}
      {showHeader && <LandingHeader mode={mode} setMode={setMode} />}
      {/* Hero Section */}
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
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 hover:text-primary transition-colors"
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
            <Button size="lg" className="text-lg px-8 py-3 hover:text-primary">
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
              className="text-lg text-foreground px-8 py-3 hover:text-primary"
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
      {/* Features Section */}
      <section
        id="features"
        className="bg-background container h-[calc(100vh-72px)] mx-auto px-4 py-16 justify-center items-center flex flex-col"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              {content.features.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {content.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.features.items.map((feature, index) => (
              <Card key={index} className="group">
                <CardHeader className="pb-4">
                  <CardIcon className="group-hover:scale-110 transition-transform duration-200">
                    {feature.icon === "MessageCircle" && (
                      <MessageCircle className="w-6 h-6" />
                    )}
                    {feature.icon === "ShoppingCart" && (
                      <ShoppingCart className="w-6 h-6" />
                    )}
                    {feature.icon === "Users" && <Users className="w-6 h-6" />}
                    {feature.icon === "Zap" && <Zap className="w-6 h-6" />}
                    {feature.icon === "Globe" && <Globe className="w-6 h-6" />}
                    {feature.icon === "CheckCircle" && (
                      <CheckCircle className="w-6 h-6" />
                    )}
                  </CardIcon>
                  <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section
        id="how-it-works"
        className="bg-muted/50 container h-[calc(100vh-72px)] border border-border mx-auto px-4 py-16 justify-center items-center flex flex-col"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              {content.howItWorks.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {content.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {content.howItWorks.steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section
        id="pricing"
        className="bg-card text-card-foreground border-y border-border h-[calc(100vh-72px)] w-full  justify-center items-center flex flex-col"
      >
        <div className="px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            {content.cta.title}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            {content.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-3 hover:text-primary"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {content.cta.primaryButton}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 hover:text-primary"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {content.cta.secondaryButton}
            </Button>
          </div>
        </div>
      </section>
      {/* Partners Section */}
      <PartnersSection mode={mode} />
      {/* Footer */}
      <footer className="bg-card relative border-t border-border text-card-foreground py-12">
        <div className="container bottom-0 mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo />
              </div>
              <p className="text-muted-foreground">
                {content.footer.description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Produit</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors"
                  >
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors"
                  >
                    Tarifs
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Entreprise</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors"
                  >
                    À propos
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors"
                  >
                    Carrières
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Légal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors"
                  >
                    Confidentialité
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors"
                  >
                    Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="/coming-soon"
                    className="hover:text-primary transition-colors"
                  >
                    RGPD
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center font-wear-tear font-thin text-muted-foreground">
            <span className="font-wear-tear text-[200px] text-foreground">
              DROP IN DROP
            </span>
          </div>
          <div className="border-t border-border mt-8 pt-8">
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
            <div className="text-center text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()} drop-In-drop. Tous droits
                réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>{" "}
    </div>
  );
}
