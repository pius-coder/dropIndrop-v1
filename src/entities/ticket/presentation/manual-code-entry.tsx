"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Keyboard, CheckCircle, AlertCircle, Hash } from "lucide-react";
import { cn } from "../../../lib/utils";

export interface ManualCodeEntryRef {
  getCode: () => string;
  clearCode: () => void;
  focus: () => void;
}

interface ManualCodeEntryProps {
  onCodeSubmit: (code: string) => void;
  onError?: (error: string) => void;
  className?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  expectedFormat?: string;
  disabled?: boolean;
}

export const ManualCodeEntry = forwardRef<
  ManualCodeEntryRef,
  ManualCodeEntryProps
>(
  (
    {
      onCodeSubmit,
      onError,
      className,
      title = "Enter Verification Code",
      description = "Enter the unique code from the ticket",
      placeholder = "ABCD-1234",
      expectedFormat = "ABCD-1234",
      disabled = false,
    },
    ref
  ) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getCode: () => code,
      clearCode: () => {
        setCode("");
        setError(null);
      },
      focus: () => {
        // Focus will be handled by the input ref
      },
    }));

    const validateCode = (inputCode: string): boolean => {
      // Basic validation for the expected format ABCD-1234
      const codeRegex = /^[A-Z]{4}-\d{4}$/;
      return codeRegex.test(inputCode.toUpperCase());
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!code.trim()) {
        const errorMsg = "Please enter a verification code";
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      if (!validateCode(code.trim())) {
        const errorMsg = `Invalid format. Expected format: ${expectedFormat}`;
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      setError(null);
      setIsSubmitting(true);

      try {
        await onCodeSubmit(code.trim().toUpperCase());
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to verify code";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      // Only allow letters and numbers, and enforce the format
      const sanitized = value.replace(/[^A-Z0-9-]/g, "");

      // Auto-format: add dash after 4 characters if it doesn't exist
      let formatted = sanitized;
      if (sanitized.length === 4 && !sanitized.includes("-")) {
        formatted = sanitized + "-";
      }

      setCode(formatted);
      if (error) setError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Auto-format on key press
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    };

    return (
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                maxLength={9} // ABCD-1234 is 9 characters
                className={cn(
                  "text-center font-mono text-lg tracking-wider",
                  error && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={disabled || isSubmitting}
                autoComplete="off"
              />
              {expectedFormat && (
                <p className="text-xs text-muted-foreground text-center">
                  Format: {expectedFormat}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={disabled || isSubmitting || !code.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Code
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Keyboard className="h-4 w-4" />
              <span>Enter the code manually or scan the QR code</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ManualCodeEntry.displayName = "ManualCodeEntry";
