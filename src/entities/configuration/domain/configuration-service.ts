import {
  Configuration,
  CreateConfigurationData,
  UpdateConfigurationData,
  PlatformConfiguration,
  PaymentProvider,
} from "./configuration";
import {
  Result,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../../lib/domain";

// Service interfaces
export interface IConfigurationRepository {
  findById(id: string): Promise<Configuration | null>;
  create(config: Configuration): Promise<Configuration>;
  update(id: string, config: Configuration): Promise<Configuration>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

export interface IConfigurationService {
  getConfiguration(id?: string): Promise<Result<Configuration>>;
  createConfiguration(
    data: CreateConfigurationData
  ): Promise<Result<Configuration>>;
  updateConfiguration(
    id: string,
    data: UpdateConfigurationData
  ): Promise<Result<Configuration>>;
  completeSetup(id: string): Promise<Result<Configuration>>;
  validateConfiguration(config: Configuration): Result<boolean>;
  getDefaultConfiguration(): Configuration;
}

/**
 * Configuration service for managing platform settings
 * Handles business logic for configuration operations
 */
export class ConfigurationService implements IConfigurationService {
  constructor(private readonly repository: IConfigurationRepository) {}

  /**
   * Get configuration by ID or get the first available configuration
   */
  async getConfiguration(id?: string): Promise<Result<Configuration>> {
    try {
      // If no ID provided, try to find any existing configuration
      if (!id) {
        // For now, we'll use a single configuration approach
        // In the future, this could be enhanced to support multiple configurations
        const config = await this.repository.findById("main");
        if (config) {
          return {
            success: true,
            data: config,
          };
        }

        // No configuration found, return error to trigger form display
        return {
          success: false,
          error: new NotFoundError("Configuration", "main"),
        };
      }

      const config = await this.repository.findById(id);
      if (!config) {
        return {
          success: false,
          error: new NotFoundError("Configuration", id),
        };
      }

      return {
        success: true,
        data: config,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to get configuration"),
      };
    }
  }

  /**
   * Create new configuration
   */
  async createConfiguration(
    data: CreateConfigurationData
  ): Promise<Result<Configuration>> {
    try {
      // Check if configuration already exists
      const exists = await this.repository.exists("main");
      if (exists) {
        return {
          success: false,
          error: new ConflictError("Configuration already exists"),
        };
      }

      // Create configuration entity with real database ID
      const config = new Configuration(
        "main",
        data.general,
        data.whatsapp,
        data.payments,
        data.notifications,
        false,
        undefined
      );

      // Validate configuration
      const validation = this.validateConfiguration(config);
      if (!validation.success) {
        return validation;
      }

      // Save to repository
      const savedConfig = await this.repository.create(config);

      return {
        success: true,
        data: savedConfig,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to create configuration"),
      };
    }
  }

  /**
   * Update existing configuration
   */
  async updateConfiguration(
    id: string,
    data: UpdateConfigurationData
  ): Promise<Result<Configuration>> {
    try {
      const existingConfig = await this.repository.findById(id);
      if (!existingConfig) {
        return {
          success: false,
          error: new NotFoundError("Configuration", id),
        };
      }

      // Apply updates
      const updateResult = existingConfig.updateConfiguration(data);
      if (!updateResult.success) {
        return updateResult;
      }

      // Validate updated configuration
      const validation = this.validateConfiguration(updateResult.data);
      if (!validation.success) {
        return validation;
      }

      // Save to repository
      const savedConfig = await this.repository.update(id, updateResult.data);

      return {
        success: true,
        data: savedConfig,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to update configuration"),
      };
    }
  }

  /**
   * Mark setup as complete
   */
  async completeSetup(id: string = "main"): Promise<Result<Configuration>> {
    try {
      const config = await this.repository.findById(id);
      if (!config) {
        return {
          success: false,
          error: new NotFoundError("Configuration", id),
        };
      }

      // Validate that configuration is ready for completion
      const validation = this.validateConfiguration(config);
      if (!validation.success) {
        return {
          success: false,
          error: new ValidationError(
            "Configuration is not valid for completion"
          ),
        };
      }

      // Mark setup as complete
      const completedConfig = config.markSetupComplete();

      // Save to repository
      const savedConfig = await this.repository.update(id, completedConfig);

      return {
        success: true,
        data: savedConfig,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to complete setup"),
      };
    }
  }

  /**
   * Validate configuration completeness and correctness
   */
  validateConfiguration(config: Configuration): Result<boolean> {
    const errors: string[] = [];

    // Validate general settings
    if (!config.general.siteName || config.general.siteName.trim().length < 3) {
      errors.push("Site name must be at least 3 characters long");
    }

    if (
      !config.general.contactEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.general.contactEmail)
    ) {
      errors.push("Valid contact email is required");
    }

    if (
      !config.general.currency ||
      !/^[A-Z]{3}$/.test(config.general.currency)
    ) {
      errors.push("Valid currency code is required");
    }

    // Validate WhatsApp configuration
    const whatsappValidation = config.validateWhatsAppConfiguration();
    if (!whatsappValidation.valid) {
      errors.push(...whatsappValidation.errors);
    }

    // Validate payment configuration
    const paymentValidation = config.validatePaymentConfiguration();
    if (!paymentValidation.valid) {
      errors.push(...paymentValidation.errors);
    }

    // Check business logic requirements
    if (config.payments.enabled && !config.payments.provider) {
      errors.push(
        "Payment provider must be specified when payments are enabled"
      );
    }

    if (config.whatsapp.autoReplyEnabled && !config.whatsapp.welcomeMessage) {
      errors.push("Welcome message is required when auto-reply is enabled");
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: new ValidationError(errors.join(", ")),
      };
    }

    return { success: true, data: true };
  }

  /**
   * Get default configuration for new installations
   */
  getDefaultConfiguration(): Configuration {
    return Configuration.createDefault();
  }

  /**
   * Create a default configuration instance (static method for external access)
   */
  static getDefaultConfiguration(): Configuration {
    return Configuration.createDefault();
  }

  /**
   * Ensure a default configuration exists in the database
   * Creates one if it doesn't exist
   */
  async ensureDefaultConfiguration(): Promise<Configuration> {
    try {
      // Try to find existing configuration
      const existing = await this.repository.findById("main");
      if (existing) {
        return existing;
      }
      // Create default configuration data
      const defaultData = {
        general: {
          siteName: "DropInDrop",
          siteDescription: "WhatsApp E-commerce Platform",
          contactEmail: "admin@dropindrop.com",
          supportPhone: "+237600000000",
          businessAddress: "Cameroon",
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
      };

      // Create the configuration
      const result = await this.createConfiguration(defaultData);
      if (result.success) {
        return result.data;
      } else {
        throw new Error("Failed to create default configuration");
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if setup is required (no complete configuration exists)
   */
  async isSetupRequired(): Promise<boolean> {
    try {
      const config = await this.repository.findById("main");
      return !config || !config.isSetupComplete();
    } catch {
      return true;
    }
  }

  /**
   * Get platform configuration as a flat object for easy access
   */
  async getPlatformConfig(): Promise<Result<PlatformConfiguration>> {
    try {
      const configResult = await this.getConfiguration();
      if (!configResult.success) {
        return configResult;
      }

      return {
        success: true,
        data: {
          general: configResult.data.general,
          whatsapp: configResult.data.whatsapp,
          payments: configResult.data.payments,
          notifications: configResult.data.notifications,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to get platform configuration"),
      };
    }
  }

  /**
   * Test WhatsApp connectivity
   */
  async testWhatsAppConnection(): Promise<
    Result<{ connected: boolean; error?: string }>
  > {
    try {
      const configResult = await this.getConfiguration();
      if (!configResult.success) {
        return {
          success: false,
          error: new Error("Configuration not found"),
        };
      }

      // In a real implementation, this would test the actual WAHA connection
      // For now, we'll just validate the configuration
      const validation = configResult.data.validateWhatsAppConfiguration();

      if (!validation.valid) {
        return {
          success: false,
          error: new Error(validation.errors.join(", ")),
        };
      }

      return {
        success: true,
        data: { connected: true },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to test WhatsApp connection"),
      };
    }
  }

  /**
   * Test payment provider connectivity
   */
  async testPaymentProvider(): Promise<
    Result<{ connected: boolean; error?: string }>
  > {
    try {
      const configResult = await this.getConfiguration();
      if (!configResult.success) {
        return {
          success: false,
          error: new Error("Configuration not found"),
        };
      }

      // In a real implementation, this would test the actual payment provider connection
      // For now, we'll just validate the configuration
      const validation = configResult.data.validatePaymentConfiguration();

      if (!validation.valid) {
        return {
          success: false,
          error: new Error(validation.errors.join(", ")),
        };
      }

      return {
        success: true,
        data: { connected: true },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to test payment provider"),
      };
    }
  }

  /**
   * Get configuration health status
   */
  async getHealthStatus(): Promise<
    Result<{
      setupComplete: boolean;
      whatsappConnected: boolean;
      paymentProviderConnected: boolean;
      issues: string[];
    }>
  > {
    try {
      const configResult = await this.getConfiguration();
      if (!configResult.success) {
        return {
          success: false,
          error: new Error("Configuration not found"),
        };
      }

      const config = configResult.data;
      const issues: string[] = [];

      // Check setup completion
      const setupComplete = config.isSetupComplete();

      // Check WhatsApp configuration
      const whatsappValidation = config.validateWhatsAppConfiguration();
      const whatsappConnected = whatsappValidation.valid;

      if (!whatsappConnected) {
        issues.push(...whatsappValidation.errors);
      }

      // Check payment configuration
      const paymentValidation = config.validatePaymentConfiguration();
      const paymentProviderConnected = paymentValidation.valid;

      if (!paymentProviderConnected) {
        issues.push(...paymentValidation.errors);
      }

      return {
        success: true,
        data: {
          setupComplete,
          whatsappConnected,
          paymentProviderConnected,
          issues,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to get health status"),
      };
    }
  }
}
