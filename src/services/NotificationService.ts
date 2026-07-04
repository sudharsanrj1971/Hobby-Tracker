/**
 * NotificationService
 * 
 * A robust, modular notification service that wraps both Twilio SMS / WhatsApp integrations
 * and high-fidelity Mock fallback handlers for local development.
 * 
 * Architecture is completely production-ready:
 * 1. Read environment variables from process.env (or .env.example placeholder guidelines)
 * 2. Validate configuration credentials (check for missing or default values)
 * 3. Fall back gracefully to a highly-visible mock simulation in console if credentials aren't set
 * 4. Return detailed delivery transaction receipts containing delivery status, channel, and simulated indicators
 */

export interface NotificationPayload {
  to: string;
  body: string;
  userName?: string;
  hobbyName?: string;
  streak?: number;
}

export interface DeliveryReceipt {
  success: boolean;
  simulated: boolean;
  channel: 'SMS' | 'WhatsApp' | 'Push';
  to: string;
  body: string;
  messageSid?: string;
  timestamp: string;
  error?: string;
}

export class NotificationService {
  private accountSid: string | undefined;
  private authToken: string | undefined;
  private fromNumber: string;
  private whatsappFrom: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '+15555555555';
    this.whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  }

  /**
   * Helper to determine if actual Twilio credentials are properly configured.
   * Prevents crash or network failures during development if secrets are not active.
   */
  public isTwilioConfigured(): boolean {
    if (!this.accountSid || !this.authToken) {
      return false;
    }
    // Check if the developer used placeholder strings
    const placeholders = ['MY_TWILIO_SID', 'MY_TWILIO_TOKEN', 'YOUR_TWILIO_SID', 'YOUR_TWILIO_TOKEN', ''];
    if (placeholders.includes(this.accountSid.trim()) || placeholders.includes(this.authToken.trim())) {
      return false;
    }
    return true;
  }

  /**
   * Dispatches a standard SMS notification.
   * Falls back to a mock handler automatically if Twilio credentials are not set.
   */
  public async sendSMS(payload: NotificationPayload): Promise<DeliveryReceipt> {
    const { to, body } = payload;
    const timestamp = new Date().toISOString();

    if (!this.isTwilioConfigured()) {
      return this.simulateSMS(to, body, timestamp);
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: to,
          From: this.fromNumber,
          Body: body
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to dispatch via Twilio API');
      }

      console.log(`[NotificationService] SMS successfully dispatched via Twilio to ${to}. Message SID: ${data.sid}`);
      return {
        success: true,
        simulated: false,
        channel: 'SMS',
        to,
        body,
        messageSid: data.sid,
        timestamp
      };
    } catch (error: any) {
      console.error(`[NotificationService] Twilio SMS API Error sending to ${to}:`, error);
      return {
        success: false,
        simulated: false,
        channel: 'SMS',
        to,
        body,
        timestamp,
        error: error.message || 'Twilio delivery failed'
      };
    }
  }

  /**
   * Dispatches a WhatsApp notification.
   * Falls back to a mock handler automatically if Twilio credentials are not set.
   */
  public async sendWhatsApp(payload: NotificationPayload): Promise<DeliveryReceipt> {
    const { to, body, userName, hobbyName, streak } = payload;
    const timestamp = new Date().toISOString();

    // Standardize WhatsApp template style message body if none is supplied
    const whatsappBody = body || `🔥 Hobby Sync Reminder\n\nHi ${userName || 'Hobbyist'}!\n\nIt's time for your ${hobbyName || 'hobby'} session. Keep your ${streak || 0}-day streak alive! 🚀`;

    if (!this.isTwilioConfigured()) {
      return this.simulateWhatsApp(to, whatsappBody, timestamp);
    }

    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = this.whatsappFrom.startsWith('whatsapp:') ? this.whatsappFrom : `whatsapp:${this.whatsappFrom}`;

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: formattedFrom,
          Body: whatsappBody
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to dispatch WhatsApp via Twilio API');
      }

      console.log(`[NotificationService] WhatsApp successfully dispatched via Twilio to ${to}. Message SID: ${data.sid}`);
      return {
        success: true,
        simulated: false,
        channel: 'WhatsApp',
        to,
        body: whatsappBody,
        messageSid: data.sid,
        timestamp
      };
    } catch (error: any) {
      console.error(`[NotificationService] Twilio WhatsApp API Error sending to ${to}:`, error);
      return {
        success: false,
        simulated: false,
        channel: 'WhatsApp',
        to,
        body: whatsappBody,
        timestamp,
        error: error.message || 'Twilio WhatsApp delivery failed'
      };
    }
  }

  /**
   * High-fidelity mockup simulator for SMS dispatch.
   */
  private simulateSMS(to: string, body: string, timestamp: string): DeliveryReceipt {
    console.log(`
┌────────────────────────────────────────────────────────┐
│  📱 [DEVELOPMENT MOCK] SMS DISPATCHED                  │
├────────────────────────────────────────────────────────┤
│  Recipient Phone: ${to.padEnd(37)} │
│  Sender Outbox:    ${this.fromNumber.padEnd(37)} │
│  Delivery Time:    ${timestamp.padEnd(37)} │
├────────────────────────────────────────────────────────┤
│  Message Content:                                      │
│  ${body.replace(/\n/g, '\n│  ')}
└────────────────────────────────────────────────────────┘
`);
    return {
      success: true,
      simulated: true,
      channel: 'SMS',
      to,
      body,
      messageSid: `SM-mock-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      timestamp
    };
  }

  /**
   * High-fidelity mockup simulator for WhatsApp dispatch.
   */
  private simulateWhatsApp(to: string, body: string, timestamp: string): DeliveryReceipt {
    console.log(`
┌────────────────────────────────────────────────────────┐
│  🟢 [DEVELOPMENT MOCK] WHATSAPP DISPATCHED             │
├────────────────────────────────────────────────────────┤
│  Recipient WA:    ${to.padEnd(37)} │
│  Sender Outbox:   ${this.whatsappFrom.padEnd(37)} │
│  Delivery Time:   ${timestamp.padEnd(37)} │
├────────────────────────────────────────────────────────┤
│  Message Content:                                      │
│  ${body.replace(/\n/g, '\n│  ')}
└────────────────────────────────────────────────────────┘
`);
    return {
      success: true,
      simulated: true,
      channel: 'WhatsApp',
      to,
      body,
      messageSid: `WA-mock-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      timestamp
    };
  }
}

// Export single instance of service for app-wide use
export const notificationService = new NotificationService();
