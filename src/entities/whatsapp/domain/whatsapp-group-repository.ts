import {
  PrismaClient,
  WhatsAppGroup as PrismaWhatsAppGroup,
} from "@prisma/client";
import {
  WhatsAppGroup,
  CreateWhatsAppGroupData,
  UpdateWhatsAppGroupData,
  WhatsAppGroupFilters,
  WhatsAppGroupListResult,
} from "./whatsapp-group";
import {
  Result,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../../lib/domain";

export class WhatsAppGroupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a new WhatsApp group
   */
  async create(data: CreateWhatsAppGroupData): Promise<Result<WhatsAppGroup>> {
    try {
      const prismaGroup = await this.prisma.whatsAppGroup.create({
        data: {
          name: data.name,
          chatId: data.chatId,
          description: data.description,
          memberCount: data.memberCount,
          createdBy: data.createdBy,
        },
      });

      const group = this.mapToDomain(prismaGroup);
      return { success: true, data: group };
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: new ConflictError("Group with this chat ID already exists"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to create WhatsApp group: ${error.message}`),
      };
    }
  }

  /**
   * Find group by ID
   */
  async findById(id: string): Promise<Result<WhatsAppGroup>> {
    try {
      const prismaGroup = await this.prisma.whatsAppGroup.findUnique({
        where: { id },
      });

      if (!prismaGroup) {
        return {
          success: false,
          error: new NotFoundError("WhatsApp group not found"),
        };
      }

      const group = this.mapToDomain(prismaGroup);
      return { success: true, data: group };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to find WhatsApp group: ${error.message}`),
      };
    }
  }

  /**
   * Find group by chat ID
   */
  async findByChatId(chatId: string): Promise<Result<WhatsAppGroup>> {
    try {
      const prismaGroup = await this.prisma.whatsAppGroup.findUnique({
        where: { chatId },
      });

      if (!prismaGroup) {
        return {
          success: false,
          error: new NotFoundError("WhatsApp group not found"),
        };
      }

      const group = this.mapToDomain(prismaGroup);
      return { success: true, data: group };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(
          `Failed to find WhatsApp group by chat ID: ${error.message}`
        ),
      };
    }
  }

  /**
   * Update group
   */
  async update(
    id: string,
    data: UpdateWhatsAppGroupData
  ): Promise<Result<WhatsAppGroup>> {
    try {
      const prismaGroup = await this.prisma.whatsAppGroup.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.memberCount !== undefined && {
            memberCount: data.memberCount,
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      const group = this.mapToDomain(prismaGroup);
      return { success: true, data: group };
    } catch (error: any) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: new NotFoundError("WhatsApp group not found"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to update WhatsApp group: ${error.message}`),
      };
    }
  }

  /**
   * Delete group
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.whatsAppGroup.delete({
        where: { id },
      });

      return { success: true, data: undefined };
    } catch (error: any) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: new NotFoundError("WhatsApp group not found"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to delete WhatsApp group: ${error.message}`),
      };
    }
  }

  /**
   * List groups with filtering and pagination
   */
  async list(
    filters: WhatsAppGroupFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<Result<WhatsAppGroupListResult>> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { chatId: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      if (filters.createdAfter || filters.createdBefore) {
        where.createdAt = {};
        if (filters.createdAfter) {
          where.createdAt.gte = filters.createdAfter;
        }
        if (filters.createdBefore) {
          where.createdAt.lte = filters.createdBefore;
        }
      }

      // Get total count
      const total = await this.prisma.whatsAppGroup.count({ where });

      // Get groups
      const prismaGroups = await this.prisma.whatsAppGroup.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      const groups = prismaGroups.map(this.mapToDomain);
      const totalPages = Math.ceil(total / limit);

      const result: WhatsAppGroupListResult = {
        groups,
        total,
        page,
        limit,
        totalPages,
      };

      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to list WhatsApp groups: ${error.message}`),
      };
    }
  }

  /**
   * Count groups matching filters
   */
  async count(filters: WhatsAppGroupFilters = {}): Promise<Result<number>> {
    try {
      const where: any = {};

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { chatId: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      if (filters.createdAfter || filters.createdBefore) {
        where.createdAt = {};
        if (filters.createdAfter) {
          where.createdAt.gte = filters.createdAfter;
        }
        if (filters.createdBefore) {
          where.createdAt.lte = filters.createdBefore;
        }
      }

      const count = await this.prisma.whatsAppGroup.count({ where });

      return { success: true, data: count };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to count WhatsApp groups: ${error.message}`),
      };
    }
  }

  /**
   * Get all active groups for drop distribution
   */
  async getActiveGroups(): Promise<Result<WhatsAppGroup[]>> {
    try {
      const prismaGroups = await this.prisma.whatsAppGroup.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });

      const groups = prismaGroups.map(this.mapToDomain);
      return { success: true, data: groups };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get active groups: ${error.message}`),
      };
    }
  }

  /**
   * Check if group exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.whatsAppGroup.count({
        where: { id },
      });
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if chat ID is available
   */
  async isChatIdAvailable(
    chatId: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const where: any = { chatId };
      if (excludeId) {
        where.id = { not: excludeId };
      }

      const count = await this.prisma.whatsAppGroup.count({ where });
      return count === 0;
    } catch {
      return false;
    }
  }

  /**
   * Update member count for a group
   */
  async updateMemberCount(
    id: string,
    memberCount: number
  ): Promise<Result<WhatsAppGroup>> {
    try {
      const prismaGroup = await this.prisma.whatsAppGroup.update({
        where: { id },
        data: { memberCount },
      });

      const group = this.mapToDomain(prismaGroup);
      return { success: true, data: group };
    } catch (error: any) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: new NotFoundError("WhatsApp group not found"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to update member count: ${error.message}`),
      };
    }
  }

  /**
   * Map Prisma group to domain group
   */
  private mapToDomain(prismaGroup: any): WhatsAppGroup {
    return new WhatsAppGroup(
      prismaGroup.id,
      prismaGroup.name,
      prismaGroup.chatId,
      prismaGroup.createdBy, // This is correct based on prisma schema
      prismaGroup.description || undefined,
      prismaGroup.memberCount || undefined,
      prismaGroup.isActive,
      prismaGroup.lastActivity || undefined,
      prismaGroup.createdAt,
      prismaGroup.updatedAt
    );
  }
}
