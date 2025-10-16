/**
 * Client Home Page Component
 *
 * Public-facing homepage with featured articles
 */

"use client";

import { useArticles } from "@/features/article-list";
import { ArticleCard } from "@/entities/article";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useArticles({
    search,
    inStock: true,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">Drop-In-Drop</h1>
            <p className="text-lg md:text-xl opacity-90">
              Les meilleurs produits tech au Cameroun
            </p>
            <p className="text-sm md:text-base opacity-80">
              Commandez facilement via WhatsApp 📱
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 text-base md:text-sm"
                />
              </div>
              <Button>Rechercher</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-12">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Produits disponibles
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
              <CardContent className="p-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.articles.map((article) => (
                <div
                  key={article.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/articles/${article.uniqueSlug}`)}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-muted/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Comment ça marche ?
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 text-left">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-4xl mb-3">1️⃣</div>
                  <h3 className="font-semibold mb-2">Parcourez</h3>
                  <p className="text-sm text-muted-foreground">
                    Découvrez nos produits et choisissez ce qui vous plaît
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-4xl mb-3">2️⃣</div>
                  <h3 className="font-semibold mb-2">Commandez</h3>
                  <p className="text-sm text-muted-foreground">
                    Remplissez le formulaire et choisissez votre paiement
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-4xl mb-3">3️⃣</div>
                  <h3 className="font-semibold mb-2">Récupérez</h3>
                  <p className="text-sm text-muted-foreground">
                    Présentez votre ticket et récupérez votre produit
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Drop-In-Drop. Tous droits réservés.</p>
            <p className="mt-2">Cameroun 🇨🇲</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
