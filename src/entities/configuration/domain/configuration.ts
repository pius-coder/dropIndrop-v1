import {
  BaseEntity,
  Result,
  ValidationResult,
  ValidationError,
  ConflictError,
} from "../../../lib/domain";

// Configuration types
export interface PlatformConfiguration {
  general: GeneralSettings;
  whatsapp: WhatsAppSettings;
  payments: PaymentSettings;
  notifications: NotificationSettings;
}

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  businessAddress: string;
  timezone: string;
  currency: string;
  language: string;
}

export interface WhatsAppSettings {
  apiUrl: string;
  apiKey: string;
  sessionName: string;
  businessNumber: string;
  welcomeMessage: string;
  autoReplyEnabled: boolean;
  businessHours: BusinessHours;
}

export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  enabled: boolean;
  open: string; // HH:MM format
  close: string; // HH:MM format
}

export interface PaymentSettings {
  provider: PaymentProvider;
  enabled: boolean;
  testMode: boolean;
  supportedCurrencies: string[];
  minAmount: number;
  maxAmount: number;
  lygosApiKey?: string;
  lygosShopName?: string;
}

export enum PaymentProvider {
  STRIPE = "stripe",
  MTN_MOMO = "mtn_momo",
  ORANGE_MONEY = "orange_money",
  LYGOS = "lygos",
  MOCK = "mock",
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  promotionalMessages: boolean;
}

export interface CreateConfigurationData {
  general: GeneralSettings;
  whatsapp: WhatsAppSettings;
  payments: PaymentSettings;
  notifications: NotificationSettings;
}

export interface UpdateConfigurationData {
  general?: Partial<GeneralSettings>;
  whatsapp?: Partial<WhatsAppSettings>;
  payments?: Partial<PaymentSettings>;
  notifications?: Partial<NotificationSettings>;
}

// Configuration domain entity
export class Configuration extends BaseEntity {
  public readonly general: GeneralSettings;
  public readonly whatsapp: WhatsAppSettings;
  public readonly payments: PaymentSettings;
  public readonly notifications: NotificationSettings;
  public readonly isComplete: boolean;
  public readonly setupCompletedAt?: Date;

  constructor(
    id: string,
    general: GeneralSettings,
    whatsapp: WhatsAppSettings,
    payments: PaymentSettings,
    notifications: NotificationSettings,
    isComplete: boolean = false,
    setupCompletedAt?: Date,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.general = general;
    this.whatsapp = whatsapp;
    this.payments = payments;
    this.notifications = notifications;
    this.isComplete = isComplete;
    this.setupCompletedAt = setupCompletedAt;
  }

  // Business logic methods
  public isSetupComplete(): boolean {
    return this.isComplete && this.setupCompletedAt !== undefined;
  }

  public markSetupComplete(): Configuration {
    return new Configuration(
      this.id,
      this.general,
      this.whatsapp,
      this.payments,
      this.notifications,
      true,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  public updateConfiguration(
    updates: UpdateConfigurationData
  ): Result<Configuration> {
    // Validate updates
    const validation = this.validateUpdates(updates);
    if (!validation.isValid) {
      return {
        success: false,
        error: new ValidationError(validation.errors.join(", ")),
      };
    }

    // Apply updates
    const updatedConfig = new Configuration(
      this.id,
      { ...this.general, ...updates.general },
      { ...this.whatsapp, ...updates.whatsapp },
      { ...this.payments, ...updates.payments },
      { ...this.notifications, ...updates.notifications },
      this.isComplete,
      this.setupCompletedAt,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedConfig,
    };
  }

  public validateWhatsAppConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.whatsapp.apiUrl) {
      errors.push("WhatsApp API URL is required");
    }

    if (!this.whatsapp.businessNumber) {
      errors.push("WhatsApp business number is required");
    }

    if (
      this.whatsapp.businessNumber &&
      !/^\+[1-9]\d{1,14}$/.test(this.whatsapp.businessNumber)
    ) {
      errors.push("WhatsApp business number must include country code");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public validatePaymentConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.payments.provider) {
      errors.push("Payment provider is required");
    }

    if (this.payments.minAmount < 0) {
      errors.push("Minimum payment amount cannot be negative");
    }

    if (this.payments.maxAmount <= this.payments.minAmount) {
      errors.push("Maximum payment amount must be greater than minimum");
    }

    if (this.payments.minAmount >= this.payments.maxAmount) {
      errors.push("Minimum payment amount must be less than maximum");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public isBusinessHours(): boolean {
    if (!this.whatsapp.businessHours.enabled) {
      return true; // 24/7 if business hours disabled
    }

    const now = new Date();
    const userTimezone = this.general.timezone || "UTC";
    const userTime = new Date(
      now.toLocaleString("en-US", { timeZone: userTimezone })
    );

    const dayOfWeek = userTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = userTime.toTimeString().slice(0, 5); // HH:MM format

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ] as const;
    const dayHours = this.whatsapp.businessHours[dayNames[dayOfWeek]];

    if (!dayHours.enabled) {
      return false;
    }

    return currentTime >= dayHours.open && currentTime <= dayHours.close;
  }

  // Validation methods
  private validateUpdates(updates: UpdateConfigurationData): ValidationResult {
    const errors: string[] = [];

    // Validate general settings
    if (updates.general) {
      if (updates.general.siteName && updates.general.siteName.length < 3) {
        errors.push("Site name must be at least 3 characters long");
      }

      if (
        updates.general.contactEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.general.contactEmail)
      ) {
        errors.push("Invalid contact email format");
      }

      if (
        updates.general.currency &&
        !/^[A-Z]{3}$/.test(updates.general.currency)
      ) {
        errors.push("Currency must be a 3-letter code (e.g., XAF, USD)");
      }
    }

    // Validate WhatsApp settings
    if (updates.whatsapp) {
      const whatsappValidation = this.validateWhatsAppConfiguration();
      errors.push(...whatsappValidation.errors);
    }

    // Validate payment settings
    if (updates.payments) {
      const paymentValidation = this.validatePaymentConfiguration();
      errors.push(...paymentValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateCreateData(
    data: CreateConfigurationData
  ): ValidationResult {
    const errors: string[] = [];

    // Validate general settings
    if (!data.general.siteName || data.general.siteName.length < 3) {
      errors.push("Site name must be at least 3 characters long");
    }

    if (
      !data.general.contactEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.general.contactEmail)
    ) {
      errors.push("Valid contact email is required");
    }

    if (!data.general.currency || !/^[A-Z]{3}$/.test(data.general.currency)) {
      errors.push("Valid currency code is required (e.g., XAF, USD)");
    }

    // Validate WhatsApp settings
    if (!data.whatsapp.apiUrl) {
      errors.push("WhatsApp API URL is required");
    }

    if (
      !data.whatsapp.businessNumber ||
      !/^\+[1-9]\d{1,14}$/.test(data.whatsapp.businessNumber)
    ) {
      errors.push("Valid WhatsApp business number is required");
    }

    // Validate payment settings
    if (!data.payments.provider) {
      errors.push("Payment provider is required");
    }

    if (data.payments.minAmount < 0) {
      errors.push("Minimum payment amount cannot be negative");
    }

    if (data.payments.minAmount >= data.payments.maxAmount) {
      errors.push("Minimum payment amount must be less than maximum");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Factory methods for creating default configurations
  public static createDefault(): Configuration {
    const defaultGeneral: GeneralSettings = {
      siteName: "DropInDrop",
      siteDescription: "WhatsApp E-commerce Platform",
      contactEmail: "support@dropindrop.com",
      supportPhone: "+237600000000",
      businessAddress: "Cameroon",
      timezone: "Africa/Douala",
      currency: "XAF",
      language: "en",
    };

    const defaultWhatsApp: WhatsAppSettings = {
      apiUrl: "http://localhost:8000",
      apiKey: "admin",
      sessionName: "default",
      businessNumber: "+237600000000",
      welcomeMessage: "Welcome to DropInDrop! How can we help you today?",
      autoReplyEnabled: true,
      businessHours: {
        enabled: false, // 24/7 by default
        timezone: "Africa/Douala",
        monday: { enabled: true, open: "08:00", close: "18:00" },
        tuesday: { enabled: true, open: "08:00", close: "18:00" },
        wednesday: { enabled: true, open: "08:00", close: "18:00" },
        thursday: { enabled: true, open: "08:00", close: "18:00" },
        friday: { enabled: true, open: "08:00", close: "18:00" },
        saturday: { enabled: false, open: "09:00", close: "15:00" },
        sunday: { enabled: false, open: "09:00", close: "15:00" },
      },
    };

    const defaultPayments: PaymentSettings = {
      provider: PaymentProvider.MOCK,
      enabled: true,
      testMode: true,
      supportedCurrencies: ["XAF", "USD", "EUR"],
      minAmount: 100,
      maxAmount: 1000000,
    };

    const defaultNotifications: NotificationSettings = {
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      orderUpdates: true,
      deliveryUpdates: true,
      promotionalMessages: false,
    };

    return new Configuration(
      "default-config",
      defaultGeneral,
      defaultWhatsApp,
      defaultPayments,
      defaultNotifications,
      false,
      undefined
    );
  }
}

// Value objects for configuration domain
export class BusinessHoursConfig {
  constructor(
    public readonly enabled: boolean,
    public readonly timezone: string,
    public readonly schedule: Record<string, DayHours>
  ) {}

  public isOpen(date: Date = new Date()): boolean {
    if (!this.enabled) return true;

    const dayOfWeek = date.getDay();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[dayOfWeek];
    const dayHours = this.schedule[dayName];

    if (!dayHours?.enabled) return false;

    const currentTime = date.toTimeString().slice(0, 5);
    return currentTime >= dayHours.open && currentTime <= dayHours.close;
  }
}

export class PaymentProviderConfig {
  constructor(
    public readonly provider: PaymentProvider,
    public readonly enabled: boolean,
    public readonly testMode: boolean,
    public readonly supportedCurrencies: string[],
    public readonly minAmount: number,
    public readonly maxAmount: number
  ) {}

  public isAmountValid(amount: number): boolean {
    return amount >= this.minAmount && amount <= this.maxAmount;
  }

  public supportsCurrency(currency: string): boolean {
    return this.supportedCurrencies.includes(currency.toUpperCase());
  }
}
