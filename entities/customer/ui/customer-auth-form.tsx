/**
 * Customer OTP Login UI
 * Registration/Login form with WhatsApp OTP verification
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  sendOtpSchema,
  type SendOtpInput,
} from "@/entities/customer/model/otp-types";
import { useRouter, useSearchParams } from "next/navigation";
import { useSendOTPMutation } from "@/entities/customer/api/customer-otp-api";

interface CustomerAuthFormProps {
  onSuccess?: (token: string, customer: any) => void;
  mode?: "login" | "register";
}

export function CustomerAuthForm({
  onSuccess,
  mode = "register",
}: CustomerAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams?.get("redirectTo") || "/";

  // Use React Query mutation
  const sendOTPMutation = useSendOTPMutation();

  // Auth form (login/register)
  const authForm = useForm<SendOtpInput>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      phone: "",
      name: "",
      password: "",
    },
  });

  const onAuthSubmit = async (data: SendOtpInput) => {
    setError(null);

    try {
      const result = await sendOTPMutation.mutateAsync(data) as any;

      if (result?.success) {
        // Store registration data for OTP verification
        localStorage.setItem("pendingRegistration", JSON.stringify(data));

        // Redirect to dedicated OTP verification page
        router.push(`/auth/verify-otp?phone=${encodeURIComponent(data.phone)}`);

        toast.success("Code OTP envoyé!", {
          description: "Vérifiez votre WhatsApp pour le code de vérification",
        });
      } else {
        setError(result?.message || "Erreur lors de l'envoi du code");
        toast.error("Erreur d'envoi", {
          description: result?.message || "Impossible d'envoyer le code OTP",
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            {mode === "login" ? (
              <LogIn className="h-6 w-6 text-green-600" />
            ) : (
              <UserPlus className="h-6 w-6 text-green-600" />
            )}
          </div>
        </div>
        <CardTitle className="text-2xl">
          {mode === "login" ? "Connexion" : "Créer votre compte"}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          {mode === "login"
            ? "Connectez-vous à votre compte"
            : "Recevez un code de vérification par WhatsApp"}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...authForm}>
          <form
            onSubmit={authForm.handleSubmit(onAuthSubmit)}
            className="space-y-4"
          >
            {/* Phone Number with +237 prefix */}
            <FormField
              control={authForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro WhatsApp</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted text-sm font-medium">
                        +237
                      </div>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="6 XX XX XX XX"
                        className="rounded-l-none"
                        maxLength={9}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={authForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre nom</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Votre nom complet" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={authForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Votre mot de passe"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={sendOTPMutation.isPending}
            >
              {sendOTPMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Recevoir le code
                </>
              )}
            </Button>

            {mode === "register" && (
              <p className="text-xs text-muted-foreground text-center">
                En créant un compte, vous acceptez nos conditions d'utilisation
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
