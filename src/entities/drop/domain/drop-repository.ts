import { PrismaClient } from "@prisma/client";
import {
  Drop,
  CreateDropData,
  UpdateDropData,
  DropFilters,
  DropListResult,
  DropProduct as DomainDropProduct,
  DropGroup as DomainDropGroup,
  DropStatus,
} from "./drop";
import { Result, NotFoundError } from "../../../lib/domain";

export class DropRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a new drop with products and groups
   */
  async create(data: CreateDropData): Promise<Result<Drop>> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Create the drop
        const prismaDrop = await tx.drop.create({
          data: {
            name: data.name,
            scheduledDate: data.scheduledDate,
            createdBy: data.productIds[0] || "", // This should be passed from service
          },
        });

        // Add products to drop
        if (data.productIds.length > 0) {
          await tx.dropProduct.createMany({
            data: data.productIds.map((productId, index) => ({
              dropId: prismaDrop.id,
              productId,
              sortOrder: index,
            })),
          });
        }

        // Add groups to drop
        if (data.groupIds.length > 0) {
          await tx.dropGroup.createMany({
            data: data.groupIds.map((groupId) => ({
              dropId: prismaDrop.id,
              groupId,
            })),
          });
        }

        // Fetch the complete drop with relations
        return await tx.drop.findUnique({
          where: { id: prismaDrop.id },
          include: {
            products: {
              include: { product: true },
              orderBy: { sortOrder: "asc" },
            },
            groups: {
              include: { group: true },
            },
          },
        });
      });

      if (!result) {
        return {
          success: false,
          error: new Error("Failed to create drop"),
        };
      }

      const drop = this.mapToDomain(result);
      return { success: true, data: drop };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to create drop: ${error.message}`),
      };
    }
  }

  /**
   * Find drop by ID with full relations
   */
  async findById(id: string): Promise<Result<Drop>> {
    try {
      const prismaDrop = await this.prisma.drop.findUnique({
        where: { id },
        include: {
          products: {
            include: { product: true },
            orderBy: { sortOrder: "asc" },
          },
          groups: {
            include: { group: true },
          },
        },
      });

      if (!prismaDrop) {
        return {
          success: false,
          error: new NotFoundError("Drop not found"),
        };
      }

      const drop = this.mapToDomain(prismaDrop);
      return { success: true, data: drop };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to find drop: ${error.message}`),
      };
    }
  }

  /**
   * Update drop with products and groups
   */
  async update(id: string, data: UpdateDropData): Promise<Result<Drop>> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Update the drop
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.scheduledDate) updateData.scheduledDate = data.scheduledDate;
        if (data.status) updateData.status = data.status;

        const prismaDrop = await tx.drop.update({
          where: { id },
          data: updateData,
        });

        // Update products if provided
        if (data.productIds !== undefined) {
          // Remove existing products
          await tx.dropProduct.deleteMany({
            where: { dropId: id },
          });

          // Add new products
          if (data.productIds.length > 0) {
            await tx.dropProduct.createMany({
              data: data.productIds.map((productId, index) => ({
                dropId: id,
                productId,
                sortOrder: index,
              })),
            });
          }
        }

        // Update groups if provided
        if (data.groupIds !== undefined) {
          // Remove existing groups
          await tx.dropGroup.deleteMany({
            where: { dropId: id },
          });

          // Add new groups
          if (data.groupIds.length > 0) {
            await tx.dropGroup.createMany({
              data: data.groupIds.map((groupId) => ({
                dropId: id,
                groupId,
              })),
            });
          }
        }

        // Fetch the updated drop with relations
        return await tx.drop.findUnique({
          where: { id },
          include: {
            products: {
              include: { product: true },
              orderBy: { sortOrder: "asc" },
            },
            groups: {
              include: { group: true },
            },
          },
        });
      });

      if (!result) {
        return {
          success: false,
          error: new NotFoundError("Drop not found"),
        };
      }

      const drop = this.mapToDomain(result);
      return { success: true, data: drop };
    } catch (error: any) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: new NotFoundError("Drop not found"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to update drop: ${error.message}`),
      };
    }
  }

  /**
   * Delete drop
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.drop.delete({
        where: { id },
      });

      return { success: true, data: undefined };
    } catch (error: any) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: new NotFoundError("Drop not found"),
        };
      }
      return {
        success: false,
        error: new Error(`Failed to delete drop: ${error.message}`),
      };
    }
  }

  /**
   * List drops with filtering and pagination
   */
  async list(
    filters: DropFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<Result<DropListResult>> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.createdBy) {
        where.createdBy = filters.createdBy;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      if (filters.scheduledAfter || filters.scheduledBefore) {
        where.scheduledDate = {};
        if (filters.scheduledAfter) {
          where.scheduledDate.gte = filters.scheduledAfter;
        }
        if (filters.scheduledBefore) {
          where.scheduledDate.lte = filters.scheduledBefore;
        }
      }

      // Get total count
      const total = await this.prisma.drop.count({ where });

      // Get drops with relations
      const prismaDrops = await this.prisma.drop.findMany({
        where,
        include: {
          products: {
            include: { product: true },
            orderBy: { sortOrder: "asc" },
          },
          groups: {
            include: { group: true },
          },
        },
        orderBy: { scheduledDate: "desc" },
        skip,
        take: limit,
      });

      const drops = prismaDrops.map(this.mapToDomain);
      const totalPages = Math.ceil(total / limit);

      const result: DropListResult = {
        drops,
        total,
        page,
        limit,
        totalPages,
      };

      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to list drops: ${error.message}`),
      };
    }
  }

  /**
   * Count drops matching filters
   */
  async count(filters: DropFilters = {}): Promise<Result<number>> {
    try {
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.createdBy) {
        where.createdBy = filters.createdBy;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      if (filters.scheduledAfter || filters.scheduledBefore) {
        where.scheduledDate = {};
        if (filters.scheduledAfter) {
          where.scheduledDate.gte = filters.scheduledAfter;
        }
        if (filters.scheduledBefore) {
          where.scheduledDate.lte = filters.scheduledBefore;
        }
      }

      const count = await this.prisma.drop.count({ where });

      return { success: true, data: count };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to count drops: ${error.message}`),
      };
    }
  }

  /**
   * Find drops scheduled for a specific date
   */
  async findByScheduledDate(date: Date): Promise<Result<Drop[]>> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const prismaDrops = await this.prisma.drop.findMany({
        where: {
          scheduledDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: [DropStatus.DRAFT, DropStatus.SCHEDULED],
          },
        },
        include: {
          products: {
            include: { product: true },
            orderBy: { sortOrder: "asc" },
          },
          groups: {
            include: { group: true },
          },
        },
        orderBy: { scheduledDate: "asc" },
      });

      const drops = prismaDrops.map(this.mapToDomain);
      return { success: true, data: drops };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to find drops by date: ${error.message}`),
      };
    }
  }

  /**
   * Check if drop exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.drop.count({
        where: { id },
      });
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Map Prisma drop to domain drop
   */
  private mapToDomain(prismaDrop: any): Drop {
    const products: DomainDropProduct[] = prismaDrop.products.map(
      (dp: any) => ({
        productId: dp.productId,
        sortOrder: dp.sortOrder,
      })
    );

    const groups: DomainDropGroup[] = prismaDrop.groups.map((dg: any) => ({
      groupId: dg.groupId,
    }));

    return new Drop(
      prismaDrop.id,
      prismaDrop.scheduledDate,
      prismaDrop.createdBy,
      products,
      groups,
      prismaDrop.name || undefined,
      prismaDrop.status,
      prismaDrop.sentAt || undefined,
      prismaDrop.messageId || undefined,
      prismaDrop.createdAt,
      prismaDrop.updatedAt
    );
  }
}
