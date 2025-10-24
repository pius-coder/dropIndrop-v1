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

interface FeaturesSectionProps {
  content: any;
}

export function FeaturesSection({ content }: FeaturesSectionProps) {
  return (
    <section
      id="features"
      className="bg-background container h-[calc(100vh-72px)] mx-auto px-4 py-16 justify-center items-center flex flex-col"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            {content.features.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {content.features.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.features.items.map((feature: any, index: number) => (
            <Card key={index} className="group">
              <CardHeader className="pb-4">
                <CardIcon className="group-hover:scale-110 transition-transform duration-200">
                  {feature.icon === "MessageCircle" && (
                    <MessageCircle className="w-6 h-6" />
                  )}
                  {feature.icon === "ShoppingCart" && (
                    <ShoppingCart className="w-6 h-6" />
                  )}
                  {feature.icon === "Users" && <Users className="w-6 h-6" />}
                  {feature.icon === "Zap" && <Zap className="w-6 h-6" />}
                  {feature.icon === "Globe" && <Globe className="w-6 h-6" />}
                  {feature.icon === "CheckCircle" && (
                    <CheckCircle className="w-6 h-6" />
                  )}
                </CardIcon>
                <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
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
