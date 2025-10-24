"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageCircle } from "lucide-react";

interface MobileCtaSectionProps {
  content: any;
}

export function MobileCtaSection({ content }: MobileCtaSectionProps) {
  return (
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
            className="w-full text-base py-3"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {content.cta.primaryButton}
          </Button>

          <Button size="lg" variant="outline" className="w-full text-base py-3">
            <MessageCircle className="w-5 h-5 mr-2" />
            {content.cta.secondaryButton}
          </Button>
        </div>
      </div>
    </section>
  );
}
