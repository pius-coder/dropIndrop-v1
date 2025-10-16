/**
 * Admin Login Page
 */

import { LoginForm } from "@/features/auth-login";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
