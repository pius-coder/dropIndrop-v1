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
import { Loader2, Smartphone, Shield, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  sendOtpSchema,
  verifyOtpSchema,
  type SendOtpInput,
  type VerifyOtpInput,
} from "@/entities/customer/model/otp-types";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [step, setStep] = useState<"auth" | "verify">("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  const redirectTo = searchParams?.get("redirectTo") || "/";

  // Auth form (login/register)
  const authForm = useForm<SendOtpInput>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      phone: "",
      name: "",
      password: "",
    },
  });

  // OTP verification form
  const verifyForm = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      phone: "",
      otp: "",
    },
  });

  const onAuthSubmit = async (data: SendOtpInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/customers/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setPhoneNumber(data.phone);
        setStep("verify");
        verifyForm.reset({
          phone: data.phone,
          otp: "",
        });

        toast.success("Code OTP envoyé!", {
          description: "Vérifiez votre WhatsApp pour le code de vérification",
        });
      } else {
        setError(result.message || "Erreur lors de l'envoi du code");
        toast.error("Erreur d'envoi", {
          description: result.message || "Impossible d'envoyer le code OTP",
        });
      }
    } catch (error) {
      setError("Erreur de connexion");
      toast.error("Erreur de connexion", {
        description: "Vérifiez votre connexion internet",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (data: VerifyOtpInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/customers/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber, // Use phone number from component state
          otp: data.otp,
        }),
      });

      const result = await response.json();

      if (result.success) {
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
        setError(result.message || "Code OTP invalide");
        toast.error("Code invalide", {
          description: result.message || "Le code OTP n'est pas valide",
        });
      }
    } catch (error) {
      setError("Erreur de connexion");
      toast.error("Erreur de connexion", {
        description: "Vérifiez votre connexion internet",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!phoneNumber) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/customers/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          name: authForm.getValues("name"),
          password: authForm.getValues("password"),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Code renvoyé!", {
          description: "Un nouveau code a été envoyé à votre WhatsApp",
        });
      } else {
        setError(result.message || "Erreur lors du renvoi du code");
        toast.error("Erreur de renvoi", {
          description: result.message || "Impossible de renvoyer le code",
        });
      }
    } catch (error) {
      setError("Erreur de connexion");
      toast.error("Erreur de connexion", {
        description: "Vérifiez votre connexion internet",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "auth") {
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
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
                  En créant un compte, vous acceptez nos conditions
                  d'utilisation
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl">Vérification</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Code envoyé à +237 {phoneNumber}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...verifyForm}>
          <form
            onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
            className="space-y-4"
          >
            <FormField
              control={verifyForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code de vérification</FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="123456"
                      maxLength={6}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl tracking-widest ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        field.onChange(value);
                      }}
                      autoComplete="one-time-code"
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier le code"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendOTP}
              disabled={isLoading}
            >
              Renvoyer le code
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("auth");
                setError(null);
              }}
            >
              Modifier les informations
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
