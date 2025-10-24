"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfigurationWizard } from "../../../entities/configuration/presentation/configuration-wizard";
import { Configuration } from "../../../entities/configuration/domain/configuration";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  CheckCircle,
  AlertCircle,
  Edit,
  TestTube,
} from "lucide-react";

export default function AdminConfigurationPage() {
  const router = useRouter();
  const [configuration, setConfiguration] = useState<Configuration | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [connectionTests, setConnectionTests] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await fetch("/api/admin/configuration");
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setConfiguration(data.data);
        }
      } else if (response.status === 404) {
        // No configuration found, this is expected for new installations
        console.log("No configuration found, showing setup form");
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigurationComplete = (config: Configuration) => {
    setConfiguration(config);
    setIsEditing(false);
    // Force a full page reload to update layout and navigation
    window.location.href = "/admin/configuration";
  };

  const handleEditConfiguration = () => {
    setIsEditing(true);
  };

  const handleTestWhatsApp = async () => {
    if (!configuration) return;

    try {
      const response = await fetch("/api/admin/configuration/test/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configuration.whatsapp),
      });

      const result = await response.json();
      setConnectionTests((prev) => ({
        ...prev,
        whatsapp: result.success,
      }));

      alert(
        result.success
          ? "WhatsApp connection successful!"
          : `WhatsApp connection failed: ${result.error}`
      );
    } catch (error) {
      alert("Failed to test WhatsApp connection");
    }
  };

  const handleTestPayment = async () => {
    if (!configuration) return;

    try {
      const response = await fetch("/api/admin/configuration/test/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configuration.payments),
      });

      const result = await response.json();
      setConnectionTests((prev) => ({
        ...prev,
        payment: result.success,
      }));

      alert(
        result.success
          ? "Payment connection successful!"
          : `Payment connection failed: ${result.error}`
      );
    } catch (error) {
      alert("Failed to test payment connection");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no configuration exists or user wants to edit, show wizard
  if (!configuration || isEditing) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Platform Configuration</h1>
          <p className="text-muted-foreground">
            {configuration
              ? "Edit your platform settings"
              : "Set up your DropInDrop platform"}
          </p>
        </div>

        <ConfigurationWizard
          initialData={configuration || undefined}
          onComplete={handleConfigurationComplete}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // Show configuration overview
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-col gap-1.5">
        <div>
          <h1 className="text-3xl font-bold">Configuration</h1>
          <p className="text-muted-foreground">
            Manage your platform settings and integrations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {configuration.isComplete ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Setup Complete
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-200"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Setup Incomplete
            </Badge>
          )}

          <Button onClick={handleEditConfiguration}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Configuration
          </Button>
        </div>
      </div>

      {/* Configuration Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>General Settings</span>
            </CardTitle>
            <CardDescription>
              Basic platform information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Site Name
                </p>
                <p className="font-medium">{configuration.general.siteName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contact Email
                </p>
                <p className="font-medium">
                  {configuration.general.contactEmail}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Currency
                </p>
                <p className="font-medium">{configuration.general.currency}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Timezone
                </p>
                <p className="font-medium">{configuration.general.timezone}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Description
              </p>
              <p className="text-sm">{configuration.general.siteDescription}</p>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>WhatsApp Integration</span>
              </div>

              <div className="flex items-center space-x-2">
                {connectionTests.whatsapp !== undefined && (
                  <Badge
                    variant={
                      connectionTests.whatsapp ? "default" : "destructive"
                    }
                  >
                    {connectionTests.whatsapp ? "Connected" : "Failed"}
                  </Badge>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestWhatsApp}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              WAHA API configuration and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  API URL
                </p>
                <p className="font-medium font-mono text-sm">
                  {configuration.whatsapp.apiUrl}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Business Number
                </p>
                <p className="font-medium">
                  {configuration.whatsapp.businessNumber}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Welcome Message
              </p>
              <p className="text-sm italic">
                "{configuration.whatsapp.welcomeMessage}"
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-Reply Enabled</span>
              <Badge
                variant={
                  configuration.whatsapp.autoReplyEnabled
                    ? "default"
                    : "secondary"
                }
              >
                {configuration.whatsapp.autoReplyEnabled
                  ? "Enabled"
                  : "Disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Payment Settings</span>
              </div>

              <div className="flex items-center space-x-2">
                {connectionTests.payment !== undefined && (
                  <Badge
                    variant={
                      connectionTests.payment ? "default" : "destructive"
                    }
                  >
                    {connectionTests.payment ? "Connected" : "Failed"}
                  </Badge>
                )}

                <Button variant="outline" size="sm" onClick={handleTestPayment}>
                  <TestTube className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>
            </CardTitle>
            <CardDescription>Payment provider configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Provider
                </p>
                <p className="font-medium">{configuration.payments.provider}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <Badge
                  variant={
                    configuration.payments.enabled ? "default" : "secondary"
                  }
                >
                  {configuration.payments.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Min Amount
                </p>
                <p className="font-medium">
                  {configuration.payments.minAmount}{" "}
                  {configuration.general.currency}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Max Amount
                </p>
                <p className="font-medium">
                  {configuration.payments.maxAmount}{" "}
                  {configuration.general.currency}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Test Mode</span>
              <Badge
                variant={
                  configuration.payments.testMode ? "outline" : "default"
                }
              >
                {configuration.payments.testMode ? "Test Mode" : "Live Mode"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Notification Settings</span>
            </CardTitle>
            <CardDescription>
              Notification preferences and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Notifications</span>
                <Badge
                  variant={
                    configuration.notifications.emailNotifications
                      ? "default"
                      : "secondary"
                  }
                >
                  {configuration.notifications.emailNotifications
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">SMS Notifications</span>
                <Badge
                  variant={
                    configuration.notifications.smsNotifications
                      ? "default"
                      : "secondary"
                  }
                >
                  {configuration.notifications.smsNotifications
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">WhatsApp Notifications</span>
                <Badge
                  variant={
                    configuration.notifications.whatsappNotifications
                      ? "default"
                      : "secondary"
                  }
                >
                  {configuration.notifications.whatsappNotifications
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Order Updates</span>
                <Badge
                  variant={
                    configuration.notifications.orderUpdates
                      ? "default"
                      : "secondary"
                  }
                >
                  {configuration.notifications.orderUpdates
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Delivery Updates</span>
                <Badge
                  variant={
                    configuration.notifications.deliveryUpdates
                      ? "default"
                      : "secondary"
                  }
                >
                  {configuration.notifications.deliveryUpdates
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Promotional Messages</span>
                <Badge
                  variant={
                    configuration.notifications.promotionalMessages
                      ? "default"
                      : "secondary"
                  }
                >
                  {configuration.notifications.promotionalMessages
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Completion */}
      {!configuration.isComplete && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Complete your setup</p>
                <p className="text-sm">
                  Click "Complete Setup" to mark your configuration as complete
                  and unlock all platform features.
                </p>
              </div>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch(
                      "/api/admin/configuration/complete",
                      {
                        method: "POST",
                      }
                    );
                    const result = await response.json();

                    if (result.success) {
                      alert("Setup completed successfully!");
                      // Force a full page reload to update layout and navigation
                      window.location.href = "/admin";
                    } else {
                      alert(`Failed to complete setup: ${result.error}`);
                    }
                  } catch (error) {
                    alert("Failed to complete setup");
                  }
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common configuration tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleEditConfiguration}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Configuration
            </Button>

            <Button variant="outline" onClick={handleTestWhatsApp}>
              <TestTube className="w-4 h-4 mr-2" />
              Test WhatsApp
            </Button>

            <Button variant="outline" onClick={handleTestPayment}>
              <TestTube className="w-4 h-4 mr-2" />
              Test Payment
            </Button>

            <Button variant="outline" onClick={() => router.push("/admin")}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
