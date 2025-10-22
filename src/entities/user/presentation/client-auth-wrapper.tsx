"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2, MessageCircle, Shield } from "lucide-react";
import { ClientOTPForm } from "./client-otp-form";

// Types for component state
interface AuthState {
  step: "register" | "otp";
  phoneNumber: string;
  username: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Client authentication wrapper component
 * Handles the complete WhatsApp OTP authentication flow
 */
export function ClientAuthWrapper() {
  const [authState, setAuthState] = useState<AuthState>({
    step: "register",
    phoneNumber: "+237",
    username: "",
    password: "",
    isLoading: false,
    error: null,
  });

  const handlePhoneSubmit = async (phoneNumber: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/auth/client/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setAuthState((prev) => ({
          ...prev,
          step: "otp",
          phoneNumber,
          isLoading: false,
        }));
      } else {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: data.error || "Failed to send OTP",
        }));
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Network error. Please try again.",
      }));
    }
  };

  const handleOTPVerified = () => {
    // OTP verification successful, redirect to client dashboard
    window.location.href = "/client"; // Redirect to client dashboard
  };

  const handleBackToRegister = () => {
    setAuthState((prev) => ({
      ...prev,
      step: "register",
      error: null,
    }));
  };

  const handleRegistrationSubmit = async (
    username: string,
    password: string,
    phoneNumber: string
  ) => {
    setAuthState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      username,
      password,
      phoneNumber,
    }));

    try {
      const response = await fetch("/api/auth/client/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setAuthState((prev) => ({
          ...prev,
          step: "otp",
          isLoading: false,
        }));
      } else {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: data.error || "Échec de l'inscription",
        }));
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Erreur réseau. Veuillez réessayer.",
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <MessageCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Client Authentication
          </CardTitle>
          <CardDescription>
            Authenticate using WhatsApp OTP to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {authState.error && (
            <Alert variant="destructive">
              <AlertDescription>{authState.error}</AlertDescription>
            </Alert>
          )}

          {authState.step === "register" ? (
            <RegistrationForm
              onSubmit={handleRegistrationSubmit}
              isLoading={authState.isLoading}
              initialPhoneNumber={authState.phoneNumber}
            />
          ) : (
            <ClientOTPForm
              phoneNumber={authState.phoneNumber}
              onVerified={handleOTPVerified}
              onBack={handleBackToRegister}
            />
          )}

          <div className="text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure WhatsApp OTP Authentication</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Registration form component with username, password, and phone number
 */
interface RegistrationFormProps {
  onSubmit: (username: string, password: string, phoneNumber: string) => void;
  isLoading: boolean;
  initialPhoneNumber: string;
}

function RegistrationForm({
  onSubmit,
  isLoading,
  initialPhoneNumber,
}: RegistrationFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    phoneNumber?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      username?: string;
      password?: string;
      phoneNumber?: string;
    } = {};

    // Validate username
    if (!username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (username.length < 3) {
      newErrors.username =
        "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Validate phone number (Cameroon format)
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Le numéro de téléphone est requis";
    } else {
      const phoneRegex = /^\+237[0-9]{9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        newErrors.phoneNumber = "Le numéro doit être au format +237XXXXXXXXX";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(username, password, phoneNumber);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nom d'utilisateur *</Label>
        <Input
          id="username"
          type="text"
          placeholder="monnomutilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          className={errors.username ? "border-red-500" : ""}
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe *</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+23761234567"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className={`text-center text-lg ${
            errors.phoneNumber ? "border-red-500" : ""
          }`}
          disabled={isLoading}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Format: +237 suivi de 9 chiffres
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Inscription...
          </>
        ) : (
          <>
            <MessageCircle className="mr-2 h-4 w-4" />
            S'inscrire et envoyer OTP
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Un code de vérification vous sera envoyé via WhatsApp
      </p>
    </form>
  );
}
