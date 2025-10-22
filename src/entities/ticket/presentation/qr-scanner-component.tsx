"use client";

import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Camera, CameraOff, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";

export interface QRScannerRef {
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  isScanning: boolean;
}

interface QRScannerProps {
  onQRCodeScanned: (qrCodeData: string) => void;
  onError?: (error: string) => void;
  className?: string;
  title?: string;
  description?: string;
}

export const QRScanner = forwardRef<QRScannerRef, QRScannerProps>(
  (
    {
      onQRCodeScanned,
      onError,
      className,
      title = "Scan QR Code",
      description,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      startScanning,
      stopScanning,
      isScanning,
    }));

    const startScanning = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Use back camera on mobile
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setHasPermission(true);
          setIsScanning(true);

          // Start scanning when video is ready
          videoRef.current.onloadedmetadata = () => {
            scanQRCode();
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to access camera";
        setError(errorMessage);
        setHasPermission(false);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    const stopScanning = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsScanning(false);
    };

    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for QR code detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Simple QR code detection (in a real implementation, you'd use a proper QR library)
      // For now, we'll simulate QR code detection
      detectQRCode(imageData);

      // Continue scanning
      if (isScanning) {
        requestAnimationFrame(scanQRCode);
      }
    };

    const detectQRCode = (imageData: ImageData) => {
      // This is a simplified QR code detection
      // In a real implementation, you would use a proper QR code scanning library
      // like qr-scanner, @zxing/library, or jsQR
      // For demo purposes, we'll simulate finding a QR code after a few seconds
      // In production, replace this with actual QR code detection logic
      // Example of how you would integrate a real QR scanner:
      /*
      import QrScanner from 'qr-scanner';

      const qrScanner = new QrScanner(
        videoRef.current!,
        (result) => {
          onQRCodeScanned(result.data);
          stopScanning();
        },
        {
          onDecodeError: (err) => {
            // Handle decode errors
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScanner.start();
      */
    };

    useEffect(() => {
      return () => {
        stopScanning();
      };
    }, []);

    const handleRetry = () => {
      setError(null);
      setHasPermission(null);
      startScanning();
    };

    if (error) {
      return (
        <Card className={cn("w-full max-w-md mx-auto", className)}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={handleRetry} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: "none" }}
            />

            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center space-y-2">
                  <CameraOff className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isLoading
                      ? "Starting camera..."
                      : "Click start to begin scanning"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                className="flex-1"
                disabled={isLoading}
              >
                <Camera className="h-4 w-4 mr-2" />
                {isLoading ? "Starting..." : "Start Scanning"}
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="outline"
                className="flex-1"
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Scanning
              </Button>
            )}
          </div>

          {isScanning && (
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                Position a QR code within the camera view. The scanner will
                automatically detect and process it.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }
);

QRScanner.displayName = "QRScanner";
