/**
 * Auth Login - Types
 */

import { z } from "zod";
import type { Admin } from "@/entities/admin";

export const loginRequestSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export interface LoginResponse {
  token: string;
  admin: Omit<Admin, "password">;
}
