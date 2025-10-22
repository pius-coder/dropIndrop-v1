import { Product } from "../../product/domain/product";

export interface DropMessageData {
  dropName?: string;
  products: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    images: string[];
    sku?: string;
  }>;
  scheduledDate: Date;
  businessInfo?: {
    name?: string;
    phone?: string;
    website?: string;
    address?: string;
  };
}

export interface FormattedMessage {
  text: string;
  hasMedia: boolean;
  mediaUrls?: string[];
}

/**
 * WhatsApp Message Formatter
 * Formats drop messages with professional templates and proper WhatsApp formatting
 */
export class MessageFormatter {
  private static readonly MAX_MESSAGE_LENGTH = 4096; // WhatsApp limit
  private static readonly BUSINESS_INFO = {
    name: "DropInDrop",
    phone: "+237 6XX XXX XXX", // Placeholder
    website: "https://dropindrop.com",
    address: "Douala, Cameroon",
  };

  /**
   * Format a complete drop message for WhatsApp
   */
  static formatDropMessage(data: DropMessageData): FormattedMessage {
    const businessInfo = data.businessInfo || this.BUSINESS_INFO;

    let message = this.buildHeader(data.dropName);
    message += this.buildProductList(data.products);
    message += this.buildFooter(data.scheduledDate, businessInfo);

    // Ensure message doesn't exceed WhatsApp limits
    if (message.length > this.MAX_MESSAGE_LENGTH) {
      message = this.truncateMessage(message);
    }

    return {
      text: message,
      hasMedia: data.products.some((p) => p.images.length > 0),
      mediaUrls: this.extractMediaUrls(data.products),
    };
  }

  /**
   * Build message header with drop name
   */
  private static buildHeader(dropName?: string): string {
    const title = dropName || "New Drop Available";
    return `🆕 *${this.escapeMarkdown(title)}*\n\n`;
  }

  /**
   * Build product list section
   */
  private static buildProductList(
    products: DropMessageData["products"]
  ): string {
    let productList = "📦 *Available Products:*\n\n";

    products.forEach((product, index) => {
      productList += this.formatProduct(product, index + 1);
      productList += "\n";
    });

    return productList;
  }

  /**
   * Format individual product
   */
  private static formatProduct(
    product: DropMessageData["products"][0],
    index: number
  ): string {
    let productText = `${index}. *${this.escapeMarkdown(product.name)}*\n`;
    productText += `💰 *${product.price.toLocaleString()} FCFA*\n`;

    if (product.description) {
      // Truncate description if too long
      const truncatedDesc =
        product.description.length > 100
          ? product.description.substring(0, 97) + "..."
          : product.description;
      productText += `📝 ${this.escapeMarkdown(truncatedDesc)}\n`;
    }

    if (product.sku) {
      productText += `🏷️ SKU: ${product.sku}\n`;
    }

    // Add clickable product link
    const productUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"
    }/products/${product.id}`;
    productText += `🔗 ${productUrl}\n`;

    if (product.images.length > 0) {
      productText += `🖼️ Product image available\n`;
    }

    return productText;
  }

  /**
   * Build message footer with business info and call-to-action
   */
  private static buildFooter(scheduledDate: Date, businessInfo: any): string {
    let footer = "\n" + "═".repeat(30) + "\n\n";

    // Call to action
    footer += "🚀 *Ready to order?*\n";
    footer += "📱 Contact us now to place your order!\n\n";

    // Business contact info
    if (businessInfo.phone) {
      footer += `📞 *Phone:* ${businessInfo.phone}\n`;
    }

    if (businessInfo.website) {
      footer += `🌐 *Website:* ${businessInfo.website}\n`;
    }

    if (businessInfo.address) {
      footer += `📍 *Location:* ${businessInfo.address}\n`;
    }

    // Drop scheduling info
    footer += `\n📅 *Drop Date:* ${this.formatDate(scheduledDate)}\n`;

    // Footer branding
    footer += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    footer += `💫 *${
      businessInfo.name || "DropInDrop"
    }* - Your Trusted Partner\n`;
    footer += `✨ Quality products, exceptional service`;

    return footer;
  }

  /**
   * Format date for WhatsApp message
   */
  private static formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Extract media URLs from products
   */
  private static extractMediaUrls(
    products: DropMessageData["products"]
  ): string[] {
    const urls: string[] = [];

    products.forEach((product) => {
      if (product.images.length > 0) {
        urls.push(product.images[0]); // Use first image
      }
    });

    return urls;
  }

  /**
   * Truncate message if it exceeds WhatsApp limits
   */
  private static truncateMessage(message: string): string {
    const maxLength = this.MAX_MESSAGE_LENGTH - 100; // Leave room for truncation notice
    const truncated = message.substring(0, maxLength);
    return truncated + "\n\n... *Message truncated due to length*";
  }

  /**
   * Escape markdown characters for WhatsApp
   */
  private static escapeMarkdown(text: string): string {
    // WhatsApp supports: *bold*, _italic_, ~strikethrough~, `code`
    // We need to escape these if they're not intended as formatting
    return text
      .replace(/\*/g, "\\*")
      .replace(/_/g, "\\_")
      .replace(/~/g, "\\~")
      .replace(/`/g, "\\`");
  }

  /**
   * Create a simple product announcement message
   */
  static formatProductAnnouncement(product: Product): string {
    let message = `🆕 *New Product Alert!*\n\n`;
    message += `*${this.escapeMarkdown(product.name)}*\n`;
    message += `💰 *${product.price.toLocaleString()} FCFA*\n`;

    if (product.description) {
      message += `📝 ${this.escapeMarkdown(product.description)}\n`;
    }

    if (product.sku) {
      message += `🏷️ SKU: ${product.sku}\n`;
    }

    // Add clickable product link
    const productUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"
    }/products/${product.id}`;
    message += `\n🔗 View Product: ${productUrl}\n`;
    message += `📱 Contact us to order this amazing product!`;

    return message;
  }

  /**
   * Create a promotional message template
   */
  static formatPromotionalMessage(
    title: string,
    content: string,
    discount?: { percentage?: number; amount?: number },
    expiryDate?: Date
  ): string {
    let message = `🎉 *${this.escapeMarkdown(title)}*\n\n`;
    message += `${this.escapeMarkdown(content)}\n\n`;

    if (discount) {
      if (discount.percentage) {
        message += `💸 *${discount.percentage}% OFF*\n`;
      } else if (discount.amount) {
        message += `💸 *Save ${discount.amount.toLocaleString()} FCFA*\n`;
      }
    }

    if (expiryDate) {
      message += `⏰ *Valid until:* ${this.formatDate(expiryDate)}\n`;
    }

    message += `\n🚀 Don't miss out! Contact us now!`;

    return message;
  }

  /**
   * Create an order confirmation message
   */
  static formatOrderConfirmation(
    orderNumber: string,
    customerName: string,
    totalAmount: number,
    deliveryDate?: Date
  ): string {
    let message = `✅ *Order Confirmation*\n\n`;
    message += `📋 *Order #:* ${orderNumber}\n`;
    message += `👤 *Customer:* ${this.escapeMarkdown(customerName)}\n`;
    message += `💰 *Total:* ${totalAmount.toLocaleString()} FCFA\n`;

    if (deliveryDate) {
      message += `🚚 *Expected Delivery:* ${this.formatDate(deliveryDate)}\n`;
    }

    message += `\nThank you for your order! We'll keep you updated on the delivery status.`;

    return message;
  }

  /**
   * Validate message length
   */
  static validateMessageLength(message: string): {
    isValid: boolean;
    length: number;
    maxLength: number;
  } {
    return {
      isValid: message.length <= this.MAX_MESSAGE_LENGTH,
      length: message.length,
      maxLength: this.MAX_MESSAGE_LENGTH,
    };
  }
}
