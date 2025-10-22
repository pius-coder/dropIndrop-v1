import {
  BaseEntity,
  Result,
  ValidationResult,
  ValidationError,
  NotFoundError,
} from "../../../lib/domain";

// Domain types for WhatsApp Group entity
export interface CreateWhatsAppGroupData {
  name: string;
  chatId: string;
  description?: string;
  memberCount?: number;
}

export interface UpdateWhatsAppGroupData {
  name?: string;
  description?: string;
  memberCount?: number;
  isActive?: boolean;
}

export interface WhatsAppGroupFilters {
  isActive?: boolean;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface WhatsAppGroupListResult {
  groups: WhatsAppGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// WhatsApp Group domain entity
export class WhatsAppGroup extends BaseEntity {
  public readonly name: string;
  public readonly chatId: string;
  public readonly description?: string;
  public readonly isActive: boolean;
  public readonly memberCount?: number;

  constructor(
    id: string,
    name: string,
    chatId: string,
    description?: string,
    memberCount?: number,
    isActive: boolean = true,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.chatId = chatId;
    this.description = description;
    this.memberCount = memberCount;
    this.isActive = isActive;
  }

  // Business logic methods
  public isActiveGroup(): boolean {
    return this.isActive;
  }

  public hasMembers(): boolean {
    return this.memberCount !== undefined && this.memberCount > 0;
  }

  public isValidChatId(): boolean {
    // WhatsApp group chat IDs typically end with @g.us
    return this.chatId.endsWith("@g.us") || this.chatId.endsWith("@c.us");
  }

  public canBeUsedForDrops(): boolean {
    return this.isActive && this.isValidChatId();
  }

  public updateDetails(
    updates: UpdateWhatsAppGroupData
  ): Result<WhatsAppGroup> {
    // Validate updates
    const validation = this.validateUpdates(updates);
    if (!validation.isValid) {
      return {
        success: false,
        error: new ValidationError(validation.errors.join(", ")),
      };
    }

    // Create updated group
    const updatedGroup = new WhatsAppGroup(
      this.id,
      updates.name || this.name,
      this.chatId, // chatId cannot be updated
      updates.description !== undefined
        ? updates.description
        : this.description,
      updates.memberCount ?? this.memberCount,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedGroup,
    };
  }

  public deactivate(): WhatsAppGroup {
    return new WhatsAppGroup(
      this.id,
      this.name,
      this.chatId,
      this.description,
      this.memberCount,
      false,
      this.createdAt,
      new Date()
    );
  }

  public activate(): WhatsAppGroup {
    return new WhatsAppGroup(
      this.id,
      this.name,
      this.chatId,
      this.description,
      this.memberCount,
      true,
      this.createdAt,
      new Date()
    );
  }

  // Validation methods
  private validateUpdates(updates: UpdateWhatsAppGroupData): ValidationResult {
    const errors: string[] = [];

    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        errors.push("Group name is required");
      } else if (updates.name.length < 1 || updates.name.length > 100) {
        errors.push("Group name must be between 1 and 100 characters");
      }
    }

    if (updates.description !== undefined && updates.description) {
      if (updates.description.length > 500) {
        errors.push("Description must be 500 characters or less");
      }
    }

    if (updates.memberCount !== undefined && updates.memberCount < 0) {
      errors.push("Member count cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateCreateData(
    data: CreateWhatsAppGroupData
  ): ValidationResult {
    const errors: string[] = [];

    if (!data.name || !data.name.trim()) {
      errors.push("Group name is required");
    } else if (data.name.length < 1 || data.name.length > 100) {
      errors.push("Group name must be between 1 and 100 characters");
    }

    if (!data.chatId || !data.chatId.trim()) {
      errors.push("Chat ID is required");
    } else {
      // Validate chat ID format
      const isValidFormat =
        data.chatId.endsWith("@g.us") || data.chatId.endsWith("@c.us");
      if (!isValidFormat) {
        errors.push(
          "Chat ID must end with @g.us (group) or @c.us (individual)"
        );
      }
    }

    if (data.description && data.description.length > 500) {
      errors.push("Description must be 500 characters or less");
    }

    if (data.memberCount !== undefined && data.memberCount < 0) {
      errors.push("Member count cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
