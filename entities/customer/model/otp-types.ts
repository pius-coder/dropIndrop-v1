/**
 * Customer OTP Authentication - Types & Schema
 */

import { z } from "zod";

/**
 * Send OTP Request Schema (for registration/login)
 */
export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]{9}$/, "Numéro invalide (9 chiffres après +237)"),
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .optional(),
});

/**
 * Verify OTP Request Schema
 */
export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]{9}$/, "Numéro invalide"),
  otp: z
    .string()
    .length(6, "Le code OTP doit contenir exactement 6 chiffres")
    .regex(/^[0-9]{6}$/, "Le code OTP doit contenir uniquement des chiffres"),
});

/**
 * Customer Session Response
 */
export const customerSessionSchema = z.object({
  customer: z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
    email: z.string().nullable(),
    totalOrders: z.number(),
    totalSpent: z.number(),
    createdAt: z.date(),
  }),
  token: z.string(),
});

/**
 * Customer Registration Data (stored temporarily during OTP flow)
 */
export const customerRegistrationSchema = z.object({
  phone: z.string(),
  name: z.string(),
  password: z.string().optional(),
});

/**
 * TypeScript Types
 */
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type CustomerSession = z.infer<typeof customerSessionSchema>;
export type CustomerRegistration = z.infer<typeof customerRegistrationSchema>;
