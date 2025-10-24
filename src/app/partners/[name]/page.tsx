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
            <nav className="flex items-center gap-6">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Partnership Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-8 mb-8">
              {/* Partner Logo and Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                  {partner.logo.startsWith("/") ? (
                    <Image
                      src={partner.logo}
                      alt={partner.fullName || partner.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-2xl">
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
                  <h1 className="text-2xl font-bold text-foreground">
                    {partner.fullName || partner.name}
                  </h1>
                  <p className="text-muted-foreground">{partner.location}</p>
                </div>
              </div>

              {/* Plus Icon */}
              <div className="flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>

              {/* Drop in Drop Logo and Name */}
              <div className="flex items-center gap-4">
                <Logo />
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-foreground">
                    Drop-in-Drop
                  </h1>
                  <p className="text-muted-foreground">
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
          <div className="grid md:grid-cols-2 gap-8">
            {/* Partner Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  À propos de {partner.fullName || partner.name}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {partner.about}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  Services
                </h3>
                <ul className="space-y-2">
                  {partner.services?.map((service, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>

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
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Visiter le site web
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>

            {/* Partnership Benefits */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  Notre partenariat
                </h2>
                <div className="bg-muted/50 rounded-lg p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    En collaborant avec {partner.fullName || partner.name}, nous
                    offrons à nos utilisateurs des solutions intégrées et
                    fiables pour une expérience e-commerce complète sur
                    WhatsApp. Cette partnership renforce notre engagement à
                    fournir des services de qualité dans tout le Cameroun.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  Avantages pour nos utilisateurs
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Intégration transparente avec nos services
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Support technique local et réactif
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Solutions adaptées au marché camerounais
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Sécurité et fiabilité des transactions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Logo />
              <span className="font-semibold text-foreground">
                Drop-in-Drop
              </span>
            </div>
            <p className="text-muted-foreground">
              &copy; {new Date().getFullYear()} Drop-in-Drop. Tous droits
              réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
