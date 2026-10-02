import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import * as dotenv from 'dotenv';
import * as path from 'path';

@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);
    private client: Twilio | null = null;
    private fromNumber: string;

    constructor(private configService: ConfigService) {
        // Force reload .env to ensure updated values take effect even in watch mode
        dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

        const sid = process.env.TWILIO_ACCOUNT_SID || this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const token = process.env.TWILIO_AUTH_TOKEN || this.configService.get<string>('TWILIO_AUTH_TOKEN');
        const rawFrom = process.env.TWILIO_WHATSAPP_FROM || this.configService.get<string>(
            'TWILIO_WHATSAPP_FROM',
            'whatsapp:+14155238886',
        );
        this.fromNumber = this.cleanWhatsAppAddress(rawFrom || 'whatsapp:+14155238886');

        if (sid && token) {
            this.client = new Twilio(sid, token);
            this.logger.log(`Twilio WhatsApp client initialized with From: ${this.fromNumber}`);
        } else {
            this.logger.warn(
                'Twilio credentials not configured — WhatsApp messaging disabled',
            );
        }
    }

    /**
     * Send a WhatsApp message to the given phone number.
     *
     * @param to   Patient phone in E.164 format (e.g. +919876543210)
     * @param body The text message to send
     * @param mediaUrl Optional publicly-accessible URL of the report file to attach
     */
    async sendMessage(
        to: string,
        body: string,
        mediaUrl?: string,
    ): Promise<{ sid: string; status: string }> {
        if (!this.client) {
            this.logger.warn(`[DRY RUN] Would send WhatsApp to ${to}: ${body}`);
            return { sid: 'dry-run', status: 'skipped' };
        }

        const toNumber = this.formatWhatsAppNumber(to);

        const payload: {
            from: string;
            to: string;
            body: string;
            mediaUrl?: string[];
        } = {
            from: this.fromNumber,
            to: toNumber,
            body,
        };

        // Attach the report file (PDF, image, etc.) as media
        if (mediaUrl) {
            payload.mediaUrl = [mediaUrl];
        }

        const result = await this.client.messages.create(payload);
        this.logger.log(
            `WhatsApp message sent to ${to} — SID: ${result.sid}, Status: ${result.status}`,
        );

        return { sid: result.sid, status: result.status };
    }

    /**
     * Normalize a phone number into WhatsApp-compatible format.
     * Ensures E.164 with `whatsapp:` prefix.
     */
    private formatWhatsAppNumber(phone: string): string {
        // Strip the whatsapp: prefix if already present
        let cleaned = phone.replace(/^whatsapp:/i, '').trim();

        // Remove spaces, dashes, parentheses
        cleaned = cleaned.replace(/[\s\-\(\)]/g, '');

        // Fix duplicate plus signs if any (e.g. ++)
        cleaned = cleaned.replace(/^\++/, '+');

        // If it looks like a 10-digit Indian number, add +91
        if (/^\d{10}$/.test(cleaned)) {
            cleaned = '+91' + cleaned;
        }

        // Ensure leading +
        if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }

        return `whatsapp:${cleaned}`;
    }

    /**
     * Clean and ensure `whatsapp:` prefix on sender address.
     */
    private cleanWhatsAppAddress(addr: string): string {
        let cleaned = addr.replace(/^whatsapp:/i, '').trim();
        cleaned = cleaned.replace(/[\s\-\(\)]/g, '');
        cleaned = cleaned.replace(/^\++/, '+');
        if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        return `whatsapp:${cleaned}`;
    }
}
