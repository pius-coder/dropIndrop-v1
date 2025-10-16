/**
 * Enhanced Landing Page
 * Marketing-focused homepage with content from SiteSettings
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSiteSettings } from "@/features/site-settings/lib/use-site-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ShoppingBag, LogIn, UserPlus, MessageCircle, Shield, Truck, Star, ArrowRight, Smartphone, CreditCard, Users } from "lucide-react";

export function EnhancedLandingPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Get site settings for dynamic content
  const { data: settings } = useSiteSettings();

  const handleWhatsAppJoin = () => {
    if (settings?.whatsappGroupLink) {
      window.open(settings.whatsappGroupLink, "_blank");
    }
  };

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  const features = [
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      title: "Shopping Facile",
      description: "Parcourez et achetez des produits en quelques clics",
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Intégration WhatsApp",
      description: "Recevez des mises à jour et du support via WhatsApp",
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Paiements Sécurisés",
      description: "Traitement des paiements sûr et sécurisé",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile First",
      description: "Expérience optimisée pour les appareils mobiles",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Rejoignez notre groupe WhatsApp",
      description: "Connectez-vous à notre communauté et parcourez les produits",
    },
    {
      number: "2",
      title: "Cliquez sur les liens produits",
      description: "Trouvez les liens produits partagés dans notre groupe WhatsApp",
    },
    {
      number: "3",
      title: "Checkout Facile",
      description: "Paiement sécurisé et confirmation de livraison instantanée",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-primary">
                {settings?.storeName || "Drop-In-Drop"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/auth/login")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </Button>
              <Button
                onClick={() => router.push("/auth/register")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Créer un compte
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Star className="h-4 w-4 mr-1" />
            Bienvenue chez {settings?.storeName || "Drop-In-Drop"}
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {settings?.homeTitle || "Achetez Intelligemment"}
            <span className="text-primary">, Vivez Mieux</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {settings?.homeSubtitle || "Découvrez des produits exceptionnels, connectez-vous à notre communauté et profitez d'une expérience d'achat fluide via notre plateforme WhatsApp."}
          </p>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={handleWhatsAppJoin}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Rejoindre notre groupe WhatsApp
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pourquoi choisir {settings?.storeName || "Drop-In-Drop"} ?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez une expérience d'achat comme jamais auparavant avec nos fonctionnalités innovantes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Comment ça marche
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Démarrez avec {settings?.storeName || "Drop-In-Drop"} en seulement 3 étapes simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-8 pb-8 text-center">
            <MessageCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Rejoignez notre communauté WhatsApp
            </h3>
            <p className="text-green-700 mb-6 max-w-md mx-auto">
              Restez connecté, obtenez des offres exclusives et recevez un support instantané via notre groupe WhatsApp. Rejoignez des milliers de clients satisfaits !
            </p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-medium">
                10,000+ Membres
              </span>
            </div>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleWhatsAppJoin}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Rejoindre le groupe WhatsApp maintenant
            </Button>
            <p className="text-xs text-green-600 mt-4">
              En rejoignant, vous acceptez nos règles communautaires et conditions d'utilisation.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-primary">{settings?.storeName || "Drop-In-Drop"}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 {settings?.storeName || "Drop-In-Drop"}. Tous droits réservés. | Fait avec ❤️ pour le Cameroun
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
