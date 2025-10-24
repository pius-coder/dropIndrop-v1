"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardIcon,
} from "@/components/ui/card";
import {
  CheckCircle,
  ShoppingCart,
  Users,
  Zap,
  Globe,
  MessageCircle,
} from "lucide-react";

interface MobileFeaturesSectionProps {
  content: any;
}

export function MobileFeaturesSection({ content }: MobileFeaturesSectionProps) {
  return (
    <section className="px-4 py-8 bg-background">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            {content.features.title}
          </h2>
          <p className="text-muted-foreground">{content.features.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {content.features.items.map((feature: any, index: number) => (
            <Card key={index} className="group">
              <CardHeader className="pb-3">
                <CardIcon className="group-hover:scale-110 transition-transform duration-200 w-8 h-8">
                  {feature.icon === "MessageCircle" && (
                    <MessageCircle className="w-4 h-4" />
                  )}
                  {feature.icon === "ShoppingCart" && (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  {feature.icon === "Users" && <Users className="w-4 h-4" />}
                  {feature.icon === "Zap" && <Zap className="w-4 h-4" />}
                  {feature.icon === "Globe" && <Globe className="w-4 h-4" />}
                  {feature.icon === "CheckCircle" && (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </CardIcon>
                <CardTitle className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground leading-tight">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
