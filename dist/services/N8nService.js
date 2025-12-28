"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nService = void 0;
const axios_1 = __importDefault(require("axios"));
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';
exports.N8nService = {
    /**
     * Send payment notification via n8n webhook
     */
    async notifyPaymentStatus(noHp, status, message) {
        try {
            if (!N8N_WEBHOOK_URL) {
                console.warn('N8N_WEBHOOK_URL not configured');
                return false;
            }
            await axios_1.default.post(N8N_WEBHOOK_URL, {
                noHp,
                status,
                message,
                timestamp: new Date().toISOString(),
            });
            console.log(`Payment notification sent to ${noHp}`);
            return true;
        }
        catch (error) {
            console.error('Failed to send n8n notification:', error);
            return false;
        }
    },
};
//# sourceMappingURL=N8nService.js.map