"use client";

interface HowItWorksSectionProps {
  content: any;
}

export function HowItWorksSection({ content }: HowItWorksSectionProps) {
  return (
    <section
      id="how-it-works"
      className="bg-muted/50 container h-[calc(100vh-72px)] border border-border mx-auto px-4 py-16 justify-center items-center flex flex-col"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            {content.howItWorks.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {content.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {content.howItWorks.steps.map((step: any, index: number) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
