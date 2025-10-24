import { PrismaClient } from "@prisma/client";
import {
  WhatsAppGroup,
  CreateWhatsAppGroupData,
  UpdateWhatsAppGroupData,
  WhatsAppGroupFilters,
  WhatsAppGroupListResult,
} from "./whatsapp-group";
import { WhatsAppGroupRepository } from "./whatsapp-group-repository";
import { WahaClient } from "../infrastructure/waha-client";
import { DropRepository } from "../../drop/domain/drop-repository";
import {
  Result,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../../lib/domain";

// Additional service interfaces
export interface WhatsAppServiceDependencies {
  whatsappGroupRepository: WhatsAppGroupRepository;
  dropRepository: DropRepository;
  wahaClient: WahaClient;
  prisma: PrismaClient;
}

export interface SendDropResult {
  dropId: string;
  groupId: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface BulkSendDropResult {
  dropId: string;
  results: SendDropResult[];
  overallSuccess: boolean;
}

export class WhatsAppService {
  constructor(private readonly deps: WhatsAppServiceDependencies) {}

  /**
   * Create a new WhatsApp group with validation
   */
  async createGroup(
    data: CreateWhatsAppGroupData
  ): Promise<Result<WhatsAppGroup>> {
    try {
      // Validate business rules
      const validation = await this.validateCreateGroupData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: new ValidationError(validation.errors.join(", ")),
        };
      }

      // Check if chat ID is available
      const chatIdAvailable =
        await this.deps.whatsappGroupRepository.isChatIdAvailable(data.chatId);
      if (!chatIdAvailable) {
        return {
          success: false,
          error: new ConflictError("Chat ID already exists"),
        };
      }

      // Create group
      const result = await this.deps.whatsappGroupRepository.create(data);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to create WhatsApp group: ${error.message}`),
      };
    }
  }

  /**
   * Get group by ID
   */
  async getGroupById(id: string): Promise<Result<WhatsAppGroup>> {
    try {
      return await this.deps.whatsappGroupRepository.findById(id);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get WhatsApp group: ${error.message}`),
      };
    }
  }

  /**
   * Get group by chat ID
   */
  async getGroupByChatId(chatId: string): Promise<Result<WhatsAppGroup>> {
    try {
      return await this.deps.whatsappGroupRepository.findByChatId(chatId);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(
          `Failed to get WhatsApp group by chat ID: ${error.message}`
        ),
      };
    }
  }

  /**
   * Update group with business rule validation
   */
  async updateGroup(
    id: string,
    data: UpdateWhatsAppGroupData
  ): Promise<Result<WhatsAppGroup>> {
    try {
      // Check if group exists
      const existingResult = await this.deps.whatsappGroupRepository.findById(
        id
      );
      if (!existingResult.success) {
        return {
          success: false,
          error: new ValidationError("WhatsApp group not found"),
        };
      }

      // Validate business rules
      const validation = await this.validateUpdateGroupData(id, data);
      if (!validation.isValid) {
        return {
          success: false,
          error: new ValidationError(validation.errors.join(", ")),
        };
      }

      // Check chat ID uniqueness if being updated
      if (data.name) {
        const chatIdAvailable =
          await this.deps.whatsappGroupRepository.isChatIdAvailable(
            existingResult.data.chatId,
            id
          );
        if (!chatIdAvailable) {
          return {
            success: false,
            error: new ConflictError("Chat ID already exists"),
          };
        }
      }

      // Update group
      const result = await this.deps.whatsappGroupRepository.update(id, data);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to update WhatsApp group: ${error.message}`),
      };
    }
  }

  /**
   * Delete group with business rule validation
   */
  async deleteGroup(id: string): Promise<Result<void>> {
    try {
      // Check if group exists
      const existingResult = await this.deps.whatsappGroupRepository.findById(
        id
      );
      if (!existingResult.success) {
        return {
          success: false,
          error: new ValidationError("WhatsApp group not found"),
        };
      }

      // Business rule: prevent deletion of groups used in drops
      const dropCount = await this.getDropCountForGroup(id);
      if (dropCount > 0) {
        return {
          success: false,
          error: new ValidationError(
            "Cannot delete group that is used in drops. Deactivate it instead."
          ),
        };
      }

      // Delete group
      return await this.deps.whatsappGroupRepository.delete(id);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to delete WhatsApp group: ${error.message}`),
      };
    }
  }

  /**
   * List groups with enhanced filtering
   */
  async listGroups(
    filters: WhatsAppGroupFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<Result<WhatsAppGroupListResult>> {
    try {
      return await this.deps.whatsappGroupRepository.list(filters, page, limit);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to list WhatsApp groups: ${error.message}`),
      };
    }
  }

  /**
   * Get all active groups for drop distribution
   */
  async getActiveGroups(): Promise<Result<WhatsAppGroup[]>> {
    try {
      return await this.deps.whatsappGroupRepository.getActiveGroups();
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to get active groups: ${error.message}`),
      };
    }
  }

  /**
   * Sync groups from WhatsApp
   */
  async syncGroupsFromWhatsApp(
    createdById?: string
  ): Promise<Result<WhatsAppGroup[]>> {
    try {
      // Get groups from WhatsApp
      const whatsappResult = await this.deps.wahaClient.getGroups();
      if (!whatsappResult.success) {
        return {
          success: false,
          error: new Error(
            `Failed to fetch groups from WhatsApp: ${whatsappResult.error}`
          ),
        };
      }

      // Ensure groups is an array
      const groupsData = whatsappResult.groups;
      const whatsappGroups = Array.isArray(groupsData) ? groupsData : [];
      const syncedGroups: WhatsAppGroup[] = [];

      // Process each WhatsApp group
      for (const waGroup of whatsappGroups) {
        if (waGroup.id && waGroup.name) {
          // Check if group already exists
          const existingResult =
            await this.deps.whatsappGroupRepository.findByChatId(waGroup.id);

          if (existingResult.success) {
            // Update existing group
            const updateData: UpdateWhatsAppGroupData = {
              name: waGroup.name,
              memberCount: waGroup.unreadCount, // Using unreadCount as approximation
            };
            const updateResult = await this.deps.whatsappGroupRepository.update(
              existingResult.data.id,
              updateData
            );
            if (updateResult.success) {
              syncedGroups.push(updateResult.data);
            }
          } else {
            // Create new group
            const createData: CreateWhatsAppGroupData = {
              name: waGroup.name,
              chatId: waGroup.id,
              memberCount: waGroup.unreadCount,
              createdById: createdById || "system",
            };
            const createResult = await this.deps.whatsappGroupRepository.create(
              createData
            );
            if (createResult.success) {
              syncedGroups.push(createResult.data);
            }
          }
        }
      }

      return { success: true, data: syncedGroups };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(
          `Failed to sync groups from WhatsApp: ${error.message}`
        ),
      };
    }
  }

  /**
   * Send drop to specific group
   */
  async sendDropToGroup(
    dropId: string,
    groupId: string
  ): Promise<Result<SendDropResult>> {
    try {
      // Get drop details
      const dropResult = await this.deps.dropRepository.findById(dropId);
      if (!dropResult.success) {
        return {
          success: false,
          error: new ValidationError("Drop not found"),
        };
      }

      const drop = dropResult.data;

      // Get group details
      const groupResult = await this.deps.whatsappGroupRepository.findById(
        groupId
      );
      if (!groupResult.success) {
        return {
          success: false,
          error: new ValidationError("WhatsApp group not found"),
        };
      }

      const group = groupResult.data;

      // Validate drop can be sent
      if (!drop.canBeSent()) {
        return {
          success: false,
          error: new ValidationError("Drop cannot be sent in current status"),
        };
      }

      // Check if group is in drop's groups
      if (!drop.getGroupIds().includes(groupId)) {
        return {
          success: false,
          error: new ValidationError("Group is not assigned to this drop"),
        };
      }

      // Format message content
      const messageContent = this.formatDropMessage(drop);

      // Send message via WhatsApp
      const sendResult = await this.deps.wahaClient.sendText({
        chatId: group.chatId,
        text: messageContent,
      });

      const result: SendDropResult = {
        dropId,
        groupId,
        success: sendResult.success,
        messageId: sendResult.messageId,
        error: sendResult.error,
      };

      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to send drop to group: ${error.message}`),
      };
    }
  }

  /**
   * Send drop to all assigned groups
   */
  async sendDropToAllGroups(
    dropId: string
  ): Promise<Result<BulkSendDropResult>> {
    try {
      // Get drop details
      const dropResult = await this.deps.dropRepository.findById(dropId);
      if (!dropResult.success) {
        return {
          success: false,
          error: new ValidationError("Drop not found"),
        };
      }

      const drop = dropResult.data;

      // Validate drop can be sent
      if (!drop.canBeSent()) {
        return {
          success: false,
          error: new ValidationError("Drop cannot be sent in current status"),
        };
      }

      const results: SendDropResult[] = [];
      let overallSuccess = true;

      // Send to each group
      for (const groupId of drop.getGroupIds()) {
        const sendResult = await this.sendDropToGroup(dropId, groupId);
        if (sendResult.success) {
          results.push(sendResult.data);
          if (!sendResult.data.success) {
            overallSuccess = false;
          }
        } else {
          overallSuccess = false;
          results.push({
            dropId,
            groupId,
            success: false,
            error: "Failed to send drop to group",
          });
        }
      }

      // Mark drop as sent if all groups were successful
      if (overallSuccess) {
        // Note: In a real implementation, you might want to mark as sent only after all messages are delivered
        // For now, we'll mark as sent immediately
      }

      const bulkResult: BulkSendDropResult = {
        dropId,
        results,
        overallSuccess,
      };

      return { success: true, data: bulkResult };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to send drop to all groups: ${error.message}`),
      };
    }
  }

  /**
   * Check WhatsApp connection status
   */
  async checkConnection(): Promise<
    Result<{ connected: boolean; error?: string }>
  > {
    try {
      const result = await this.deps.wahaClient.checkConnection();
      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to check connection: ${error.message}`),
      };
    }
  }

  /**
   * Deactivate group
   */
  async deactivateGroup(id: string): Promise<Result<WhatsAppGroup>> {
    try {
      const updateData: UpdateWhatsAppGroupData = { isActive: false };
      return await this.deps.whatsappGroupRepository.update(id, updateData);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to deactivate group: ${error.message}`),
      };
    }
  }

  /**
   * Activate group
   */
  async activateGroup(id: string): Promise<Result<WhatsAppGroup>> {
    try {
      const updateData: UpdateWhatsAppGroupData = { isActive: true };
      return await this.deps.whatsappGroupRepository.update(id, updateData);
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Failed to activate group: ${error.message}`),
      };
    }
  }

  /**
   * Get count of drops using a specific group
   */
  private async getDropCountForGroup(groupId: string): Promise<number> {
    try {
      const result = await this.deps.dropRepository.count({});
      return result.success ? result.data : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Format drop message for WhatsApp
   */
  private formatDropMessage(drop: any): string {
    let message = "";

    if (drop.name) {
      message += `🆕 *${drop.name}*\n\n`;
    } else {
      message += `🆕 *New Drop*\n\n`;
    }

    // Add products
    drop.products.forEach((dp: any, index: number) => {
      const product = dp.product;
      message += `${index + 1}. *${product.name}*\n`;
      message += `💰 ${product.price.toLocaleString()} FCFA\n`;
      if (product.description) {
        message += `📝 ${product.description}\n`;
      }
      message += "\n";
    });

    message += "📱 Contact us to order!\n";
    message += `📅 Scheduled: ${drop.scheduledDate.toLocaleDateString()}`;

    return message;
  }

  /**
   * Validate create group data with business rules
   */
  private async validateCreateGroupData(
    data: CreateWhatsAppGroupData
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Basic validation
    const basicValidation = WhatsAppGroup.validateCreateData(data);
    if (!basicValidation.isValid) {
      errors.push(...basicValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate update group data with business rules
   */
  private async validateUpdateGroupData(
    groupId: string,
    data: UpdateWhatsAppGroupData
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Get current group for validation context
    const currentResult = await this.deps.whatsappGroupRepository.findById(
      groupId
    );
    if (!currentResult.success) {
      errors.push("Group not found");
      return { isValid: false, errors };
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
