import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const AuthController: {
    /**
     * POST /api/auth/register
     * Register a new user
     */
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/auth/login
     * Login user
     */
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/auth/profile
     * Get current user profile
     */
    getProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /api/auth/profile
     * Update user profile (nama, noHp)
     */
    updateProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=AuthController.d.ts.map