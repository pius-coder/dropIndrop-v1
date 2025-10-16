/**
 * Enhanced Landing Page
 * Dynamic homepage with content from SiteSettings
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useArticles } from "@/features/article-list/lib/use-articles";
import { useSiteSettings } from "@/features/site-settings/lib/use-site-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ShoppingBag, LogIn, UserPlus, MessageCircle, Shield, Truck } from "lucide-react";
import { ArticleCard } from "@/entities/article/ui/article-card";

export function EnhancedLandingPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Get site settings for dynamic content
  const { data: settings } = useSiteSettings();

  // Get articles for homepage display
  const { data, isLoading, error } = useArticles({
    search,
    status: "AVAILABLE",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 8, // Show featured articles
  });

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Dynamic from SiteSettings */}
      <section className="bg-primary text-primary-foreground py-12 md:py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              {settings?.homeTitle || "Drop-In-Drop"}
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              {settings?.homeSubtitle || "Les meilleurs produits tech au Cameroun"}
            </p>

            {/* WhatsApp CTA */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm mb-3">📱 Rejoignez notre groupe WhatsApp</p>
              <Button
                onClick={handleWhatsAppJoin}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Rejoindre le groupe
              </Button>
            </div>

            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push("/auth/login")}
                className="w-full sm:w-auto"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/auth/register")}
                className="w-full sm:w-auto"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Créer un compte
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 border-b bg-muted/50">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-md border bg-background text-base md:text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Rechercher</Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground">
              Achetez facilement via notre plateforme WhatsApp
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <h3 className="font-semibold mb-2">Parcourez</h3>
                <p className="text-sm text-muted-foreground">
                  Découvrez nos produits et choisissez ce qui vous plaît
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">2️⃣</div>
                <h3 className="font-semibold mb-2">Commandez</h3>
                <p className="text-sm text-muted-foreground">
                  Remplissez le formulaire et choisissez votre paiement
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">3️⃣</div>
                <h3 className="font-semibold mb-2">Récupérez</h3>
                <p className="text-sm text-muted-foreground">
                  Présentez votre ticket et récupérez votre produit
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Produits en vedette
            </h2>
            <p className="text-muted-foreground">Découvrez notre sélection</p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="p-6 text-center">
                <p className="text-destructive">Erreur lors du chargement</p>
              </CardContent>
            </Card>
          )}

          {data && data.articles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Aucun produit disponible pour le moment
                </p>
              </CardContent>
            </Card>
          )}

          {data && data.articles.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {data.articles.slice(0, 8).map((article) => (
                  <div
                    key={article.id}
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => router.push(`/a/${article.uniqueSlug}`)}
                  >
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/articles")}
                >
                  Voir tous les produits
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Pourquoi nous choisir ?
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Sécurisé</h3>
                  <p className="text-sm text-muted-foreground">
                    Paiements sécurisés via Mobile Money
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Truck className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Livraison rapide</h3>
                  <p className="text-sm text-muted-foreground">
                    Récupération immédiate après paiement
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Support WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">
                    Assistance 24/7 via notre groupe
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-muted/50">
        <div className="container">
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <a href="/about" className="hover:text-primary">À propos</a>
              <a href="/contact" className="hover:text-primary">Contact</a>
              <a href="/terms" className="hover:text-primary">Conditions</a>
              <a href="/privacy" className="hover:text-primary">Confidentialité</a>
            </div>

            <div className="space-y-2">
              <p className="font-medium">{settings?.storeName || "Drop-In-Drop"}</p>
              <p className="text-sm text-muted-foreground">
                {settings?.storeAddress || "Cameroun"}
              </p>
              <p className="text-sm text-muted-foreground">
                {settings?.storeHours || "Lundi - Samedi: 8h - 18h"}
              </p>
              <p className="text-sm text-muted-foreground">
                Support: {settings?.supportPhone || "+237 6XX XXX XXX"}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              © 2025 Drop-In-Drop. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
