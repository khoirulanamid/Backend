import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'atlas-kos-secret-key-change-in-production';
const N8N_API_KEY = process.env.N8N_API_KEY;

export const verifyToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token tidak ditemukan' });
        }

        const token = authHeader.split(' ')[1];

        // Check if it's the N8N API key (for automation)
        if (N8N_API_KEY && token === N8N_API_KEY) {
            req.user = {
                uid: 'n8n-automation',
                email: 'n8n@atlas-kos.my.id',
                role: 'ADMIN'
            };
            return next();
        }

        // Verify JWT token
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as {
                uid: string;
                email: string;
                role: string;
            };

            req.user = {
                uid: decoded.uid,
                email: decoded.email,
                role: decoded.role
            };

            return next();
        } catch (jwtError) {
            return res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware to check if user is admin
export const requireAdmin = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang diizinkan.' });
    }
    return next();
};

// Middleware to check if user is penghuni (tenant)
export const requirePenghuni = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.user?.role !== 'PENGHUNI' && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Akses ditolak.' });
    }
    return next();
};
