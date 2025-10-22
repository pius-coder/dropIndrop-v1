import {
  BaseEntity,
  Result,
  ValidationResult,
  ValidationError,
  NotFoundError,
} from "../../../lib/domain";

// Domain types for Drop entity
export interface CreateDropData {
  name?: string;
  scheduledDate: Date;
  productIds: string[];
  groupIds: string[];
}

export interface UpdateDropData {
  name?: string;
  scheduledDate?: Date;
  productIds?: string[];
  groupIds?: string[];
  status?: DropStatus;
}

export interface DropFilters {
  status?: DropStatus;
  scheduledAfter?: Date;
  scheduledBefore?: Date;
  createdBy?: string;
  search?: string;
}

export interface DropListResult {
  drops: Drop[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DropProduct {
  productId: string;
  sortOrder: number;
}

export interface DropGroup {
  groupId: string;
}

export enum DropStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  SENT = "SENT",
  CANCELLED = "CANCELLED",
}

// Drop domain entity
export class Drop extends BaseEntity {
  public readonly name?: string;
  public readonly scheduledDate: Date;
  public readonly status: DropStatus;
  public readonly sentAt?: Date;
  public readonly messageId?: string;
  public readonly createdBy: string;
  public readonly products: DropProduct[];
  public readonly groups: DropGroup[];

  constructor(
    id: string,
    scheduledDate: Date,
    createdBy: string,
    products: DropProduct[] = [],
    groups: DropGroup[] = [],
    name?: string,
    status: DropStatus = DropStatus.DRAFT,
    sentAt?: Date,
    messageId?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.scheduledDate = scheduledDate;
    this.status = status;
    this.sentAt = sentAt;
    this.messageId = messageId;
    this.createdBy = createdBy;
    this.products = products;
    this.groups = groups;
  }

  // Business logic methods
  public isScheduled(): boolean {
    return this.status === DropStatus.SCHEDULED;
  }

  public isSent(): boolean {
    return this.status === DropStatus.SENT;
  }

  public isDraft(): boolean {
    return this.status === DropStatus.DRAFT;
  }

  public isCancelled(): boolean {
    return this.status === DropStatus.CANCELLED;
  }

  public canBeEdited(): boolean {
    return this.isDraft() || this.isScheduled();
  }

  public canBeSent(): boolean {
    return this.isDraft() || this.isScheduled();
  }

  public canBeCancelled(): boolean {
    return this.isDraft() || this.isScheduled();
  }

  public isScheduledFor(date: Date): boolean {
    const dropDate = new Date(this.scheduledDate);
    const checkDate = new Date(date);
    return (
      dropDate.getFullYear() === checkDate.getFullYear() &&
      dropDate.getMonth() === checkDate.getMonth() &&
      dropDate.getDate() === checkDate.getDate()
    );
  }

  public isOverdue(): boolean {
    return (
      this.scheduledDate < new Date() && !this.isSent() && !this.isCancelled()
    );
  }

  public getProductIds(): string[] {
    return this.products.map((p) => p.productId);
  }

  public getGroupIds(): string[] {
    return this.groups.map((g) => g.groupId);
  }

  public hasProducts(): boolean {
    return this.products.length > 0;
  }

  public hasGroups(): boolean {
    return this.groups.length > 0;
  }

  // Status transition methods
  public schedule(): Result<Drop> {
    if (!this.canBeSent()) {
      return {
        success: false,
        error: new ValidationError(
          "Drop cannot be scheduled in current status"
        ),
      };
    }

    if (!this.hasProducts()) {
      return {
        success: false,
        error: new ValidationError("Drop must have at least one product"),
      };
    }

    if (!this.hasGroups()) {
      return {
        success: false,
        error: new ValidationError("Drop must have at least one group"),
      };
    }

    const updatedDrop = new Drop(
      this.id,
      this.scheduledDate,
      this.createdBy,
      this.products,
      this.groups,
      this.name,
      DropStatus.SCHEDULED,
      this.sentAt,
      this.messageId,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedDrop,
    };
  }

  public markAsSent(messageId?: string): Result<Drop> {
    if (!this.canBeSent()) {
      return {
        success: false,
        error: new ValidationError("Drop cannot be sent in current status"),
      };
    }

    const updatedDrop = new Drop(
      this.id,
      this.scheduledDate,
      this.createdBy,
      this.products,
      this.groups,
      this.name,
      DropStatus.SENT,
      new Date(),
      messageId,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedDrop,
    };
  }

  public cancel(): Result<Drop> {
    if (!this.canBeCancelled()) {
      return {
        success: false,
        error: new ValidationError(
          "Drop cannot be cancelled in current status"
        ),
      };
    }

    const updatedDrop = new Drop(
      this.id,
      this.scheduledDate,
      this.createdBy,
      this.products,
      this.groups,
      this.name,
      DropStatus.CANCELLED,
      this.sentAt,
      this.messageId,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedDrop,
    };
  }

  public updateDetails(updates: UpdateDropData): Result<Drop> {
    if (!this.canBeEdited()) {
      return {
        success: false,
        error: new ValidationError("Drop cannot be edited in current status"),
      };
    }

    // Validate updates
    const validation = this.validateUpdates(updates);
    if (!validation.isValid) {
      return {
        success: false,
        error: new ValidationError(validation.errors.join(", ")),
      };
    }

    // Create updated drop
    const updatedDrop = new Drop(
      this.id,
      updates.scheduledDate || this.scheduledDate,
      this.createdBy,
      updates.productIds
        ? updates.productIds.map((id, index) => ({
            productId: id,
            sortOrder: index,
          }))
        : this.products,
      updates.groupIds
        ? updates.groupIds.map((id) => ({ groupId: id }))
        : this.groups,
      updates.name !== undefined ? updates.name : this.name,
      updates.status || this.status,
      this.sentAt,
      this.messageId,
      this.createdAt,
      new Date()
    );

    return {
      success: true,
      data: updatedDrop,
    };
  }

  // Validation methods
  private validateUpdates(updates: UpdateDropData): ValidationResult {
    const errors: string[] = [];

    if (updates.name !== undefined) {
      if (updates.name && updates.name.length > 200) {
        errors.push("Drop name must be 200 characters or less");
      }
    }

    if (updates.scheduledDate !== undefined) {
      if (updates.scheduledDate < new Date()) {
        errors.push("Scheduled date cannot be in the past");
      }
    }

    if (updates.productIds !== undefined) {
      if (updates.productIds.length === 0) {
        errors.push("Drop must have at least one product");
      }
      if (new Set(updates.productIds).size !== updates.productIds.length) {
        errors.push("Duplicate products are not allowed");
      }
    }

    if (updates.groupIds !== undefined) {
      if (updates.groupIds.length === 0) {
        errors.push("Drop must have at least one group");
      }
      if (new Set(updates.groupIds).size !== updates.groupIds.length) {
        errors.push("Duplicate groups are not allowed");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateCreateData(data: CreateDropData): ValidationResult {
    const errors: string[] = [];

    if (!data.scheduledDate) {
      errors.push("Scheduled date is required");
    } else if (data.scheduledDate < new Date()) {
      errors.push("Scheduled date cannot be in the past");
    }

    if (!data.productIds || data.productIds.length === 0) {
      errors.push("Drop must have at least one product");
    } else if (new Set(data.productIds).size !== data.productIds.length) {
      errors.push("Duplicate products are not allowed");
    }

    if (!data.groupIds || data.groupIds.length === 0) {
      errors.push("Drop must have at least one group");
    } else if (new Set(data.groupIds).size !== data.groupIds.length) {
      errors.push("Duplicate groups are not allowed");
    }

    if (data.name && data.name.length > 200) {
      errors.push("Drop name must be 200 characters or less");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
