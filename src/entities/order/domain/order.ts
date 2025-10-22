import { OrderStatus } from "@prisma/client";

export interface OrderEntity {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentIntentId?: string;
  paidAt?: Date;
  deliveredAt?: Date;
  deliveredBy?: string;
  notes?: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemEntity {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderData {
  orderNumber: string;
  customerId: string;
  totalAmount: number;
  status?: OrderStatus;
  paymentIntentId?: string;
  createdById?: string;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  paymentIntentId?: string;
  paidAt?: Date;
  deliveredAt?: Date;
  deliveredBy?: string;
  notes?: string;
}

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

export class Order {
  constructor(private data: OrderEntity) {}

  static create(data: CreateOrderData): Order {
    this.validateCreateData(data);

    const orderData: OrderEntity = {
      id: "", // Will be set by database
      orderNumber: data.orderNumber,
      customerId: data.customerId,
      status: data.status || "PENDING",
      totalAmount: data.totalAmount,
      paymentIntentId: data.paymentIntentId,
      createdById: data.createdById,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Order(orderData);
  }

  static validateCreateData(data: CreateOrderData): void {
    const errors: string[] = [];

    if (!data.orderNumber || data.orderNumber.trim().length === 0) {
      errors.push("Order number is required");
    }

    if (!data.customerId || data.customerId.trim().length === 0) {
      errors.push("Customer ID is required");
    }

    if (data.totalAmount < 0) {
      errors.push("Total amount cannot be negative");
    }

    if (data.totalAmount > 1000000) {
      errors.push("Total amount exceeds maximum limit");
    }

    if (errors.length > 0) {
      throw new OrderValidationError(
        `Order validation failed: ${errors.join("; ")}`
      );
    }
  }

  update(data: UpdateOrderData): void {
    this.validateUpdateData(data);

    if (data.status !== undefined) {
      this.data.status = data.status;
    }

    if (data.paymentIntentId !== undefined) {
      this.data.paymentIntentId = data.paymentIntentId;
    }

    if (data.paidAt !== undefined) {
      this.data.paidAt = data.paidAt;
    }

    if (data.deliveredAt !== undefined) {
      this.data.deliveredAt = data.deliveredAt;
    }

    if (data.deliveredBy !== undefined) {
      this.data.deliveredBy = data.deliveredBy;
    }

    if (data.notes !== undefined) {
      this.data.notes = data.notes;
    }

    this.data.updatedAt = new Date();
  }

  validateUpdateData(data: UpdateOrderData): void {
    const errors: string[] = [];

    // Status transition validation
    if (data.status !== undefined) {
      const validStatuses: OrderStatus[] = [
        "PENDING",
        "PAID",
        "DELIVERED",
        "CANCELLED",
      ];
      if (!validStatuses.includes(data.status)) {
        errors.push(`Invalid status: ${data.status}`);
      }

      // Business rule: cannot change status from DELIVERED or CANCELLED
      if (
        (this.data.status === "DELIVERED" ||
          this.data.status === "CANCELLED") &&
        data.status !== this.data.status
      ) {
        errors.push("Cannot change status from delivered or cancelled orders");
      }

      // Business rule: can only mark as PAID if there's a payment intent
      if (
        data.status === "PAID" &&
        !this.data.paymentIntentId &&
        !data.paymentIntentId
      ) {
        errors.push("Cannot mark as paid without payment intent");
      }
    }

    if (errors.length > 0) {
      throw new OrderValidationError(
        `Order update validation failed: ${errors.join("; ")}`
      );
    }
  }

  // Getters
  get id(): string {
    return this.data.id;
  }
  get orderNumber(): string {
    return this.data.orderNumber;
  }
  get customerId(): string {
    return this.data.customerId;
  }
  get status(): OrderStatus {
    return this.data.status;
  }
  get totalAmount(): number {
    return this.data.totalAmount;
  }
  get paymentIntentId(): string | undefined {
    return this.data.paymentIntentId;
  }
  get paidAt(): Date | undefined {
    return this.data.paidAt;
  }
  get deliveredAt(): Date | undefined {
    return this.data.deliveredAt;
  }
  get deliveredBy(): string | undefined {
    return this.data.deliveredBy;
  }
  get notes(): string | undefined {
    return this.data.notes;
  }
  get createdById(): string | undefined {
    return this.data.createdById;
  }
  get createdAt(): Date {
    return this.data.createdAt;
  }
  get updatedAt(): Date {
    return this.data.updatedAt;
  }

  // Business logic methods
  isPaid(): boolean {
    return this.data.status === "PAID";
  }

  isDelivered(): boolean {
    return this.data.status === "DELIVERED";
  }

  isCancelled(): boolean {
    return this.data.status === "CANCELLED";
  }

  canBePaid(): boolean {
    return this.data.status === "PENDING" && !this.data.paymentIntentId;
  }

  canBeDelivered(): boolean {
    return this.data.status === "PAID";
  }

  canBeCancelled(): boolean {
    return this.data.status === "PENDING" || this.data.status === "PAID";
  }

  toJSON(): OrderEntity {
    return { ...this.data };
  }
}
