import { z } from "zod";

// Business Hours Schema
export const DayHoursSchema = z.object({
  enabled: z.boolean(),
  open: z.string(), // HH:MM format
  close: z.string(), // HH:MM format
});

export const BusinessHoursSchema = z.object({
  enabled: z.boolean(),
  timezone: z.string(),
  monday: DayHoursSchema,
  tuesday: DayHoursSchema,
  wednesday: DayHoursSchema,
  thursday: DayHoursSchema,
  friday: DayHoursSchema,
  saturday: DayHoursSchema,
  sunday: DayHoursSchema,
});

// General Settings Schema
export const GeneralSettingsSchema = z.object({
  siteName: z.string(),
  siteDescription: z.string(),
  contactEmail: z.string(),
  supportPhone: z.string(),
  businessAddress: z.string(),
  timezone: z.string(),
  currency: z.string(),
  language: z.string(),
});

// WhatsApp Settings Schema
export const WhatsAppSettingsSchema = z.object({
  apiUrl: z.string(),
  apiKey: z.string(),
  sessionName: z.string(),
  businessNumber: z.string(),
  welcomeMessage: z.string(),
  autoReplyEnabled: z.boolean(),
  businessHours: z.union([BusinessHoursSchema, z.string()]).transform((val) => {
    // Handle case where businessHours comes as JSON string from database
    if (typeof val === "string") {
      try {
        return BusinessHoursSchema.parse(JSON.parse(val));
      } catch {
        // Fallback to default if parsing fails
        return {
          enabled: false,
          timezone: "Africa/Douala",
          monday: { enabled: true, open: "08:00", close: "18:00" },
          tuesday: { enabled: true, open: "08:00", close: "18:00" },
          wednesday: { enabled: true, open: "08:00", close: "18:00" },
          thursday: { enabled: true, open: "08:00", close: "18:00" },
          friday: { enabled: true, open: "08:00", close: "18:00" },
          saturday: { enabled: false, open: "09:00", close: "15:00" },
          sunday: { enabled: false, open: "09:00", close: "15:00" },
        };
      }
    }
    return val;
  }),
});

// Payment Settings Schema
export const PaymentSettingsSchema = z.object({
  provider: z.string(),
  enabled: z.boolean(),
  testMode: z.boolean(),
  supportedCurrencies: z.array(z.string()),
  minAmount: z.number(),
  maxAmount: z.number(),
  lygosApiKey: z.string().optional(),
  lygosShopName: z.string().optional(),
});

// Notification Settings Schema
export const NotificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  whatsappNotifications: z.boolean(),
  orderUpdates: z.boolean(),
  deliveryUpdates: z.boolean(),
  promotionalMessages: z.boolean(),
});

// Configuration Schema
export const ConfigurationSchema = z.object({
  id: z.string(),
  general: GeneralSettingsSchema,
  whatsapp: WhatsAppSettingsSchema,
  payments: PaymentSettingsSchema,
  notifications: NotificationSettingsSchema,
  isComplete: z.boolean(),
  setupCompletedAt: z.string().nullable(),
});

// Dashboard Stats Schema
export const DashboardStatsSchema = z.object({
  totalProducts: z.number(),
  totalOrders: z.number(),
  totalUsers: z.number(),
  totalGroups: z.number(),
  recentOrders: z.number(),
  setupProgress: z.number(),
  activeProducts: z.number(),
  pendingOrders: z.number(),
  activeUsers: z.number(),
  activeGroups: z.number(),
});

// Recent Order Schema
export const RecentOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerName: z.string(),
  totalAmount: z.number(),
  status: z.string(),
  createdAt: z.string(),
  itemCount: z.number(),
});

// System Health Schema
export const SystemHealthSchema = z.object({
  whatsappConnection: z.enum(["connected", "disconnected", "error"]),
  paymentGateway: z.enum(["active", "inactive", "error"]),
  database: z.enum(["healthy", "unhealthy", "error"]),
  apiStatus: z.enum(["operational", "degraded", "error"]),
});

// Dashboard Data Schema
export const DashboardDataSchema = z.object({
  stats: DashboardStatsSchema,
  recentOrders: z.array(RecentOrderSchema),
  systemHealth: SystemHealthSchema,
  isSetupComplete: z.boolean(),
});

// Type exports
export type DayHours = z.infer<typeof DayHoursSchema>;
export type BusinessHours = z.infer<typeof BusinessHoursSchema>;
export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;
export type WhatsAppSettings = z.infer<typeof WhatsAppSettingsSchema>;
export type PaymentSettings = z.infer<typeof PaymentSettingsSchema>;
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
export type Configuration = z.infer<typeof ConfigurationSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type DashboardData = z.infer<typeof DashboardDataSchema>;
