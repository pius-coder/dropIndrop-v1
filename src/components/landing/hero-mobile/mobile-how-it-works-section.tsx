"use client";

interface MobileHowItWorksSectionProps {
  content: any;
}

export function MobileHowItWorksSection({
  content,
}: MobileHowItWorksSectionProps) {
  return (
    <section className="px-4 py-8 bg-muted/50">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            {content.howItWorks.title}
          </h2>
          <p className="text-muted-foreground">{content.howItWorks.subtitle}</p>
        </div>

        <div className="space-y-4">
          {content.howItWorks.steps.map((step: any, index: number) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-background rounded-lg p-4"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-foreground">
                  {step.number}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
