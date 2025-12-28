import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const AdminController: {
    /**
     * GET /api/admin/stats
     * Get dashboard statistics
     */
    getStats(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/admin/settings
     * Get system configuration
     */
    getSettings(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /api/admin/settings
     * Update system configuration
     */
    updateSettings(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/kamar
     * List all rooms
     */
    listKamar(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/kamar
     * Create new room
     */
    createKamar(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /api/kamar/:id
     * Update room
     */
    updateKamar(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/admin/penghuni
     * List all tenants
     */
    listPenghuni(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/admin/penghuni
     * Register new tenant manually
     */
    createPenghuni(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/admin/pembayaran/pending
     * List pending payments
     */
    listPendingPayments(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/admin/pembayaran/:id/confirm
     * Confirm or reject payment
     */
    confirmPayment(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/admin/laporan
     * List all maintenance reports
     */
    listLaporan(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /api/admin/laporan/:id/status
     * Update report status
     */
    updateLaporanStatus(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=AdminController.d.ts.map