/**
 * WAHA Chat Service
 * Handles WhatsApp messaging via WAHA API
 */

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

/**
 * Check if WAHA service is enabled
 */
function isWahaServiceEnabled(): boolean {
  return process.env.WAHA_SERVICE_STATUS === "ON";
}

/**
 * Mock WAHA service for development/testing
 */
async function mockSendText(request: SendTextRequest): Promise<WahaResponse<WahaMessageResponse>> {
  console.log("🔧 WAHA MOCK: Sending message to", request.chatId);
  console.log("📝 Message:", request.text);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock successful response
  return {
    success: true,
    data: {
      id: {
        fromMe: true,
        remote: request.chatId,
        id: `mock_${Date.now()}`,
        self: "mock_self",
        _serialized: `mock_${Date.now()}`,
      },
      ack: 2,
      hasMedia: false,
      body: request.text,
      type: "chat",
      timestamp: Date.now(),
      from: "mock_from",
      to: request.chatId,
      deviceType: "mock",
      isForwarded: false,
      forwardingScore: 0,
      isStatus: false,
      isStarred: false,
      fromMe: true,
      hasQuotedMsg: false,
      hasReaction: false,
      vCards: [],
      mentionedIds: [],
      groupMentions: [],
      isGif: false,
      links: [],
    },
  };
}

/**
 * WAHA Chat Messaging Service
 */
export class WahaChatService {
  private readonly sessionName: string;
  private readonly wahaApiUrl: string;

  constructor() {
    this.sessionName = process.env.SESSION_NAME || "default";
    this.wahaApiUrl = process.env.WAHA_API || "http://localhost:8000";
  }

  /**
   * Send a text message to an individual chat
   */
  async sendText(
    request: SendTextRequest
  ): Promise<WahaResponse<WahaMessageResponse>> {
    try {
      // If WAHA service is disabled, use mock
      if (!isWahaServiceEnabled()) {
        return await mockSendText(request);
      }

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
          "X-Api-Key": process.env.WAHA_API_KEY || "admin",
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
      console.error("WAHA sendText error:", error);

      // If WAHA fails, fall back to mock for development
      if (process.env.NODE_ENV === "development") {
        console.log("🔄 Falling back to mock WAHA service");
        return await mockSendText(request);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Reply to a message in an individual chat
   */
  async replyToMessage(
    chatId: string,
    replyToMessageId: string,
    text: string
  ): Promise<WahaResponse<WahaMessageResponse>> {
    return this.sendText({
      chatId,
      text,
      reply_to: replyToMessageId,
    });
  }
}

// Export convenience instance
export const wahaChatService = new WahaChatService();
