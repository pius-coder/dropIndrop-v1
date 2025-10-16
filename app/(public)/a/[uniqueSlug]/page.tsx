/**
 * Public Article View Page
 * Shows article details with gallery and buy button
 */

"use client";

import { useParams } from "next/navigation";
import { usePublicArticle } from "@/features/article-public/lib/use-public-article";
import { ArticlePublicView } from "@/features/article-public/ui/article-public-view";
import { Loader2 } from "lucide-react";

export default function PublicArticlePage() {
  const params = useParams();
  const uniqueSlug = params.uniqueSlug as string;

  const { data: article, isLoading, error } = usePublicArticle(uniqueSlug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement de l'article...</span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Article introuvable</h1>
          <p className="text-muted-foreground mb-4">
            L'article que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return <ArticlePublicView article={article} />;
}
