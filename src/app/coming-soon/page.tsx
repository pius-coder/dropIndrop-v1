import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-12 font-wear-tear font-thin text-muted-foreground">
          <span className="font-wear-tear text-[200px] text-foreground">
            COMING SOON
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
          Cette page arrive bientôt
        </h1>

        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Nous travaillons dur pour vous offrir la meilleure expérience
          possible. Restez connecté pour découvrir nos nouvelles fonctionnalités
          !
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="text-lg px-8 py-3">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>

          <Button size="lg" variant="outline" className="text-lg px-8 py-3">
            <Mail className="w-5 h-5 mr-2" />
            Nous contacter
          </Button>
        </div>
      </div>
    </div>
  );
}
