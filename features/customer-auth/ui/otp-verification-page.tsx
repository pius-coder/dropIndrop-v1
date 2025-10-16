/**
 * OTP Verification Page
 * Dedicated page for OTP verification with proper input-otp integration
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  verifyOtpSchema,
  type VerifyOtpInput,
} from "@/entities/customer/model/otp-types";
import {
  useVerifyOTPMutation,
  useResendOTPMutation,
} from "@/entities/customer/api/customer-otp-api";

interface OTPVerificationPageProps {
  phoneNumber: string;
  onSuccess?: (token: string, customer: any) => void;
}

export function OTPVerificationPage({ phoneNumber, onSuccess }: OTPVerificationPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const redirectTo = searchParams?.get("redirectTo") || "/";

  // Use React Query mutations
  const verifyOTPMutation = useVerifyOTPMutation();
  const resendOTPMutation = useResendOTPMutation();

  // OTP verification form
  const form = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      phone: phoneNumber,
      otp: "",
    },
  });

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (data: VerifyOtpInput) => {
    setError(null);

    try {
      const result = await verifyOTPMutation.mutateAsync(data) as any;

      if (result?.success) {
        // Store token in localStorage
        localStorage.setItem("customerToken", result.token);

        toast.success("Connexion réussie!", {
          description: `Bienvenue, ${result.customer.name}`,
        });

        // Call success callback or redirect
        if (onSuccess) {
          onSuccess(result.token, result.customer);
        } else {
          router.push(redirectTo);
        }
      } else {
        setError(result?.message || "Code OTP invalide");
        toast.error("Code invalide", {
          description: result?.message || "Le code OTP n'est pas valide",
        });
      }
    } catch (error: any) {
      setError(error.message || "Erreur de connexion");
      toast.error("Erreur de connexion", {
        description: "Vérifiez votre connexion internet",
      });
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setError(null);

    try {
      // Get registration data from localStorage
      const registrationData = localStorage.getItem("pendingRegistration");
      let requestData;

      if (registrationData) {
        requestData = JSON.parse(registrationData);
      } else {
        // Fallback
        requestData = {
          phone: phoneNumber,
          name: "User",
          password: "",
        };
      }

      const result = await resendOTPMutation.mutateAsync(requestData) as any;

      if (result?.success) {
        setResendCooldown(60); // 60 second cooldown
        toast.success("Code renvoyé!", {
          description: "Un nouveau code a été envoyé à votre WhatsApp",
        });
      } else {
        setError(result?.message || "Erreur lors du renvoi du code");
        toast.error("Erreur de renvoi", {
          description: result?.message || "Impossible de renvoyer le code",
        });
      }
    } catch (error: any) {
      setError(error.message || "Erreur de connexion");
      toast.error("Erreur de connexion", {
        description: "Vérifiez votre connexion internet",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Vérification OTP</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Code envoyé à +237 {phoneNumber}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Code de vérification
              </label>
              <Controller
                name="otp"
                control={form.control}
                render={({ field }) => (
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
              {form.formState.errors.otp && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.otp.message}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={verifyOTPMutation.isPending}
            >
              {verifyOTPMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier le code"
              )}
            </Button>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendOTP}
                disabled={resendOTPMutation.isPending || resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Renvoyer dans ${resendCooldown}s`
                  : "Renvoyer le code"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Vous n'avez pas reçu le code ?</p>
            <p>Vérifiez votre WhatsApp ou essayez de renvoyer le code.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}