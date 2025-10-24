"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageCircle } from "lucide-react";

interface CtaSectionProps {
  content: any;
}

export function CtaSection({ content }: CtaSectionProps) {
  return (
    <section
      id="pricing"
      className="bg-card text-card-foreground border-y border-border h-[calc(100vh-72px)] w-full justify-center items-center flex flex-col"
    >
      <div className="px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-foreground">
          {content.cta.title}
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
          {content.cta.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
            <ShoppingCart className="w-5 h-5 mr-2" />
            {content.cta.primaryButton}
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-3">
            <MessageCircle className="w-5 h-5 mr-2" />
            {content.cta.secondaryButton}
          </Button>
        </div>
      </div>
    </section>
  );
}
