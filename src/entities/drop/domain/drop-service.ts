import { PrismaClient } from "@prisma/client";
import {
  Drop,
  CreateDropData,
  UpdateDropData,
  DropFilters,
  DropListResult,
  DropStatus,
} from "./drop";
import { DropRepository } from "./drop-repository";
import { ProductRepository } from "../../product/domain/product-repository";
import { WhatsAppGroupRepository } from "../../whatsapp/domain/whatsapp-group-repository";
import {
  Result,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../../lib/domain";

// Additional service interfaces
export interface DropAnalytics {
  totalDrops: number;
  scheduledDrops: number;
  sentDrops: number;
  cancelledDrops: number;
  upcomingDrops: number;
  overdueDrops: number;
}

export interface DropServiceDependencies {
  dropRepository: DropRepository;
  productRepository: ProductRepository;
  whatsappGroupRepository: WhatsAppGroupRepository;
  prisma: PrismaClient;
}

export class DropService {
  constructor(private readonly deps: DropServiceDependencies) {}

  /**
   * Create a new drop with business rule validation
   */
  async create(data: CreateDropData, createdBy: string): Promise<Result<Drop>> {
    try {
      // Validate business rules
      const validation = await this.validateCreateData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: new ValidationError(validation.errors.join(", ")),
        };
      }

      // Verify all products exist and are active
      for (const productId of data.productIds) {
        const productResult = await this.deps.productRepository.findById(
          productId
        );
        if (!productResult.success) {
          return {
            success: false,
            error: new ValidationError(`Product ${productId} does not exist`),
          };
        }
        if (!productResult.data.isActive) {
          return {
            success: false,
            error: new ValidationError(
              `Product ${productResult.data.name} is not active`
            ),
          };
        }
      }

      // Verify all groups exist and are active
      for (const groupId of data.groupIds) {
        const groupResult = await this.deps.whatsappGroupRepository.findById(
          groupId
        );
        if (!groupResult.success) {
          return {
            success: false,
            error: new ValidationError(
              `WhatsApp group ${groupId} does not exist`
            ),
          };
        }
        if (!groupResult.data.isActive) {
          return {
            success: false,
            error: new ValidationError(
              `WhatsApp group ${groupResult.data.name} is not active`
            ),
          };
        }
      }

      // Create drop with creator
      const createData = { ...data, createdBy };
      const result = await this.deps.dropRepository.create(createData);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to create drop: ${error.message}`),
      };
    }
  }

  /**
   * Get drop by ID with full validation
   */
  async getById(id: string): Promise<Result<Drop>> {
    try {
      return await this.deps.dropRepository.findById(id);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get drop: ${error.message}`),
      };
    }
  }

  /**
   * Update drop with business rule validation
   */
  async update(id: string, data: UpdateDropData): Promise<Result<Drop>> {
    try {
      // Check if drop exists
      const existingResult = await this.deps.dropRepository.findById(id);
      if (!existingResult.success) {
        return existingResult;
      }

      const existingDrop = existingResult.data;

      // Validate business rules
      const validation = await this.validateUpdateData(id, data);
      if (!validation.isValid) {
        return {
          success: false,
          error: new ValidationError(validation.errors.join(", ")),
        };
      }

      // Additional validation for products if being updated
      if (data.productIds) {
        for (const productId of data.productIds) {
          const productResult = await this.deps.productRepository.findById(
            productId
          );
          if (!productResult.success) {
            return {
              success: false,
              error: new ValidationError(`Product ${productId} does not exist`),
            };
          }
          if (!productResult.data.isActive) {
            return {
              success: false,
              error: new ValidationError(
                `Product ${productResult.data.name} is not active`
              ),
            };
          }
        }
      }

      // Additional validation for groups if being updated
      if (data.groupIds) {
        for (const groupId of data.groupIds) {
          const groupResult = await this.deps.whatsappGroupRepository.findById(
            groupId
          );
          if (!groupResult.success) {
            return {
              success: false,
              error: new ValidationError(
                `WhatsApp group ${groupId} does not exist`
              ),
            };
          }
          if (!groupResult.data.isActive) {
            return {
              success: false,
              error: new ValidationError(
                `WhatsApp group ${groupResult.data.name} is not active`
              ),
            };
          }
        }
      }

      // Update drop
      const result = await this.deps.dropRepository.update(id, data);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to update drop: ${error.message}`),
      };
    }
  }

  /**
   * Delete drop with business rule validation
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      // Check if drop exists
      const existingResult = await this.deps.dropRepository.findById(id);
      if (!existingResult.success) {
        return existingResult;
      }

      const drop = existingResult.data;

      // Business rule: prevent deletion of sent drops
      if (drop.isSent()) {
        return {
          success: false,
          error: new ValidationError("Cannot delete a drop that has been sent"),
        };
      }

      // Delete drop
      return await this.deps.dropRepository.delete(id);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to delete drop: ${error.message}`),
      };
    }
  }

  /**
   * List drops with enhanced filtering
   */
  async list(
    filters: DropFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<Result<DropListResult>> {
    try {
      return await this.deps.dropRepository.list(filters, page, limit);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to list drops: ${error.message}`),
      };
    }
  }

  /**
   * Schedule a drop for sending
   */
  async schedule(id: string): Promise<Result<Drop>> {
    try {
      // Get current drop
      const dropResult = await this.deps.dropRepository.findById(id);
      if (!dropResult.success) {
        return dropResult;
      }

      const drop = dropResult.data;

      // Schedule the drop
      const scheduleResult = drop.schedule();
      if (!scheduleResult.success) {
        return scheduleResult;
      }

      // Update in repository
      const updateData: UpdateDropData = { status: DropStatus.SCHEDULED };
      return await this.deps.dropRepository.update(id, updateData);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to schedule drop: ${error.message}`),
      };
    }
  }

  /**
   * Mark drop as sent
   */
  async markAsSent(id: string, messageId?: string): Promise<Result<Drop>> {
    try {
      // Get current drop
      const dropResult = await this.deps.dropRepository.findById(id);
      if (!dropResult.success) {
        return dropResult;
      }

      const drop = dropResult.data;

      // Mark as sent
      const sentResult = drop.markAsSent(messageId);
      if (!sentResult.success) {
        return sentResult;
      }

      // Update in repository
      const updateData: UpdateDropData = {
        status: DropStatus.SENT,
        // Note: sentAt is set in the domain method
      };
      return await this.deps.dropRepository.update(id, updateData);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to mark drop as sent: ${error.message}`),
      };
    }
  }

  /**
   * Cancel a drop
   */
  async cancel(id: string): Promise<Result<Drop>> {
    try {
      // Get current drop
      const dropResult = await this.deps.dropRepository.findById(id);
      if (!dropResult.success) {
        return dropResult;
      }

      const drop = dropResult.data;

      // Cancel the drop
      const cancelResult = drop.cancel();
      if (!cancelResult.success) {
        return cancelResult;
      }

      // Update in repository
      const updateData: UpdateDropData = { status: DropStatus.CANCELLED };
      return await this.deps.dropRepository.update(id, updateData);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to cancel drop: ${error.message}`),
      };
    }
  }

  /**
   * Get drops scheduled for a specific date
   */
  async getDropsForDate(date: Date): Promise<Result<Drop[]>> {
    try {
      return await this.deps.dropRepository.findByScheduledDate(date);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get drops for date: ${error.message}`),
      };
    }
  }

  /**
   * Get drop analytics
   */
  async getAnalytics(): Promise<Result<DropAnalytics>> {
    try {
      // Get all drops
      const allDropsResult = await this.deps.dropRepository.list({}, 1, 10000);
      if (!allDropsResult.success) {
        return {
          success: false,
          error: allDropsResult.error,
        };
      }

      const drops = allDropsResult.data.drops;
      const now = new Date();

      // Calculate analytics
      const totalDrops = drops.length;
      const scheduledDrops = drops.filter((d) => d.isScheduled()).length;
      const sentDrops = drops.filter((d) => d.isSent()).length;
      const cancelledDrops = drops.filter((d) => d.isCancelled()).length;
      const upcomingDrops = drops.filter(
        (d) => d.scheduledDate > now && d.isScheduled()
      ).length;
      const overdueDrops = drops.filter((d) => d.isOverdue()).length;

      const analytics: DropAnalytics = {
        totalDrops,
        scheduledDrops,
        sentDrops,
        cancelledDrops,
        upcomingDrops,
        overdueDrops,
      };

      return { success: true, data: analytics };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get analytics: ${error.message}`),
      };
    }
  }

  /**
   * Get overdue drops
   */
  async getOverdueDrops(): Promise<Result<Drop[]>> {
    try {
      const filters: DropFilters = {
        status: DropStatus.SCHEDULED,
        scheduledBefore: new Date(),
      };

      const result = await this.deps.dropRepository.list(filters, 1, 1000);
      if (!result.success) {
        return result;
      }

      const overdueDrops = result.data.drops.filter((d) => d.isOverdue());
      return { success: true, data: overdueDrops };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get overdue drops: ${error.message}`),
      };
    }
  }

  /**
   * Validate create data with business rules
   */
  private async validateCreateData(
    data: CreateDropData
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Basic validation
    const basicValidation = Drop.validateCreateData(data);
    if (!basicValidation.isValid) {
      errors.push(...basicValidation.errors);
    }

    // Business rules
    if (data.scheduledDate) {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      if (data.scheduledDate < oneHourFromNow) {
        errors.push("Drops must be scheduled at least 1 hour in advance");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate update data with business rules
   */
  private async validateUpdateData(
    dropId: string,
    data: UpdateDropData
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Get current drop for validation context
    const currentResult = await this.deps.dropRepository.findById(dropId);
    if (!currentResult.success) {
      errors.push("Drop not found");
      return { isValid: false, errors };
    }

    const currentDrop = currentResult.data;

    // Business rules
    if (data.scheduledDate) {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      if (data.scheduledDate < oneHourFromNow && !currentDrop.isSent()) {
        errors.push("Drops must be scheduled at least 1 hour in advance");
      }
    }

    // Prevent status changes that don't make sense
    if (data.status) {
      if (currentDrop.isSent() && data.status !== DropStatus.SENT) {
        errors.push("Cannot change status of a sent drop");
      }
      if (currentDrop.isCancelled() && data.status !== DropStatus.CANCELLED) {
        errors.push("Cannot change status of a cancelled drop");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
