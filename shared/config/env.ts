/**
 * Environment Configuration
 * 
 * Type-safe access to environment variables
 * Throws error if required variables are missing
 */

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || "";
}

export const env = {
  // App
  appUrl: getEnvVar("NEXT_PUBLIC_APP_URL"),
  nodeEnv: getEnvVar("NODE_ENV", false) || "development",

  // Database
  databaseUrl: getEnvVar("DATABASE_URL"),

  // WAHA (WhatsApp)
  wahaApiUrl: getEnvVar("WAHA_API_URL"),
  wahaApiKey: getEnvVar("WAHA_API_KEY"),

  // PawaPay (Payment)
  pawapayApiKey: getEnvVar("PAWAPAY_API_KEY"),
  pawapayMode: getEnvVar("PAWAPAY_MODE", false) || "test",

  // Feature flags
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
} as const;

// Validate env on startup (only in Node.js, not in browser)
if (typeof window === "undefined" && env.isDev) {
  console.log("✅ Environment variables loaded successfully");
}
