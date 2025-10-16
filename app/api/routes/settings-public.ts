/**
 * Site Settings API Route
 * Provides site configuration data
 */

import { Hono } from "hono";
import { prisma } from "@/lib/db";

const app = new Hono();

/**
 * Get current site settings
 */
app.get("/", async (c) => {
  try {
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      // Return default settings if none exist
      return c.json({
        storeName: "Drop-In-Drop",
        storeAddress: "Cameroun",
        storeHours: "Lundi - Samedi: 8h - 18h",
        supportPhone: "+237 6XX XXX XXX",
        homeTitle: "Drop-In-Drop",
        homeSubtitle: "Les meilleurs produits tech au Cameroun",
        whatsappGroupLink: "",
        ticketExpiryDays: 7,
      });
    }

    return c.json(settings);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
