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
  | { success: true; isSuccess: true; data: T; value: T }
  | { success: false; isSuccess: false; error: E };

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

// Proper Result companion object implementation (matches existing usage patterns)
export const Result = {
  ok<T>(data?: T): Result<T> {
    return {
      success: true,
      isSuccess: true,
      data: data as T,
      value: data as T,
    };
  },

  success<T>(data?: T): Result<T> {
    return this.ok(data);
  },

  err<E = Error>(error: E): Result<never, E> {
    return {
      success: false,
      isSuccess: false,
      error: error as E,
    };
  },

  failure<T = never>(error: Error): Result<T> {
    return this.err(error);
  },

  isSuccess<T, E>(
    result: Result<T, E>
  ): result is Result<T, E> & { success: true; isSuccess: true } {
    return result.success && result.isSuccess;
  },

  isFailure<T, E>(
    result: Result<T, E>
  ): result is Result<T, E> & { success: false; isSuccess: false } {
    return !result.success && !result.isSuccess;
  },

  from<T>(value: T | Error): Result<T> {
    if (value instanceof Error) {
      return this.err(value);
    }
    return this.ok(value);
  },

  async fromPromise<T>(promise: Promise<T>): Promise<Result<T>> {
    try {
      const data = await promise;
      return this.ok(data);
    } catch (error) {
      return this.err(error as Error);
    }
  },

  map<T, U, E>(result: Result<T, E>, mapper: (value: T) => U): Result<U, E> {
    if (this.isSuccess(result)) {
      return this.ok(mapper(result.data)) as Result<U, E>;
    }
    return result;
  },

  flatMap<T, U, E>(
    result: Result<T, E>,
    mapper: (value: T) => Result<U, E>
  ): Result<U, E> {
    if (this.isSuccess(result)) {
      return mapper(result.data);
    }
    return result;
  },

  unwrap<T, E>(result: Result<T, E>): T {
    if (this.isSuccess(result)) {
      return result.data;
    }
    throw result.error;
  },

  unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    if (this.isSuccess(result)) {
      return result.data;
    }
    return defaultValue;
  },

  unwrapOrElse<T, E>(result: Result<T, E>, defaultFn: (error: E) => T): T {
    if (this.isSuccess(result)) {
      return result.data;
    }
    return defaultFn(result.error);
  },
};
