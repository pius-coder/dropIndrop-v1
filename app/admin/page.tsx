/**
 * Admin Root Page
 * Redirects to dashboard
 */

import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/dashboard");
}
