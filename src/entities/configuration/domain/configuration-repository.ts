import {
  Configuration,
  GeneralSettings,
  WhatsAppSettings,
  PaymentSettings,
  NotificationSettings,
  PaymentProvider,
} from "./configuration";
import {
  PrismaClient,
  PaymentProvider as PrismaPaymentProvider,
  Prisma,
} from "@prisma/client";
import { IConfigurationRepository } from "./configuration-service";

/**
 * Prisma-based implementation of the configuration repository
 * Handles database operations for configuration entities
 */
export class ConfigurationRepository implements IConfigurationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find configuration by ID
   */
  async findById(id: string): Promise<Configuration | null> {
    try {
      const config = await this.prisma.configuration.findUnique({
        where: { id },
      });

      if (!config) {
        return null;
      }

      return this.mapPrismaToDomain(config);
    } catch (error) {
      console.error(
        `ConfigurationRepository: Error finding configuration ${id}:`,
        error
      );
      throw new Error(
        `Failed to find configuration by id ${id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create new configuration
   */
  async create(config: Configuration): Promise<Configuration> {
    try {
      const prismaData = this.mapDomainToPrisma(config);

      const prismaConfig = await this.prisma.configuration.create({
        data: prismaData,
      });

      return this.mapPrismaToDomain(prismaConfig);
    } catch (error) {
      console.error(
        `ConfigurationRepository: Error creating configuration:`,
        error
      );
      throw new Error(
        `Failed to create configuration: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update existing configuration
   */
  async update(id: string, config: Configuration): Promise<Configuration> {
    try {
      const prismaConfig = await this.prisma.configuration.update({
        where: { id },
        data: this.mapDomainToPrisma(config),
      });

      return this.mapPrismaToDomain(prismaConfig);
    } catch (error) {
      throw new Error(
        `Failed to update configuration ${id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete configuration by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.configuration.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete configuration ${id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Check if configuration exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.configuration.count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      throw new Error(
        `Failed to check if configuration exists ${id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Map Prisma configuration model to domain entity
   */
  private mapPrismaToDomain(prismaConfig: any): Configuration {
    const generalSettings: GeneralSettings = {
      siteName: prismaConfig.siteName,
      siteDescription: prismaConfig.siteDescription,
      contactEmail: prismaConfig.contactEmail,
      supportPhone: prismaConfig.supportPhone,
      businessAddress: prismaConfig.businessAddress,
      timezone: prismaConfig.timezone,
      currency: prismaConfig.currency,
      language: prismaConfig.language,
    };

    const whatsappSettings: WhatsAppSettings = {
      apiUrl: prismaConfig.whatsappApiUrl,
      apiKey: prismaConfig.whatsappApiKey,
      sessionName: prismaConfig.whatsappSessionName,
      businessNumber: prismaConfig.whatsappBusinessNumber,
      welcomeMessage: prismaConfig.whatsappWelcomeMessage,
      autoReplyEnabled: prismaConfig.whatsappAutoReplyEnabled,
      businessHours: prismaConfig.whatsappBusinessHours || {
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
    };

    const paymentSettings: PaymentSettings = {
      provider: prismaConfig.paymentProvider.toLowerCase() as PaymentProvider,
      enabled: prismaConfig.paymentEnabled,
      testMode: prismaConfig.paymentTestMode,
      supportedCurrencies: prismaConfig.paymentSupportedCurrencies || [
        "XAF",
        "USD",
        "EUR",
      ],
      minAmount: Number(prismaConfig.paymentMinAmount),
      maxAmount: Number(prismaConfig.paymentMaxAmount),
    };

    const notificationSettings: NotificationSettings = {
      emailNotifications: prismaConfig.emailNotifications,
      smsNotifications: prismaConfig.smsNotifications,
      whatsappNotifications: prismaConfig.whatsappNotifications,
      orderUpdates: prismaConfig.orderUpdates,
      deliveryUpdates: prismaConfig.deliveryUpdates,
      promotionalMessages: prismaConfig.promotionalMessages,
    };

    return new Configuration(
      prismaConfig.id,
      generalSettings,
      whatsappSettings,
      paymentSettings,
      notificationSettings,
      prismaConfig.isSetupComplete,
      prismaConfig.setupCompletedAt
    );
  }

  /**
   * Map domain entity to Prisma configuration model
   */
  private mapDomainToPrisma(
    config: Configuration
  ): Prisma.ConfigurationCreateInput {
    return {
      id: config.id,
      siteName: config.general.siteName,
      siteDescription: config.general.siteDescription,
      contactEmail: config.general.contactEmail,
      supportPhone: config.general.supportPhone,
      businessAddress: config.general.businessAddress,
      timezone: config.general.timezone,
      currency: config.general.currency,
      language: config.general.language,
      whatsappApiUrl: config.whatsapp.apiUrl,
      whatsappApiKey: config.whatsapp.apiKey,
      whatsappSessionName: config.whatsapp.sessionName,
      whatsappBusinessNumber: config.whatsapp.businessNumber,
      whatsappWelcomeMessage: config.whatsapp.welcomeMessage,
      whatsappAutoReplyEnabled: config.whatsapp.autoReplyEnabled,
      whatsappBusinessHoursEnabled: config.whatsapp.businessHours.enabled,
      whatsappBusinessHours: JSON.parse(
        JSON.stringify(config.whatsapp.businessHours)
      ),
      paymentProvider:
        config.payments.provider.toUpperCase() as PrismaPaymentProvider,
      paymentEnabled: config.payments.enabled,
      paymentTestMode: config.payments.testMode,
      paymentSupportedCurrencies: config.payments.supportedCurrencies,
      paymentMinAmount: config.payments.minAmount,
      paymentMaxAmount: config.payments.maxAmount,
      emailNotifications: config.notifications.emailNotifications,
      smsNotifications: config.notifications.smsNotifications,
      whatsappNotifications: config.notifications.whatsappNotifications,
      orderUpdates: config.notifications.orderUpdates,
      deliveryUpdates: config.notifications.deliveryUpdates,
      promotionalMessages: config.notifications.promotionalMessages,
      isSetupComplete: config.isSetupComplete(),
      setupCompletedAt: config.setupCompletedAt,
    };
  }
}
