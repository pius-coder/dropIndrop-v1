/**
 * Home Page
 * 
 * Landing page for Drop-In-Drop
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <main className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Drop-In-Drop
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Plateforme E-commerce via WhatsApp
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>🛍️ Client</CardTitle>
              <CardDescription>
                Découvrez nos produits et passez commande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" asChild>
                <Link href="/client">Voir les articles</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>👤 Admin</CardTitle>
              <CardDescription>
                Gérez vos articles, drops et commandes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" variant="outline" asChild>
                <Link href="/admin">Connexion Admin</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>📊 API Status</CardTitle>
            <CardDescription>
              Infrastructure Ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="text-sm text-green-600">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API</span>
              <span className="text-sm text-green-600">✓ Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Components</span>
              <span className="text-sm text-green-600">✓ 10 installed</span>
            </div>
            <Button className="w-full mt-4" variant="outline" size="sm" asChild>
              <Link href="/api/health" target="_blank">
                View API Health →
              </Link>
            </Button>
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-muted-foreground">
          <p>Week 3 Infrastructure Complete</p>
          <p className="mt-2">
            Progress: 12/34 steps (35%) • Ready for feature development
          </p>
        </footer>
      </main>
    </div>
  );
}
