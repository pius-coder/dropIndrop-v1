interface WahaSessionStatus {
  name: string;
  status: string;
  config: any;
  me: {
    id: string;
    pushName: string;
  };
  engine: {
    engine: string;
    WWebVersion: string;
    state: string;
  };
}

interface WahaResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class WahaSessionService {
  private readonly sessionName: string;
  private readonly wahaApiUrl: string;

  constructor() {
    this.sessionName = process.env.SESSION_NAME || "default";
    this.wahaApiUrl = process.env.WAHA_API || "http://localhost:8000";
  }

  /**
   * Check if the WhatsApp session is running
   */
  async checkSessionRunning(): Promise<WahaResponse<WahaSessionStatus>> {
    try {
      const response = await fetch(
        `${this.wahaApiUrl}/api/sessions/${this.sessionName}`,
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

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Start a WhatsApp session
   */
  async startSession(): Promise<WahaResponse<any>> {
    try {
      const response = await fetch(
        `${this.wahaApiUrl}/api/sessions/${this.sessionName}/start`,
        {
          method: "POST",
          headers: {
            "X-Api-Key": "admin",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session: this.sessionName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Stop a WhatsApp session
   */
  async stopSession(): Promise<WahaResponse<any>> {
    try {
      const response = await fetch(
        `${this.wahaApiUrl}/api/sessions/${this.sessionName}/stop`,
        {
          method: "POST",
          headers: {
            "X-Api-Key": "admin",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session: this.sessionName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
