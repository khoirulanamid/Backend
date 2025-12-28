import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const AuthController: {
    /**
     * POST /api/auth/sync
     * Sync user from Firebase. Create if new, return existing if already exists.
     */
    syncUser(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/profile
     * Get current user profile
     */
    getProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /api/profile
     * Update user profile (nama, noHp)
     */
    updateProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=AuthController.d.ts.map