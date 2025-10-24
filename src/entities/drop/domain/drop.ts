import {
  BaseEntity,
  Result,
  ValidationResult,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../../lib/domain";

// Domain types for Drop entity
export interface CreateDropData {
  name: string;
  description?: string;
  scheduledDate: Date;
  createdBy: string;
  imageUrl?: string;
  productIds: string[];
  groupIds: string[];
}

export interface UpdateDropData {
  name?: string;
  description?: string;
  scheduledDate?: Date;
  createdBy?: string;
  imageUrl?: string;
  productIds?: string[];
  groupIds?: string[];
  status?: DropStatus;
  isActive?: boolean;
}

export interface DropFilters {
  status?: DropStatus;
  scheduledAfter?: Date;
  scheduledBefore?: Date;
  createdBy?: string;
  isActive?: boolean;
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
  public readonly name: string;
  public readonly description?: string;
  public readonly scheduledDate: Date;
  public readonly status: DropStatus;
  public readonly sentAt?: Date;
  public readonly messageId?: string;
  public readonly createdBy: string;
  public readonly imageUrl?: string;
  public readonly isActive: boolean;
  public readonly products: DropProduct[];
  public readonly groups: DropGroup[];

  constructor(
    id: string,
    name: string,
    scheduledDate: Date,
    createdBy: string,
    products: DropProduct[] = [],
    groups: DropGroup[] = [],
    status: DropStatus = DropStatus.DRAFT,
    description?: string,
    imageUrl?: string,
    isActive: boolean = true,
    sentAt?: Date,
    messageId?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.description = description;
    this.scheduledDate = scheduledDate;
    this.status = status;
    this.sentAt = sentAt;
    this.messageId = messageId;
    this.createdBy = createdBy;
    this.imageUrl = imageUrl;
    this.isActive = isActive;
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

  public hasImage(): boolean {
    return !!this.imageUrl;
  }

  public isActiveDrop(): boolean {
    return this.isActive;
  }

  public canBeActivated(): boolean {
    return !this.isActive;
  }

  public canBeDeactivated(): boolean {
    return this.isActive && this.isDraft();
  }

  public activate(): Result<Drop> {
    if (!this.canBeActivated()) {
      return {
        success: false,
        error: new ValidationError("Drop cannot be activated"),
      };
    }

    const updatedDrop = new Drop(
      this.id,
      this.name,
      this.scheduledDate,
      this.createdBy,
      this.products,
      this.groups,
      this.status,
      this.description,
      this.imageUrl,
      true,
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

  public deactivate(): Result<Drop> {
    if (!this.canBeDeactivated()) {
      return {
        success: false,
        error: new ValidationError("Drop cannot be deactivated"),
      };
    }

    const updatedDrop = new Drop(
      this.id,
      this.name,
      this.scheduledDate,
      this.createdBy,
      this.products,
      this.groups,
      this.status,
      this.description,
      this.imageUrl,
      false,
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
      this.name,
      this.scheduledDate,
      this.createdBy,
      this.products,
      this.groups,
      DropStatus.SCHEDULED,
      this.description,
      this.imageUrl,
      this.isActive,
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
      this.name,
      this.scheduledDate,
      this.createdBy,
      this.products,
      this.groups,
      DropStatus.SENT,
      this.description,
      this.imageUrl,
      this.isActive,
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
      this.name,
      this.scheduledDate,
      this.createdBy,
      this.products,
      this.groups,
      DropStatus.CANCELLED,
      this.description,
      this.imageUrl,
      this.isActive,
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
      updates.name !== undefined ? updates.name : this.name,
      updates.scheduledDate || this.scheduledDate,
      updates.createdBy || this.createdBy,
      updates.productIds
        ? updates.productIds.map((id, index) => ({
            productId: id,
            sortOrder: index,
          }))
        : this.products,
      updates.groupIds
        ? updates.groupIds.map((id) => ({ groupId: id }))
        : this.groups,
      updates.status || this.status,
      updates.description !== undefined
        ? updates.description
        : this.description,
      updates.imageUrl !== undefined ? updates.imageUrl : this.imageUrl,
      updates.isActive ?? this.isActive,
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
      if (!updates.name || !updates.name.trim()) {
        errors.push("Drop name is required");
      } else if (updates.name.length < 2 || updates.name.length > 200) {
        errors.push("Drop name must be between 2 and 200 characters");
      }
    }

    if (updates.description !== undefined && updates.description) {
      if (updates.description.length > 500) {
        errors.push("Drop description must be 500 characters or less");
      }
    }

    if (updates.imageUrl !== undefined && updates.imageUrl) {
      if (updates.imageUrl.length > 500) {
        errors.push("Image URL must be 500 characters or less");
      }
      try {
        new URL(updates.imageUrl);
      } catch {
        errors.push("Image URL must be a valid URL");
      }
    }

    if (updates.scheduledDate !== undefined) {
      if (!updates.scheduledDate) {
        errors.push("Scheduled date is required");
      } else if (updates.scheduledDate < new Date()) {
        errors.push("Scheduled date cannot be in the past");
      }
    }

    if (updates.createdBy !== undefined) {
      if (!updates.createdBy || !updates.createdBy.trim()) {
        errors.push("Created by is required");
      }
    }

    if (updates.productIds !== undefined) {
      if (!updates.productIds || updates.productIds.length === 0) {
        errors.push("Drop must have at least one product");
      }
      if (new Set(updates.productIds).size !== updates.productIds.length) {
        errors.push("Duplicate products are not allowed");
      }
    }

    if (updates.groupIds !== undefined) {
      if (!updates.groupIds || updates.groupIds.length === 0) {
        errors.push("Drop must have at least one group");
      }
      if (new Set(updates.groupIds).size !== updates.groupIds.length) {
        errors.push("Duplicate groups are not allowed");
      }
    }

    if (updates.status !== undefined) {
      const validStatuses = Object.values(DropStatus);
      if (!validStatuses.includes(updates.status)) {
        errors.push("Invalid drop status");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateCreateData(data: CreateDropData): ValidationResult {
    const errors: string[] = [];

    if (!data.name || !data.name.trim()) {
      errors.push("Drop name is required");
    } else if (data.name.length < 2 || data.name.length > 200) {
      errors.push("Drop name must be between 2 and 200 characters");
    }

    if (data.description && data.description.length > 500) {
      errors.push("Drop description must be 500 characters or less");
    }

    if (data.imageUrl && data.imageUrl.length > 500) {
      errors.push("Image URL must be 500 characters or less");
    }

    if (data.imageUrl) {
      try {
        new URL(data.imageUrl);
      } catch {
        errors.push("Image URL must be a valid URL");
      }
    }

    if (!data.scheduledDate) {
      errors.push("Scheduled date is required");
    } else if (data.scheduledDate < new Date()) {
      errors.push("Scheduled date cannot be in the past");
    }

    if (!data.createdBy || !data.createdBy.trim()) {
      errors.push("Created by is required");
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

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Value objects for Drop domain
export class DropName {
  constructor(public readonly value: string) {
    if (!value || !value.trim()) {
      throw new ValidationError("Drop name is required");
    }
    if (value.length < 2 || value.length > 200) {
      throw new ValidationError(
        "Drop name must be between 2 and 200 characters"
      );
    }
  }

  public toString(): string {
    return this.value;
  }

  public isEmpty(): boolean {
    return !this.value.trim();
  }
}

export class DropDescription {
  constructor(public readonly value?: string) {
    if (value && value.length > 500) {
      throw new ValidationError(
        "Drop description must be 500 characters or less"
      );
    }
  }

  public toString(): string | undefined {
    return this.value;
  }

  public isEmpty(): boolean {
    return !this.value || !this.value.trim();
  }
}

export class DropImageUrl {
  constructor(public readonly value?: string) {
    if (value) {
      if (value.length > 500) {
        throw new ValidationError("Image URL must be 500 characters or less");
      }
      try {
        new URL(value);
      } catch {
        throw new ValidationError("Image URL must be a valid URL");
      }
    }
  }

  public toString(): string | undefined {
    return this.value;
  }

  public isEmpty(): boolean {
    return !this.value;
  }
}

export class ScheduledDate {
  constructor(public readonly value: Date) {
    if (!value) {
      throw new ValidationError("Scheduled date is required");
    }
    if (value < new Date()) {
      throw new ValidationError("Scheduled date cannot be in the past");
    }
  }

  public isToday(): boolean {
    const today = new Date();
    return (
      this.value.getFullYear() === today.getFullYear() &&
      this.value.getMonth() === today.getMonth() &&
      this.value.getDate() === today.getDate()
    );
  }

  public isInPast(): boolean {
    return this.value < new Date();
  }

  public isInFuture(): boolean {
    return this.value > new Date();
  }
}
