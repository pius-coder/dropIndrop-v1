import { WahaSessionService } from "./session";

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

interface SendTextRequest {
  chatId: string;
  text: string;
  reply_to?: string;
  mentions?: string[];
  linkPreview?: boolean;
  linkPreviewHighQuality?: boolean;
}

interface SendImageRequest {
  chatId: string;
  file: {
    mimetype: string;
    url?: string;
    data?: string;
    filename?: string;
  };
  caption?: string;
  reply_to?: string;
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

/**
 * WAHA Group Messaging Service
 * Handles all messaging operations for WhatsApp groups
 */
export class WahaGroupService {
  private readonly sessionName: string;
  private readonly wahaApiUrl: string;
  private readonly sessionService: WahaSessionService;

  constructor() {
    this.sessionName = process.env.SESSION_NAME || "default";
    this.wahaApiUrl = process.env.WAHA_API || "http://localhost:8000";
    this.sessionService = new WahaSessionService();
  }

  /**
   * Send a text message to a group
   */
  async sendText(
    request: SendTextRequest
  ): Promise<WahaResponse<WahaMessageResponse>> {
    try {
      const payload = {
        session: this.sessionName,
        chatId: request.chatId,
        text: request.text,
        reply_to: request.reply_to,
        mentions: request.mentions,
        linkPreview: request.linkPreview ?? true,
        linkPreviewHighQuality: request.linkPreviewHighQuality ?? false,
      };

      const response = await fetch(`${this.wahaApiUrl}/api/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": "admin",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WahaMessageResponse = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Reply to a message in a group
   */
  async replyToMessage(
    groupId: string,
    replyToMessageId: string,
    text: string
  ): Promise<WahaResponse<WahaMessageResponse>> {
    return this.sendText({
      chatId: groupId,
      text,
      reply_to: replyToMessageId,
    });
  }

  /**
   * Send an image with optional caption to a group
   */
  async sendImage(
    request: SendImageRequest
  ): Promise<WahaResponse<WahaMessageResponse>> {
    try {
      const payload = {
        session: this.sessionName,
        chatId: request.chatId,
        file: request.file,
        caption: request.caption,
        reply_to: request.reply_to,
      };

      const response = await fetch(`${this.wahaApiUrl}/api/sendImage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": "admin",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WahaMessageResponse = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send an image with caption to a group
   */
  async sendImageWithCaption(
    groupId: string,
    file: SendImageRequest["file"],
    caption?: string
  ): Promise<WahaResponse<WahaMessageResponse>> {
    return this.sendImage({
      chatId: groupId,
      file,
      caption,
    });
  }

  /**
   * Reply to a message with an image in a group
   */
  async replyWithImage(
    groupId: string,
    replyToMessageId: string,
    file: SendImageRequest["file"],
    caption?: string
  ): Promise<WahaResponse<WahaMessageResponse>> {
    return this.sendImage({
      chatId: groupId,
      file,
      caption,
      reply_to: replyToMessageId,
    });
  }

  /**
   * Get all available groups
   */
  async getGroups(): Promise<WahaResponse<WahaGroup[]>> {
    try {
      const response = await fetch(
        `${this.wahaApiUrl}/api/${this.sessionName}/groups`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": "admin",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WahaGroup[] = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Ensure the WhatsApp session is ready for messaging
   */
  async ensureSessionReady(): Promise<boolean> {
    const sessionCheck = await this.sessionService.checkSessionRunning();
    if (
      !sessionCheck.success ||
      !sessionCheck.data ||
      sessionCheck.data.engine?.state !== "CONNECTED"
    ) {
      // Try to start the session
      const startResult = await this.sessionService.startSession();
      if (!startResult.success) {
        console.error("Failed to start WhatsApp session:", startResult.error);
        return false;
      }
      // Wait a moment for session to initialize
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    return true;
  }
}

// Export convenience instance
export const wahaGroupService = new WahaGroupService();
