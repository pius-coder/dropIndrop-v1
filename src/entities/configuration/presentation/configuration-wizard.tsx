"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Settings,
  MessageSquare,
  CreditCard,
  Bell,
  ArrowLeft,
  ArrowRight,
  Save,
  TestTube,
} from "lucide-react";
import {
  Configuration,
  GeneralSettings,
  WhatsAppSettings,
  PaymentSettings,
  NotificationSettings,
  PaymentProvider,
  CreateConfigurationData,
  UpdateConfigurationData,
} from "../domain/configuration";

// Wizard step definitions
const WIZARD_STEPS = [
  {
    id: "general",
    title: "General Settings",
    description: "Basic platform information",
    icon: Settings,
  },
  {
    id: "whatsapp",
    title: "WhatsApp Configuration",
    description: "WAHA integration settings",
    icon: MessageSquare,
  },
  {
    id: "payments",
    title: "Payment Settings",
    description: "Payment provider configuration",
    icon: CreditCard,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Notification preferences",
    icon: Bell,
  },
];

interface ConfigurationWizardProps {
  initialData?: Configuration;
  onComplete?: (config: Configuration) => void;
  onCancel?: () => void;
}

export function ConfigurationWizard({
  initialData,
  onComplete,
  onCancel,
}: ConfigurationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [connectionTests, setConnectionTests] = useState<
    Record<string, boolean>
  >({});

  // Form state
  const [formData, setFormData] = useState<CreateConfigurationData>({
    general: {
      siteName: "",
      siteDescription: "",
      contactEmail: "",
      supportPhone: "",
      businessAddress: "",
      timezone: "Africa/Douala",
      currency: "XAF",
      language: "en",
    },
    whatsapp: {
      apiUrl: "http://localhost:8000",
      apiKey: "admin",
      sessionName: "default",
      businessNumber: "+237600000000",
      welcomeMessage: "Welcome to DropInDrop! How can we help you today?",
      autoReplyEnabled: false,
      businessHours: {
        enabled: false,
        timezone: "Africa/Douala",
        monday: { enabled: true, open: "08:00", close: "18:00" },
        tuesday: { enabled: true, open: "08:00", close: "18:00" },
        wednesday: { enabled: true, open: "08:00", close: "18:00" },
        thursday: { enabled: true, open: "08:00", close: "18:00" },
        friday: { enabled: true, open: "08:00", close: "18:00" },
        saturday: { enabled: false, open: "09:00", close: "15:00" },
        sunday: { enabled: false, open: "09:00", close: "15:00" },
      },
    },
    payments: {
      provider: PaymentProvider.MOCK,
      enabled: true,
      testMode: true,
      supportedCurrencies: ["XAF", "USD", "EUR"],
      minAmount: 100,
      maxAmount: 1000000,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      orderUpdates: true,
      deliveryUpdates: true,
      promotionalMessages: false,
    },
  });

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        general: initialData.general,
        whatsapp: initialData.whatsapp,
        payments: initialData.payments,
        notifications: initialData.notifications,
      });
    }
  }, [initialData]);

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    const stepId = WIZARD_STEPS[step].id;

    switch (stepId) {
      case "general":
        if (!formData.general.siteName.trim()) {
          newErrors.siteName = "Site name is required";
        }
        if (!formData.general.contactEmail.trim()) {
          newErrors.contactEmail = "Contact email is required";
        } else if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.general.contactEmail)
        ) {
          newErrors.contactEmail = "Invalid email format";
        }
        if (!formData.general.currency.trim()) {
          newErrors.currency = "Currency is required";
        }
        break;

      case "whatsapp":
        if (!formData.whatsapp.apiUrl.trim()) {
          newErrors.whatsappApiUrl = "WhatsApp API URL is required";
        }
        if (!formData.whatsapp.businessNumber.trim()) {
          newErrors.businessNumber = "Business number is required";
        }
        break;

      case "payments":
        if (formData.payments.minAmount < 0) {
          newErrors.minAmount = "Minimum amount cannot be negative";
        }
        if (formData.payments.maxAmount <= formData.payments.minAmount) {
          newErrors.maxAmount = "Maximum amount must be greater than minimum";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow jumping to previous steps or current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Test connection functions
  const testWhatsAppConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/configuration/test/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData.whatsapp),
      });

      const result = await response.json();
      setConnectionTests((prev) => ({
        ...prev,
        whatsapp: result.success,
      }));

      if (result.success) {
        alert("WhatsApp connection test successful!");
      } else {
        alert(`WhatsApp connection test failed: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to test WhatsApp connection");
    } finally {
      setIsLoading(false);
    }
  };

  const testPaymentConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/configuration/test/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData.payments),
      });

      const result = await response.json();
      setConnectionTests((prev) => ({
        ...prev,
        payment: result.success,
      }));

      if (result.success) {
        alert("Payment connection test successful!");
      } else {
        alert(`Payment connection test failed: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to test payment connection");
    } finally {
      setIsLoading(false);
    }
  };

  // Save configuration
  const handleSave = async () => {
    // Validate all steps before saving
    for (let i = 0; i < WIZARD_STEPS.length; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        return;
      }
    }

    setIsSaving(true);
    try {
      const isUpdate = !!initialData;
      const url = "/api/admin/configuration";
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        if (onComplete) {
          onComplete(result.data);
        }
        router.push("/admin/dashboard");
      } else {
        alert(`Failed to save configuration: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteSetup = async () => {
    setIsSaving(true);
    try {
      // First, ensure configuration is saved
      await handleSave();

      // Then mark as complete
      const response = await fetch("/api/admin/configuration/complete", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        alert("Setup completed successfully!");
        // Force a page reload to update the layout and navigation
        window.location.href = "/admin/dashboard";
      } else {
        alert(`Failed to complete setup: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to complete setup");
    } finally {
      setIsSaving(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    const step = WIZARD_STEPS[currentStep];

    switch (step.id) {
      case "general":
        return (
          <GeneralSettingsStep
            data={formData.general}
            onChange={(general) =>
              setFormData((prev) => ({ ...prev, general }))
            }
            errors={errors}
          />
        );

      case "whatsapp":
        return (
          <WhatsAppSettingsStep
            data={formData.whatsapp}
            onChange={(whatsapp) =>
              setFormData((prev) => ({ ...prev, whatsapp }))
            }
            errors={errors}
            onTestConnection={testWhatsAppConnection}
            isTesting={isLoading}
            testResult={connectionTests.whatsapp}
          />
        );

      case "payments":
        return (
          <PaymentSettingsStep
            data={formData.payments}
            onChange={(payments) =>
              setFormData((prev) => ({ ...prev, payments }))
            }
            errors={errors}
            onTestConnection={testPaymentConnection}
            isTesting={isLoading}
            testResult={connectionTests.payment}
          />
        );

      case "notifications":
        return (
          <NotificationSettingsStep
            data={formData.notifications}
            onChange={(notifications) =>
              setFormData((prev) => ({ ...prev, notifications }))
            }
            errors={errors}
          />
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Platform Configuration</h1>
        <p className="text-muted-foreground">
          Configure your DropInDrop platform settings and integrations
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Step Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-2">
          {WIZARD_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : isCompleted
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
                disabled={index > currentStep}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            {React.createElement(WIZARD_STEPS[currentStep].icon, {
              className: "w-5 h-5",
            })}
            <div>
              <CardTitle>{WIZARD_STEPS[currentStep].title}</CardTitle>
              <CardDescription>
                {WIZARD_STEPS[currentStep].description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        <div className="space-x-2">
          {currentStep === WIZARD_STEPS.length - 1 ? (
            <>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>

              <Button onClick={handleCompleteSetup} disabled={isSaving}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSaving ? "Completing..." : "Complete Setup"}
              </Button>
            </>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Individual step components
function GeneralSettingsStep({
  data,
  onChange,
  errors,
}: {
  data: GeneralSettings;
  onChange: (data: GeneralSettings) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="siteName">Site Name *</Label>
          <Input
            id="siteName"
            value={data.siteName}
            onChange={(e) => onChange({ ...data, siteName: e.target.value })}
            placeholder="DropInDrop"
            className={errors.siteName ? "border-red-500" : ""}
          />
          {errors.siteName && (
            <p className="text-sm text-red-500">{errors.siteName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={data.contactEmail}
            onChange={(e) =>
              onChange({ ...data, contactEmail: e.target.value })
            }
            placeholder="support@dropindrop.com"
            className={errors.contactEmail ? "border-red-500" : ""}
          />
          {errors.contactEmail && (
            <p className="text-sm text-red-500">{errors.contactEmail}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportPhone">Support Phone</Label>
          <Input
            id="supportPhone"
            value={data.supportPhone}
            onChange={(e) =>
              onChange({ ...data, supportPhone: e.target.value })
            }
            placeholder="+237600000000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={data.currency}
            onValueChange={(currency) => onChange({ ...data, currency })}
          >
            <SelectTrigger className={errors.currency ? "border-red-500" : ""}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="XAF">
                XAF - Central African CFA Franc
              </SelectItem>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
            </SelectContent>
          </Select>
          {errors.currency && (
            <p className="text-sm text-red-500">{errors.currency}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={data.timezone}
            onValueChange={(timezone) => onChange({ ...data, timezone })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Africa/Douala">
                Africa/Douala (UTC+1)
              </SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={data.language}
            onValueChange={(language) => onChange({ ...data, language })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="siteDescription">Site Description</Label>
        <Textarea
          id="siteDescription"
          value={data.siteDescription}
          onChange={(e) =>
            onChange({ ...data, siteDescription: e.target.value })
          }
          placeholder="WhatsApp E-commerce platform for drops and deliveries"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessAddress">Business Address</Label>
        <Textarea
          id="businessAddress"
          value={data.businessAddress}
          onChange={(e) =>
            onChange({ ...data, businessAddress: e.target.value })
          }
          placeholder="Your business address"
          rows={2}
        />
      </div>
    </div>
  );
}

function WhatsAppSettingsStep({
  data,
  onChange,
  errors,
  onTestConnection,
  isTesting,
  testResult,
}: {
  data: WhatsAppSettings;
  onChange: (data: WhatsAppSettings) => void;
  errors: Record<string, string>;
  onTestConnection: () => void;
  isTesting: boolean;
  testResult?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="whatsappApiUrl">WAHA API URL *</Label>
          <Input
            id="whatsappApiUrl"
            value={data.apiUrl}
            onChange={(e) => onChange({ ...data, apiUrl: e.target.value })}
            placeholder="http://localhost:8000"
            className={errors.whatsappApiUrl ? "border-red-500" : ""}
          />
          {errors.whatsappApiUrl && (
            <p className="text-sm text-red-500">{errors.whatsappApiUrl}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsappApiKey">WAHA API Key *</Label>
          <Input
            id="whatsappApiKey"
            value={data.apiKey}
            onChange={(e) => onChange({ ...data, apiKey: e.target.value })}
            placeholder="admin"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsappSessionName">Session Name</Label>
          <Input
            id="whatsappSessionName"
            value={data.sessionName}
            onChange={(e) => onChange({ ...data, sessionName: e.target.value })}
            placeholder="default"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessNumber">Business Number *</Label>
          <Input
            id="businessNumber"
            value={data.businessNumber}
            onChange={(e) =>
              onChange({ ...data, businessNumber: e.target.value })
            }
            placeholder="+237600000000"
            className={errors.businessNumber ? "border-red-500" : ""}
          />
          {errors.businessNumber && (
            <p className="text-sm text-red-500">{errors.businessNumber}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="welcomeMessage">Welcome Message</Label>
        <Textarea
          id="welcomeMessage"
          value={data.welcomeMessage}
          onChange={(e) =>
            onChange({ ...data, welcomeMessage: e.target.value })
          }
          placeholder="Welcome to DropInDrop! How can we help you today?"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="autoReplyEnabled"
          checked={data.autoReplyEnabled}
          onCheckedChange={(autoReplyEnabled) =>
            onChange({ ...data, autoReplyEnabled })
          }
        />
        <Label htmlFor="autoReplyEnabled">Enable Auto-Reply</Label>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">Connection Test</h4>
          <p className="text-sm text-muted-foreground">
            Test your WhatsApp WAHA connection
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {testResult !== undefined && (
            <Badge variant={testResult ? "default" : "destructive"}>
              {testResult ? "Connected" : "Failed"}
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onTestConnection}
            disabled={isTesting}
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isTesting ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaymentSettingsStep({
  data,
  onChange,
  errors,
  onTestConnection,
  isTesting,
  testResult,
}: {
  data: PaymentSettings;
  onChange: (data: PaymentSettings) => void;
  errors: Record<string, string>;
  onTestConnection: () => void;
  isTesting: boolean;
  testResult?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentProvider">Payment Provider</Label>
          <Select
            value={data.provider}
            onValueChange={(provider: PaymentProvider) =>
              onChange({ ...data, provider })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PaymentProvider.MOCK}>
                Mock (Development)
              </SelectItem>
              <SelectItem value={PaymentProvider.STRIPE}>Stripe</SelectItem>
              <SelectItem value={PaymentProvider.MTN_MOMO}>MTN MoMo</SelectItem>
              <SelectItem value={PaymentProvider.ORANGE_MONEY}>
                Orange Money
              </SelectItem>
              <SelectItem value={PaymentProvider.LYGOS}>Lygos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="paymentEnabled"
            checked={data.enabled}
            onCheckedChange={(enabled) => onChange({ ...data, enabled })}
          />
          <Label htmlFor="paymentEnabled">Enable Payments</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="testMode"
            checked={data.testMode}
            onCheckedChange={(testMode) => onChange({ ...data, testMode })}
          />
          <Label htmlFor="testMode">Test Mode</Label>
        </div>
      </div>

      {/* Lygos-specific configuration */}
      {data.provider === PaymentProvider.LYGOS && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium">Lygos Configuration</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lygosApiKey">Lygos API Key</Label>
                <Input
                  id="lygosApiKey"
                  type="password"
                  value={data.lygosApiKey || ""}
                  onChange={(e) =>
                    onChange({ ...data, lygosApiKey: e.target.value })
                  }
                  placeholder="Enter your Lygos API key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lygosShopName">Shop Name</Label>
                <Input
                  id="lygosShopName"
                  value={data.lygosShopName || ""}
                  onChange={(e) =>
                    onChange({ ...data, lygosShopName: e.target.value })
                  }
                  placeholder="Your shop name"
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minAmount">Minimum Amount (XAF)</Label>
          <Input
            id="minAmount"
            type="number"
            value={data.minAmount}
            onChange={(e) =>
              onChange({ ...data, minAmount: Number(e.target.value) })
            }
            className={errors.minAmount ? "border-red-500" : ""}
          />
          {errors.minAmount && (
            <p className="text-sm text-red-500">{errors.minAmount}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxAmount">Maximum Amount (XAF)</Label>
          <Input
            id="maxAmount"
            type="number"
            value={data.maxAmount}
            onChange={(e) =>
              onChange({ ...data, maxAmount: Number(e.target.value) })
            }
            className={errors.maxAmount ? "border-red-500" : ""}
          />
          {errors.maxAmount && (
            <p className="text-sm text-red-500">{errors.maxAmount}</p>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">Connection Test</h4>
          <p className="text-sm text-muted-foreground">
            Test your payment provider connection
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {testResult !== undefined && (
            <Badge variant={testResult ? "default" : "destructive"}>
              {testResult ? "Connected" : "Failed"}
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onTestConnection}
            disabled={isTesting}
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isTesting ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettingsStep({
  data,
  onChange,
  errors,
}: {
  data: NotificationSettings;
  onChange: (data: NotificationSettings) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Send notifications via email
            </p>
          </div>
          <Switch
            checked={data.emailNotifications}
            onCheckedChange={(emailNotifications) =>
              onChange({ ...data, emailNotifications })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>SMS Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Send notifications via SMS
            </p>
          </div>
          <Switch
            checked={data.smsNotifications}
            onCheckedChange={(smsNotifications) =>
              onChange({ ...data, smsNotifications })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>WhatsApp Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Send notifications via WhatsApp
            </p>
          </div>
          <Switch
            checked={data.whatsappNotifications}
            onCheckedChange={(whatsappNotifications) =>
              onChange({ ...data, whatsappNotifications })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Order Updates</Label>
            <p className="text-sm text-muted-foreground">
              Notify customers about order status changes
            </p>
          </div>
          <Switch
            checked={data.orderUpdates}
            onCheckedChange={(orderUpdates) =>
              onChange({ ...data, orderUpdates })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Delivery Updates</Label>
            <p className="text-sm text-muted-foreground">
              Notify customers about delivery status
            </p>
          </div>
          <Switch
            checked={data.deliveryUpdates}
            onCheckedChange={(deliveryUpdates) =>
              onChange({ ...data, deliveryUpdates })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Promotional Messages</Label>
            <p className="text-sm text-muted-foreground">
              Send promotional offers and announcements
            </p>
          </div>
          <Switch
            checked={data.promotionalMessages}
            onCheckedChange={(promotionalMessages) =>
              onChange({ ...data, promotionalMessages })
            }
          />
        </div>
      </div>
    </div>
  );
}
