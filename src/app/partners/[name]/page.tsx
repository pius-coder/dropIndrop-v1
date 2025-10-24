import { notFound } from "next/navigation";
import { contentConfig } from "@/components/landing/content";
import { Logo } from "@/components/landing/logo";
import { Plus } from "lucide-react";
import Image from "next/image";

interface PartnerPageProps {
  params: {
    name: string;
  };
}

export default function PartnerPage({ params }: PartnerPageProps) {
  // Find partner data from content config
  const partner =
    contentConfig.client.partners?.items.find((p) => p.name === params.name) ||
    contentConfig.vendor.partners?.items.find((p) => p.name === params.name);

  if (!partner) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Accueil
              </a>
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Fonctionnalités
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Tarifs
              </a>
            </nav>
            {/* Mobile menu button - optional for future implementation */}
            <button className="md:hidden p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              <span className="sr-only">Menu</span>
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <span className="w-full h-0.5 bg-foreground"></span>
                <span className="w-full h-0.5 bg-foreground"></span>
                <span className="w-full h-0.5 bg-foreground"></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Partnership Header */}
          <div className="text-center mb-12">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8">
              {/* Partner Logo and Name */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                  {partner.logo.startsWith("/") ? (
                    <Image
                      src={partner.logo}
                      alt={partner.fullName || partner.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-xl md:text-2xl">
                      {partner.logo === "mtn-momo" && "📱"}
                      {partner.logo === "orange-money" && "💰"}
                      {partner.logo === "express-union" && "🏦"}
                      {partner.logo === "dhl" && "🚚"}
                      {partner.logo === "uba" && "🏪"}
                      {partner.logo === "afriland" && "💼"}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    {partner.fullName || partner.name}
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {partner.location}
                  </p>
                </div>
              </div>

              {/* Plus Icon */}
              <div className="flex items-center justify-center order-first md:order-none">
                <Plus className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>

              {/* Drop in Drop Logo and Name */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                  <Logo />
                </div>
                <div className="text-left">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    drop-In-drop
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Plateforme e-commerce WhatsApp
                  </p>
                </div>
              </div>
            </div>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {partner.about}
            </p>
          </div>

          {/* Partner Details */}
          <div className="flex justify-center gap-6 md:gap-8">
            {/* Partner Information */}
            <div className="flex justify-between w-full">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground">Fondé en</h4>
                  <p className="text-muted-foreground">{partner.founded}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Localisation
                  </h4>
                  <p className="text-muted-foreground">{partner.location}</p>
                </div>
              </div>

              {partner.website && (
                <div>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm md:text-base"
                  >
                    Visiter le site web
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute w-full bottom-0 border-t border-border bg-card mt-8 md:mt-16">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="text-center">
            <div className="flex items-center flex-col justify-center -gap-2 mb-4">
              <div className="text-center font-wear-tear font-thin text-muted-foreground">
                <span className="font-wear-tear text-9xl text-foreground">
                  DROP IN DROP
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              &copy; {new Date().getFullYear()} Drop-in-Drop. Tous droits
              réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
