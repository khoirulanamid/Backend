import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const TenantController: {
    /**
     * GET /api/penghuni/tagihan/active
     * Get active bill for current month
     */
    getActiveTagihan(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/penghuni/tagihan/history
     * Get payment history
     */
    getTagihanHistory(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/penghuni/tagihan/:id/bayar
     * Upload payment proof
     */
    uploadPaymentProof(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/penghuni/laporan
     * Get my reports
     */
    getMyLaporan(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/penghuni/laporan
     * Create new report
     */
    createLaporan(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=TenantController.d.ts.map