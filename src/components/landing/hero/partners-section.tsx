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
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            🤝 Partenaires
          </Badge>
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            {partners.title}
          </h2>
          <p className="text-muted-foreground">{partners.subtitle}</p>
        </div>

        {/* Partners Grid - Responsive layout */}
        <div className="flex justify-center align-middle max-w-xs gap-4 mx-auto">
          {partners.items.map((partner, index) => (
            <Card
              key={index}
              className="group hover:shadow-md hover:shadow-green-700 shadow-none hover:border-green-500 border-0 hover:border shadow-0 bg-transparent transition-all duration-200"
            >
              <CardContent className="p-4 text-center">
                {/* Partner Logo */}
                <div className="w-32 h-32 bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors overflow-hidden">
                  {partner.logo.startsWith("/") ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-cover p-2"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {partner.logo === "mtn-momo" && "📱"}
                      {partner.logo === "orange-money" && "💰"}
                      {partner.logo === "express-union" && "🏦"}
                      {partner.logo === "dhl" && "🚚"}
                      {partner.logo === "uba" && "🏪"}
                      {partner.logo === "afriland" && "💼"}
                    </span>
                  )}
                </div>

                {/* Partner Name */}
                <h3 className="font-semibold text-green-700 text-sm mb-2 group-hover:text-primary transition-colors">
                  {partner.name}
                </h3>

                {/* Partner Description */}
                <p className="text-xs text-muted-foreground leading-tight hidden group-hover:block">
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
