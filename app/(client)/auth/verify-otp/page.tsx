/**
 * OTP Verification Page Route
 * Dedicated page for OTP verification
 */

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OTPVerificationPage } from "@/features/customer-auth/ui/otp-verification-page";
import { Loader2 } from "lucide-react";

function OTPVerificationContent() {
  const searchParams = useSearchParams();
  const phoneNumber = searchParams?.get("phone") || "";

  if (!phoneNumber) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Erreur</h1>
          <p className="text-muted-foreground mb-4">
            Numéro de téléphone manquant.
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  return <OTPVerificationPage phoneNumber={phoneNumber} />;
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement...</span>
          </div>
        </div>
      }
    >
      <OTPVerificationContent />
    </Suspense>
  );
}
