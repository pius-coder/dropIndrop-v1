"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

// Types for component props
interface ClientOTPFormProps {
  phoneNumber: string;
  onVerified: () => void;
  onBack: () => void;
}

/**
 * OTP verification form component
 * Handles OTP input and verification
 */
export function ClientOTPForm({
  phoneNumber,
  onVerified,
  onBack,
}: ClientOTPFormProps) {
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode.trim()) {
      setError("Please enter the OTP code");
      return;
    }

    if (!/^\d{6}$/.test(otpCode)) {
      setError("OTP must be 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/client/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          otpCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        // Small delay to show success state before callback
        setTimeout(() => {
          onVerified();
        }, 1500);
      } else {
        setError(data.error || "Invalid OTP code");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setResendCooldown(30); // 30 second cooldown

    try {
      const response = await fetch("/api/auth/client/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to resend OTP");
        setResendCooldown(0); // Reset cooldown on error
      }
    } catch (error) {
      setError("Failed to resend OTP");
      setResendCooldown(0);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display (e.g., +1234567890 -> +1 234 567 890)
    return phone.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  };

  if (isVerified) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-900">
            Verification Successful!
          </h3>
          <p className="text-sm text-muted-foreground">
            Your account has been verified and you're being redirected...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Enter Verification Code</h3>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit code to
          <br />
          <span className="font-medium">{formatPhoneNumber(phoneNumber)}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otpCode" className="sr-only">
            OTP Code
          </Label>
          <Input
            id="otpCode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Enter 6-digit code"
            value={otpCode}
            onChange={(e) => {
              // Only allow numbers
              const value = e.target.value.replace(/[^0-9]/g, "");
              setOtpCode(value);
              setError("");
            }}
            className="text-center text-2xl font-mono tracking-widest"
            disabled={isLoading}
            autoComplete="one-time-code"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || otpCode.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
      </form>

      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Phone Number
        </Button>

        <Button
          variant="ghost"
          onClick={handleResendOTP}
          disabled={isLoading || resendCooldown > 0}
          className="w-full text-sm"
        >
          {resendCooldown > 0
            ? `Resend OTP in ${resendCooldown}s`
            : "Didn't receive the code? Resend"}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        <p>
          For demo purposes, use OTP:{" "}
          <code className="bg-muted px-1 rounded">123456</code>
        </p>
      </div>
    </div>
  );
}
