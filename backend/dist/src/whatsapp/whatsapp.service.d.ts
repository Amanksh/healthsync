import { ConfigService } from '@nestjs/config';
export declare class WhatsAppService {
    private configService;
    private readonly logger;
    private client;
    private fromNumber;
    constructor(configService: ConfigService);
    sendMessage(to: string, body: string, mediaUrl?: string): Promise<{
        sid: string;
        status: string;
    }>;
    private formatWhatsAppNumber;
    private cleanWhatsAppAddress;
}
