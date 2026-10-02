"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = require("twilio");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    configService;
    logger = new common_1.Logger(WhatsAppService_1.name);
    client = null;
    fromNumber;
    constructor(configService) {
        this.configService = configService;
        dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
        const sid = process.env.TWILIO_ACCOUNT_SID || this.configService.get('TWILIO_ACCOUNT_SID');
        const token = process.env.TWILIO_AUTH_TOKEN || this.configService.get('TWILIO_AUTH_TOKEN');
        const rawFrom = process.env.TWILIO_WHATSAPP_FROM || this.configService.get('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886');
        this.fromNumber = this.cleanWhatsAppAddress(rawFrom || 'whatsapp:+14155238886');
        if (sid && token) {
            this.client = new twilio_1.Twilio(sid, token);
            this.logger.log(`Twilio WhatsApp client initialized with From: ${this.fromNumber}`);
        }
        else {
            this.logger.warn('Twilio credentials not configured — WhatsApp messaging disabled');
        }
    }
    async sendMessage(to, body, mediaUrl) {
        if (!this.client) {
            this.logger.warn(`[DRY RUN] Would send WhatsApp to ${to}: ${body}`);
            return { sid: 'dry-run', status: 'skipped' };
        }
        const toNumber = this.formatWhatsAppNumber(to);
        const payload = {
            from: this.fromNumber,
            to: toNumber,
            body,
        };
        if (mediaUrl) {
            payload.mediaUrl = [mediaUrl];
        }
        const result = await this.client.messages.create(payload);
        this.logger.log(`WhatsApp message sent to ${to} — SID: ${result.sid}, Status: ${result.status}`);
        return { sid: result.sid, status: result.status };
    }
    formatWhatsAppNumber(phone) {
        let cleaned = phone.replace(/^whatsapp:/i, '').trim();
        cleaned = cleaned.replace(/[\s\-\(\)]/g, '');
        cleaned = cleaned.replace(/^\++/, '+');
        if (/^\d{10}$/.test(cleaned)) {
            cleaned = '+91' + cleaned;
        }
        if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        return `whatsapp:${cleaned}`;
    }
    cleanWhatsAppAddress(addr) {
        let cleaned = addr.replace(/^whatsapp:/i, '').trim();
        cleaned = cleaned.replace(/[\s\-\(\)]/g, '');
        cleaned = cleaned.replace(/^\++/, '+');
        if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        return `whatsapp:${cleaned}`;
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = WhatsAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map