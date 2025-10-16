/**
 * Register Page
 * Customer registration with OTP verification
 */

"use client";

import { CustomerAuthForm } from "@/entities/customer/ui/customer-auth-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <CustomerAuthForm mode="register" />
      </div>
    </div>
  );
}
