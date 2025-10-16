/**
 * Share Buttons Component
 * Provides sharing options for articles
 */

"use client";

import { Share2, MessageCircle, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArticleWithRelations } from "@/entities/article";

interface ShareButtonsProps {
  article: ArticleWithRelations;
}

export function ShareButtons({ article }: ShareButtonsProps) {
  const articleUrl = `${window.location.origin}/a/${article.uniqueSlug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      alert("Lien copié dans le presse-papiers!");
    } catch (error) {
      alert("Erreur lors de la copie du lien");
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Découvrez cet article sur Drop-In-Drop:\n\n*${article.name}*\n💰 Prix: ${Number(article.price).toLocaleString("fr-FR")} FCFA\n📦 Stock: ${article.stock} disponibles\n\n🔗 ${articleUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.name,
          text: `Découvrez cet article: ${article.name} - ${Number(article.price).toLocaleString("fr-FR")} FCFA`,
          url: articleUrl,
        });
      } catch (error) {
        // User cancelled or error, fallback to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShareWhatsApp}
        className="flex-1"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleShareNative}
        className="flex-1"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Partager
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="flex-1"
      >
        <Copy className="mr-2 h-4 w-4" />
        Copier
      </Button>
    </div>
  );
}
