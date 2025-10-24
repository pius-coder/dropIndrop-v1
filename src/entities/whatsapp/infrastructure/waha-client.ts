import { retry, sleep } from "../../../lib/utils";
import { WahaChatService } from "./chat";
import { WahaGroupService } from "./group";

// Types for WhatsApp operations
export interface WhatsAppMessage {
  id: string;
  body: string;
  from: string;
  to: string;
  timestamp: number;
  type: string;
  hasMedia: boolean;
}

// WAHA Response types
interface WahaResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface WahaMessageResponse {
  id: {
    fromMe: boolean;
    remote: string;
    id: string;
    self: string;
    _serialized: string;
  };
  ack: number;
  hasMedia: boolean;
  body: string;
  type: string;
  timestamp: number;
  from: string;
  to: string;
  deviceType: string;
  isForwarded: boolean;
  forwardingScore: number;
  isStatus: boolean;
  isStarred: boolean;
  fromMe: boolean;
  hasQuotedMsg: boolean;
  hasReaction: boolean;
  vCards: string[];
  mentionedIds: string[];
  groupMentions: any[];
  isGif: boolean;
  links: any[];
}

interface WahaGroup {
  groupMetadata?: {
    id?: {
      server: string;
      user: string;
      _serialized: string;
    };
    creation?: number;
    owner?: {
      server: string;
      user: string;
      _serialized: string;
    };
    subject?: string;
    subjectTime?: number;
    descTime?: number;
    restrict?: boolean;
    announce?: boolean;
    noFrequentlyForwarded?: boolean;
    ephemeralDuration?: number;
    disappearingModeTrigger?: string;
    membershipApprovalMode?: boolean;
    memberAddMode?: string;
    reportToAdminMode?: boolean;
    size?: number;
    support?: boolean;
    suspended?: boolean;
    terminated?: boolean;
    uniqueShortNameMap?: Record<string, any>;
    isLidAddressingMode?: boolean;
    isParentGroup?: boolean;
    isParentGroupClosed?: boolean;
    defaultSubgroup?: boolean;
    generalSubgroup?: boolean;
    groupSafetyCheck?: boolean;
    generalChatAutoAddDisabled?: boolean;
    allowNonAdminSubGroupCreation?: boolean;
    lastActivityTimestamp?: number;
    lastSeenActivityTimestamp?: number;
    incognito?: boolean;
    hasCapi?: boolean;
    participants?: Array<{
      id?: {
        server: string;
        user: string;
        _serialized: string;
      };
      isAdmin?: boolean;
      isSuperAdmin?: boolean;
    }>;
    pendingParticipants?: any[];
    pastParticipants?: any[];
    membershipApprovalRequests?: any[];
    subgroupSuggestions?: any[];
  };
  id: string;
  name?: string;
  isGroup?: boolean;
  isReadOnly?: boolean;
  unreadCount?: number;
  timestamp?: number;
  archived?: boolean;
  pinned?: boolean;
  isMuted?: boolean;
  muteExpiration?: number;
  lastMessage?: any;
}

export interface WhatsAppGroup {
  id: string;
  name?: string;
  isGroup?: boolean;
  unreadCount?: number;
  timestamp?: number;
  archived?: boolean;
  pinned?: boolean;
}

export interface SendMessageRequest {
  chatId: string;
  text: string;
  replyTo?: string;
  mentions?: string[];
}

export interface SendImageRequest {
  chatId: string;
  imageUrl: string;
  caption?: string;
  filename?: string;
}

export interface WhatsAppServiceConfig {
  apiUrl: string;
  apiKey: string;
  sessionName: string;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Enhanced WAHA client with error handling and retry logic
 * Integrates with existing WAHA implementation from mvp-deprecated
 */
export class WahaClient {
  private config: WhatsAppServiceConfig;
  private chatService: WahaChatService;
  private groupService: WahaGroupService;

  constructor(config?: Partial<WhatsAppServiceConfig>) {
    this.config = {
      apiUrl: process.env.WAHA_API || "http://localhost:8000",
      apiKey: "admin",
      sessionName: process.env.SESSION_NAME || "default",
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    // Initialize WAHA services
    this.chatService = new WahaChatService();
    this.groupService = new WahaGroupService();
  }

  /**
   * Ensure WhatsApp session is ready before operations
   */
  async ensureSessionReady(): Promise<boolean> {
    try {
      return await retry(
        () => this.chatService.ensureSessionReady(),
        this.config.maxRetries,
        this.config.retryDelay
      );
    } catch (error) {
      console.error("Failed to ensure WhatsApp session ready:", error);
      return false;
    }
  }

  /**
   * Send text message to individual chat or group
   */
  async sendText(
    request: SendMessageRequest
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      await this.ensureSessionReady();

      const result = (await retry(
        () =>
          this.chatService.sendText({
            chatId: request.chatId,
            text: request.text,
            reply_to: request.replyTo,
            mentions: request.mentions,
          }),
        this.config.maxRetries,
        this.config.retryDelay
      )) as WahaResponse<WahaMessageResponse>;

      if (result.success && result.data) {
        return {
          success: true,
          messageId: result.data.id._serialized,
        };
      } else {
        return {
          success: false,
          error: result.error || "Failed to send message",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send image with caption to chat or group
   */
  async sendImage(
    request: SendImageRequest
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      await this.ensureSessionReady();

      const result = (await retry(
        () =>
          this.chatService.sendImageWithCaption(
            request.chatId,
            {
              url: request.imageUrl,
              mimetype: "image/jpeg",
              filename: request.filename || "image.jpg",
            },
            request.caption
          ),
        this.config.maxRetries,
        this.config.retryDelay
      )) as WahaResponse<WahaMessageResponse>;

      if (result.success && result.data) {
        return {
          success: true,
          messageId: result.data.id._serialized,
        };
      } else {
        return {
          success: false,
          error: result.error || "Failed to send image",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get all available WhatsApp groups
   */
  async getGroups(): Promise<{
    success: boolean;
    groups?: WhatsAppGroup[];
    error?: string;
  }> {
    try {
      await this.ensureSessionReady();

      const result = (await retry(
        () => this.groupService.getGroups(),
        this.config.maxRetries,
        this.config.retryDelay
      )) as WahaResponse<WahaGroup[]>;

      if (result.success && result.data) {
        return {
          success: true,
          groups: result.data,
        };
      } else {
        return {
          success: false,
          error: result.error || "Failed to get groups",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Reply to a specific message
   */
  async replyToMessage(
    chatId: string,
    messageId: string,
    text: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.ensureSessionReady();

      const result = (await retry(
        () => this.chatService.replyToMessage(chatId, messageId, text),
        this.config.maxRetries,
        this.config.retryDelay
      )) as WahaResponse<WahaMessageResponse>;

      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if session is connected and ready
   */
  async checkConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      const result = await this.chatService.ensureSessionReady();
      return { connected: result };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send a drop message to multiple groups
   */
  async sendDropToGroups(
    groups: string[],
    dropContent: {
      title: string;
      products: Array<{
        name: string;
        price: number;
        imageUrl?: string;
        description?: string;
      }>;
    }
  ): Promise<{
    success: boolean;
    results: Array<{
      groupId: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  }> {
    const results = [];

    for (const groupId of groups) {
      try {
        // Format message with product information
        let message = `🆕 *${dropContent.title}*\n\n`;

        dropContent.products.forEach((product, index) => {
          message += `${index + 1}. *${product.name}*\n`;
          message += `💰 ${product.price.toLocaleString()} FCFA\n`;
          if (product.description) {
            message += `📝 ${product.description}\n`;
          }
          message += "\n";
        });

        message += "📱 Contact us to order!";

        const result = await this.sendText({
          chatId: groupId,
          text: message,
        });

        results.push({
          groupId,
          success: result.success,
          messageId: result.messageId,
          error: result.error,
        });

        // Small delay between messages to avoid rate limiting
        if (groups.length > 1) {
          await sleep(500);
        }
      } catch (error) {
        results.push({
          groupId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const allSuccessful = results.every((r) => r.success);

    return {
      success: allSuccessful,
      results,
    };
  }
}

// Export singleton instance
export const wahaClient = new WahaClient();
