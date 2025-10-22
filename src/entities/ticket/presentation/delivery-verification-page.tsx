"use client";

import React, { useState, useRef } from "react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Label } from "../../../components/ui/label";
import { QRScanner, QRScannerRef } from "./qr-scanner-component";
import { ManualCodeEntry, ManualCodeEntryRef } from "./manual-code-entry";
import {
  CheckCircle,
  Truck,
  User,
  Package,
  Phone,
  RefreshCw,
  QrCode,
  Keyboard,
  AlertCircle,
} from "lucide-react";

interface OrderInfo {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customer: {
    id: string;
    username: string;
    phoneNumber: string;
  };
}

interface TicketInfo {
  id: string;
  orderId: string;
  uniqueCode: string;
  isUsed: boolean;
  expiresAt: string;
}

type VerificationMethod = "qr" | "manual" | null;
type VerificationStep =
  | "method-selection"
  | "scanning"
  | "verifying"
  | "success"
  | "error";

export default function DeliveryVerificationPage() {
  const [currentStep, setCurrentStep] =
    useState<VerificationStep>("method-selection");
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const qrScannerRef = useRef<QRScannerRef>(null);
  const manualCodeRef = useRef<ManualCodeEntryRef>(null);

  const handleQRCodeScanned = async (qrCodeData: string) => {
    await verifyTicket({ qrCodeData });
  };

  const handleManualCodeSubmit = async (code: string) => {
    await verifyTicket({ uniqueCode: code });
  };

  const verifyTicket = async (verifyData: {
    uniqueCode?: string;
    qrCodeData?: string;
  }) => {
    setIsVerifying(true);
    setError(null);
    setCurrentStep("verifying");

    try {
      const response = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...verifyData,
          action: "verify",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Verification failed");
      }

      setOrderInfo(result.order);
      setTicketInfo(result.ticket);
      setCurrentStep("success");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Verification failed";
      setError(errorMessage);
      setCurrentStep("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const completeDelivery = async () => {
    if (!ticketInfo || !orderInfo) return;

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uniqueCode: ticketInfo.uniqueCode,
          action: "use",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to complete delivery");
      }

      // Refresh the ticket info to show it's been used
      setTicketInfo({ ...ticketInfo, isUsed: true });
      setOrderInfo({ ...orderInfo, status: "DELIVERED" });

      // Show success message
      setCurrentStep("success");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to complete delivery";
      setError(errorMessage);
      setCurrentStep("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setCurrentStep("method-selection");
    setVerificationMethod(null);
    setOrderInfo(null);
    setTicketInfo(null);
    setError(null);
    setIsVerifying(false);

    // Stop QR scanner if running
    qrScannerRef.current?.stopScanning();
    manualCodeRef.current?.clearCode();
  };

  const startQRScanning = () => {
    setVerificationMethod("qr");
    setCurrentStep("scanning");
    setTimeout(() => {
      qrScannerRef.current?.startScanning();
    }, 100);
  };

  const startManualEntry = () => {
    setVerificationMethod("manual");
    setCurrentStep("scanning");
  };

  // Method selection step
  if (currentStep === "method-selection") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Truck className="h-8 w-8" />
              Delivery Verification
            </h1>
            <p className="text-muted-foreground">
              Verify orders using QR codes or unique verification codes
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Choose Verification Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  onClick={startQRScanning}
                  className="h-auto p-6 flex flex-col items-center gap-3"
                  variant="outline"
                >
                  <QrCode className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">Scan QR Code</div>
                    <div className="text-sm text-muted-foreground">
                      Use camera to scan ticket QR code
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={startManualEntry}
                  className="h-auto p-6 flex flex-col items-center gap-3"
                  variant="outline"
                >
                  <Keyboard className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">Enter Code Manually</div>
                    <div className="text-sm text-muted-foreground">
                      Type the verification code
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // QR Scanning step
  if (currentStep === "scanning" && verificationMethod === "qr") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={resetVerification}>
              ← Back to Methods
            </Button>
            <Badge variant="secondary">QR Code Scanning</Badge>
          </div>

          <QRScanner
            ref={qrScannerRef}
            onQRCodeScanned={handleQRCodeScanned}
            onError={setError}
            title="Scan Ticket QR Code"
            description="Position the QR code within the camera view"
          />

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Having trouble with the camera?
                </p>
                <Button variant="outline" onClick={startManualEntry}>
                  <Keyboard className="h-4 w-4 mr-2" />
                  Enter Code Manually Instead
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Manual entry step
  if (currentStep === "scanning" && verificationMethod === "manual") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={resetVerification}>
              ← Back to Methods
            </Button>
            <Badge variant="secondary">Manual Code Entry</Badge>
          </div>

          <ManualCodeEntry
            ref={manualCodeRef}
            onCodeSubmit={handleManualCodeSubmit}
            onError={setError}
            title="Enter Verification Code"
            description="Enter the unique code from the ticket"
          />

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Prefer to scan the QR code instead?
                </p>
                <Button variant="outline" onClick={startQRScanning}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Verifying step
  if (currentStep === "verifying") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Verifying Ticket</h3>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we verify the ticket...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success step
  if (currentStep === "success" && orderInfo && ticketInfo) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-600">
              Verification Successful!
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Order Number
                  </Label>
                  <p className="font-semibold">{orderInfo.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Total Amount
                  </Label>
                  <p className="font-semibold">
                    ${orderInfo.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant={
                      orderInfo.status === "DELIVERED" ? "default" : "secondary"
                    }
                  >
                    {orderInfo.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Ticket Code
                  </Label>
                  <p className="font-mono text-sm">{ticketInfo.uniqueCode}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </Label>
                <div className="mt-2 space-y-1">
                  <p className="font-semibold">{orderInfo.customer.username}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {orderInfo.customer.phoneNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {orderInfo.status !== "DELIVERED" && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="font-semibold">Complete Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      Mark this order as delivered to complete the verification
                      process
                    </p>
                  </div>
                  <Button
                    onClick={completeDelivery}
                    disabled={isVerifying}
                    className="w-full md:w-auto"
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Delivered
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Button variant="outline" onClick={resetVerification}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verify Another Order
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error step
  if (currentStep === "error") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600">
              Verification Failed
            </h1>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please check the code or QR code and try again
                </p>
                <Button onClick={resetVerification}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
