import { UserRole } from "@prisma/client";
import {
  BaseEntity,
  AuditableEntity,
  Result,
  ValidationResult,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../../lib/domain";

// Domain types for User entity
export interface CreateUserData {
  username: string;
  email?: string;
  phoneNumber: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserAuthenticationData {
  username: string;
  password: string;
  phoneNumber: string;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface UserListResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User domain entity
export class User extends BaseEntity {
  public readonly username: string;
  public readonly email?: string;
  public readonly phoneNumber: string;
  public readonly passwordHash: string;
  public readonly role: UserRole;
  public readonly isActive: boolean;
  public readonly lastLoginAt?: Date;
  public readonly otpCode?: string;
  public readonly otpExpiresAt?: Date;
  public readonly otpAttempts: number;

  constructor(
    id: string,
    username: string,
    phoneNumber: string,
    passwordHash: string,
    role: UserRole = UserRole.CLIENT,
    isActive: boolean = true,
    email?: string,
    lastLoginAt?: Date,
    otpCode?: string,
    otpExpiresAt?: Date,
    otpAttempts: number = 0,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.username = username;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.passwordHash = passwordHash;
    this.role = role;
    this.isActive = isActive;
    this.lastLoginAt = lastLoginAt;
    this.otpCode = otpCode;
    this.otpExpiresAt = otpExpiresAt;
    this.otpAttempts = otpAttempts;
  }

  // Business logic methods
  public isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
  }

  public isDeliveryManager(): boolean {
    return this.role === UserRole.DELIVERY_MANAGER;
  }

  public isClient(): boolean {
    return this.role === UserRole.CLIENT;
  }

  public canManageUsers(): boolean {
    return this.isSuperAdmin();
  }

  public canManageProducts(): boolean {
    return this.isAdmin();
  }

  public canManageDrops(): boolean {
    return this.isAdmin();
  }

  public canVerifyDeliveries(): boolean {
    return this.isDeliveryManager() || this.isAdmin();
  }

  public canPlaceOrders(): boolean {
    return this.isClient() && this.isActive;
  }

  public updateLastLogin(): User {
    return new User(
      this.id,
      this.username,
      this.phoneNumber,
      this.passwordHash,
      this.role,
      this.isActive,
      this.email,
      new Date(),
      this.otpCode,
      this.otpExpiresAt,
      this.otpAttempts,
      this.createdAt,
      new Date()
    );
  }

  public updateProfile(updates: UpdateUserData): Result<User> {
    // Validate updates
    const validation = this.validateUpdates(updates);
    if (!validation.isValid) {
      return {
        success: false,
        error: new ValidationError(validation.errors.join(", ")),
      };
    }

    // Create updated user (password updates handled separately)
    const updatedUser = new User(
      this.id,
      updates.username || this.username,
      updates.phoneNumber || this.phoneNumber,
      this.passwordHash, // Password updates require separate method
      updates.role || this.role,
      updates.isActive ?? this.isActive,
      updates.email || this.email,
      this.lastLoginAt,
      this.otpCode,
      this.otpExpiresAt,
      this.otpAttempts,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedUser,
    };
  }

  public changePassword(newPasswordHash: string): User {
    return new User(
      this.id,
      this.username,
      this.phoneNumber,
      newPasswordHash,
      this.role,
      this.isActive,
      this.email,
      this.lastLoginAt,
      this.otpCode,
      this.otpExpiresAt,
      this.otpAttempts,
      this.createdAt,
      new Date()
    );
  }

  public deactivate(): User {
    return new User(
      this.id,
      this.username,
      this.phoneNumber,
      this.passwordHash,
      this.role,
      false,
      this.email,
      this.lastLoginAt,
      this.otpCode,
      this.otpExpiresAt,
      this.otpAttempts,
      this.createdAt,
      new Date()
    );
  }

  public activate(): User {
    return new User(
      this.id,
      this.username,
      this.phoneNumber,
      this.passwordHash,
      this.role,
      true,
      this.email,
      this.lastLoginAt,
      this.otpCode,
      this.otpExpiresAt,
      this.otpAttempts,
      this.createdAt,
      new Date()
    );
  }

  // OTP-related methods
  public setOTP(otpCode: string, expiresAt: Date): User {
    return new User(
      this.id,
      this.username,
      this.phoneNumber,
      this.passwordHash,
      this.role,
      this.isActive,
      this.email,
      this.lastLoginAt,
      otpCode,
      expiresAt,
      0, // Reset attempts when setting new OTP
      this.createdAt,
      new Date()
    );
  }

  public incrementOTPAttempts(): User {
    return new User(
      this.id,
      this.username,
      this.phoneNumber,
      this.passwordHash,
      this.role,
      this.isActive,
      this.email,
      this.lastLoginAt,
      this.otpCode,
      this.otpExpiresAt,
      this.otpAttempts + 1,
      this.createdAt,
      new Date()
    );
  }

  public clearOTP(): User {
    return new User(
      this.id,
      this.username,
      this.phoneNumber,
      this.passwordHash,
      this.role,
      this.isActive,
      this.email,
      this.lastLoginAt,
      undefined,
      undefined,
      0,
      this.createdAt,
      new Date()
    );
  }

  public isOTPValid(): boolean {
    return !!(
      this.otpCode &&
      this.otpExpiresAt &&
      this.otpExpiresAt > new Date() &&
      this.otpAttempts < 3
    );
  }

  public verifyOTP(code: string): boolean {
    return this.isOTPValid() && this.otpCode === code;
  }

  // Validation methods
  private validateUpdates(updates: UpdateUserData): ValidationResult {
    const errors: string[] = [];

    if (updates.username !== undefined) {
      if (updates.username.length < 3 || updates.username.length > 50) {
        errors.push("Username must be between 3 and 50 characters");
      }
      if (!/^[a-zA-Z0-9_]+$/.test(updates.username)) {
        errors.push(
          "Username can only contain letters, numbers, and underscores"
        );
      }
    }

    if (updates.email !== undefined && updates.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
        errors.push("Invalid email format");
      }
    }

    if (updates.phoneNumber !== undefined) {
      if (!/^\+[1-9]\d{1,14}$/.test(updates.phoneNumber)) {
        errors.push(
          "Phone number must include country code (e.g., +1234567890)"
        );
      }
    }

    if (updates.role !== undefined) {
      const validRoles = Object.values(UserRole);
      if (!validRoles.includes(updates.role)) {
        errors.push("Invalid user role");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateCreateData(data: CreateUserData): ValidationResult {
    const errors: string[] = [];

    if (
      !data.username ||
      data.username.length < 3 ||
      data.username.length > 50
    ) {
      errors.push("Username must be between 3 and 50 characters");
    }

    if (data.username && !/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.push(
        "Username can only contain letters, numbers, and underscores"
      );
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid email format");
    }

    if (!data.phoneNumber || !/^\+[1-9]\d{1,14}$/.test(data.phoneNumber)) {
      errors.push("Phone number must include country code (e.g., +1234567890)");
    }

    if (!data.password || data.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    const validRoles = Object.values(UserRole);
    if (data.role && !validRoles.includes(data.role)) {
      errors.push("Invalid user role");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateAuthData(
    data: UserAuthenticationData
  ): ValidationResult {
    const errors: string[] = [];

    if (!data.username || data.username.trim().length === 0) {
      errors.push("Username is required");
    }

    if (!data.password || data.password.length === 0) {
      errors.push("Password is required");
    }

    if (!data.phoneNumber || !/^\+[1-9]\d{1,14}$/.test(data.phoneNumber)) {
      errors.push("Valid phone number is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Value objects for User domain
export class UserCredentials {
  constructor(
    public readonly username: string,
    public readonly passwordHash: string
  ) {}

  public static fromPlainPassword(
    username: string,
    password: string
  ): UserCredentials {
    // In real implementation, hash the password here
    const passwordHash = this.hashPassword(password);
    return new UserCredentials(username, passwordHash);
  }

  private static hashPassword(password: string): string {
    // Placeholder for password hashing
    // In real implementation, use bcrypt or similar
    return `hashed_${password}`;
  }

  public verifyPassword(password: string): boolean {
    // Placeholder for password verification
    // In real implementation, compare with stored hash
    return this.passwordHash === `hashed_${password}`;
  }
}

export class PhoneNumber {
  constructor(public readonly value: string) {
    if (!/^\+[1-9]\d{1,14}$/.test(value)) {
      throw new ValidationError("Invalid phone number format");
    }
  }

  public toString(): string {
    return this.value;
  }

  public getCountryCode(): string {
    return this.value.substring(0, 3);
  }

  public getNationalNumber(): string {
    return this.value.substring(3);
  }
}

export class UserRolePermissions {
  public static getPermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: [
        "user.create",
        "user.read",
        "user.update",
        "user.delete",
        "product.create",
        "product.read",
        "product.update",
        "product.delete",
        "drop.create",
        "drop.read",
        "drop.update",
        "drop.delete",
        "order.read",
        "order.update",
        "ticket.verify",
        "system.configure",
      ],
      [UserRole.ADMIN]: [
        "product.create",
        "product.read",
        "product.update",
        "product.delete",
        "drop.create",
        "drop.read",
        "drop.update",
        "drop.delete",
        "order.read",
        "order.update",
        "user.read",
        "ticket.verify",
      ],
      [UserRole.DELIVERY_MANAGER]: ["order.read", "ticket.verify", "user.read"],
      [UserRole.CLIENT]: [
        "order.create",
        "order.read",
        "ticket.read",
        "product.read",
      ],
    };

    return permissions[role] || [];
  }

  public static hasPermission(role: UserRole, permission: string): boolean {
    return this.getPermissions(role).includes(permission);
  }
}
