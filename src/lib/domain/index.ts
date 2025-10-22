// Base domain types and interfaces for the DropInDrop platform

// Common domain patterns
export class BaseEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(id: string, createdAt?: Date, updatedAt?: Date) {
    this.id = id;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}

export interface AuditableEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Utility types for domain operations
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Domain event pattern
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  timestamp: Date;
  data: Record<string, any>;
}

// Repository pattern interface
export interface IRepository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findMany(criteria?: Partial<T>): Promise<T[]>;
  create(entity: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// Service pattern interface
export interface IService<T extends BaseEntity, TCreate, TUpdate> {
  getById(id: string): Promise<Result<T>>;
  getMany(criteria?: Partial<T>): Promise<Result<T[]>>;
  create(data: TCreate): Promise<Result<T>>;
  update(id: string, data: TUpdate): Promise<Result<T>>;
  delete(id: string): Promise<Result<boolean>>;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Domain error types
export class DomainError extends Error {
  constructor(message: string, public code: string, public field?: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, field?: string) {
    super(message, "VALIDATION_ERROR", field);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string) {
    super(
      `${resource}${id ? ` with id ${id}` : ""} not found`,
      "NOT_FOUND",
      id
    );
    this.name = "NotFoundError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, field?: string) {
    super(message, "CONFLICT", field);
    this.name = "ConflictError";
  }
}
