import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { contentConfig } from "../content";

interface PartnersSectionProps {
  mode: "client" | "vendor";
}

export function PartnersSection({ mode }: PartnersSectionProps) {
  const content = contentConfig[mode];
  const partners = content.partners;

  if (!partners) return null;

  return (
    <section className="px-4 py-8 bg-muted/30">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            🤝 Partenaires
          </Badge>
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            {partners.title}
          </h2>
          <p className="text-muted-foreground">{partners.subtitle}</p>
        </div>

        {/* Partners Grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 gap-4">
          {partners.items.map((partner, index) => (
            <Card
              key={index}
              className="group hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-4 text-center">
                {/* Partner Logo Placeholder */}
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <span className="text-lg font-bold text-primary">
                    {partner.logo === "mtn-momo" && "📱"}
                    {partner.logo === "orange-money" && "💰"}
                    {partner.logo === "express-union" && "🏦"}
                    {partner.logo === "dhl" && "🚚"}
                    {partner.logo === "uba" && "🏪"}
                    {partner.logo === "afriland" && "💼"}
                  </span>
                </div>

                {/* Partner Name */}
                <h3 className="font-semibold text-foreground text-sm mb-2 group-hover:text-primary transition-colors">
                  {partner.name}
                </h3>

                {/* Partner Description */}
                <p className="text-xs text-muted-foreground leading-tight">
                  {partner.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
