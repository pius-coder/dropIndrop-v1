/**
 * Home Page
 *
 * Landing page for Drop-In-Drop
 */

import { EnhancedLandingPage } from "@/features/landing-page/ui/enhanced-landing-page";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function HomePage() {
  return <EnhancedLandingPage />;
}
