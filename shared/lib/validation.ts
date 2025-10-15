/**
 * Validation Utilities
 * 
 * Pure functions for common validation
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Cameroon format)
 */
export function isValidPhone(phone: string): boolean {
  // Cameroon format: +237 6XX XXX XXX or 6XX XXX XXX
  const phoneRegex = /^(\+237)?[6][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Au moins 8 caractères");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Au moins 1 majuscule");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Au moins 1 minuscule");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Au moins 1 chiffre");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
