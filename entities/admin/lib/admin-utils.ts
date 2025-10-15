/**
 * Admin Utilities
 * 
 * Role-based permissions and admin helpers
 */

import type { AdminRole, Permission, Admin } from "../model/types";

/**
 * Role hierarchy (higher number = more permissions)
 */
const roleHierarchy: Record<AdminRole, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  DELIVERY_MANAGER: 2,
  SUPPORT: 1,
};

/**
 * Check if role has permission
 */
export function hasPermission(role: AdminRole, permission: Permission): boolean {
  const rolePermissions = getRolePermissions(role);
  return rolePermissions.includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: AdminRole): Permission[] {
  switch (role) {
    case "SUPER_ADMIN":
      return [
        // All permissions
        "articles:read",
        "articles:create",
        "articles:update",
        "articles:delete",
        "drops:read",
        "drops:create",
        "drops:send",
        "orders:read",
        "orders:validate",
        "customers:read",
        "customers:update",
        "admins:read",
        "admins:create",
        "admins:update",
        "admins:delete",
        "settings:read",
        "settings:update",
      ];

    case "ADMIN":
      return [
        // Most permissions except admin management
        "articles:read",
        "articles:create",
        "articles:update",
        "articles:delete",
        "drops:read",
        "drops:create",
        "drops:send",
        "orders:read",
        "orders:validate",
        "customers:read",
        "customers:update",
        "admins:read",
        "settings:read",
      ];

    case "DELIVERY_MANAGER":
      return [
        // Order validation focused
        "articles:read",
        "orders:read",
        "orders:validate",
        "customers:read",
      ];

    case "SUPPORT":
      return [
        // Read-only mostly
        "articles:read",
        "drops:read",
        "orders:read",
        "customers:read",
        "customers:update",
      ];
  }
}

/**
 * Check if role can perform action
 */
export function canManageArticles(role: AdminRole): boolean {
  return hasPermission(role, "articles:create");
}

export function canManageDrops(role: AdminRole): boolean {
  return hasPermission(role, "drops:create");
}

export function canSendDrops(role: AdminRole): boolean {
  return hasPermission(role, "drops:send");
}

export function canValidateOrders(role: AdminRole): boolean {
  return hasPermission(role, "orders:validate");
}

export function canManageAdmins(role: AdminRole): boolean {
  return hasPermission(role, "admins:create");
}

export function canManageSettings(role: AdminRole): boolean {
  return hasPermission(role, "settings:update");
}

/**
 * Check if one role can manage another role
 */
export function canManageRole(managerRole: AdminRole, targetRole: AdminRole): boolean {
  // Only SUPER_ADMIN can manage other admins
  if (managerRole !== "SUPER_ADMIN") return false;
  
  // SUPER_ADMIN can manage all roles
  return true;
}

/**
 * Get role display name
 */
export function getRoleName(role: AdminRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Administrateur";
    case "ADMIN":
      return "Administrateur";
    case "DELIVERY_MANAGER":
      return "Gestionnaire Livraison";
    case "SUPPORT":
      return "Support Client";
  }
}

/**
 * Get role color (Tailwind)
 */
export function getRoleColor(role: AdminRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-purple-500";
    case "ADMIN":
      return "bg-blue-500";
    case "DELIVERY_MANAGER":
      return "bg-green-500";
    case "SUPPORT":
      return "bg-gray-500";
  }
}

/**
 * Get role description
 */
export function getRoleDescription(role: AdminRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Accès complet au système";
    case "ADMIN":
      return "Gestion des articles, drops et commandes";
    case "DELIVERY_MANAGER":
      return "Validation des commandes et livraisons";
    case "SUPPORT":
      return "Support client et consultation";
  }
}

/**
 * Check if admin is active
 */
export function isAdminActive(admin: Pick<Admin, "isActive">): boolean {
  return admin.isActive;
}

/**
 * Get days since last login
 */
export function getDaysSinceLastLogin(admin: Pick<Admin, "lastLoginAt">): number | null {
  if (!admin.lastLoginAt) return null;
  
  const now = new Date();
  const diffTime = now.getTime() - admin.lastLoginAt.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if admin is recently active (< 7 days)
 */
export function isRecentlyActive(admin: Pick<Admin, "lastLoginAt">): boolean {
  const daysSince = getDaysSinceLastLogin(admin);
  return daysSince !== null && daysSince <= 7;
}
