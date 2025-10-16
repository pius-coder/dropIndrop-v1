/**
 * Public Article View Component
 * Displays article details with gallery and purchase options
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/shared/lib/format";
import { useCustomer } from "@/entities/customer/lib/customer-context";
import { ArticleGallery } from "./article-gallery";
import { BuyNowButton } from "./buy-now-button";
import { ShareButtons } from "./share-buttons";
import type { ArticleWithRelations } from "@/entities/article";

interface ArticlePublicViewProps {
  article: ArticleWithRelations;
}

export function ArticlePublicView({ article }: ArticlePublicViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useCustomer();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleBuyClick = () => {
    if (isAuthenticated) {
      router.push(`/purchase?articleId=${article.id}`);
    } else {
      router.push(`/auth/login?redirectTo=/purchase?articleId=${article.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Article Images */}
          <div className="space-y-4">
            <ArticleGallery
              images={article.images}
              videos={article.videos}
              selectedIndex={selectedImageIndex}
              onSelectImage={setSelectedImageIndex}
            />

            {/* Thumbnail Navigation */}
            {article.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {article.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImageIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${article.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Article Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{article.name}</h1>
              <p className="text-muted-foreground text-lg">
                Code: {article.code}
              </p>
            </div>

            {/* Price and Stock */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(Number(article.price))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {article.stock > 0 ? `${article.stock} en stock` : "Rupture de stock"}
                </span>
              </div>

              {article.category && (
                <div className="text-sm text-muted-foreground">
                  Catégorie: {article.category.name}
                </div>
              )}

              {article.subcategory && (
                <div className="text-sm text-muted-foreground">
                  Sous-catégorie: {article.subcategory.name}
                </div>
              )}
            </div>

            {/* Description */}
            {article.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {article.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <BuyNowButton
                article={article}
                onBuyClick={handleBuyClick}
                disabled={article.stock === 0 || article.status !== "AVAILABLE"}
              />

              <ShareButtons article={article} />
            </div>

            {/* Store Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium">📍 Comment acheter:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Cliquez sur "Acheter maintenant"</li>
                <li>Connectez-vous avec votre numéro</li>
                <li>Effectuez le paiement Mobile Money</li>
                <li>Présentez le ticket pour récupérer</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                💳 Paiement: MTN Money / Orange Money
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
