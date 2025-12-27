import axios from 'axios';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';

export const N8nService = {
    /**
     * Send payment notification via n8n webhook
     */
    async notifyPaymentStatus(
        noHp: string,
        status: 'LUNAS' | 'DITOLAK',
        message: string
    ): Promise<boolean> {
        try {
            if (!N8N_WEBHOOK_URL) {
                console.warn('N8N_WEBHOOK_URL not configured');
                return false;
            }

            await axios.post(N8N_WEBHOOK_URL, {
                noHp,
                status,
                message,
                timestamp: new Date().toISOString(),
            });

            console.log(`Payment notification sent to ${noHp}`);
            return true;
        } catch (error) {
            console.error('Failed to send n8n notification:', error);
            return false;
        }
    },
};
