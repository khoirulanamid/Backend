import { Response, NextFunction, RequestHandler } from 'express';
import { auth } from '../config/firebase';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../types';

// Verify Firebase Token or API Key (for n8n automation)
export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token tidak ditemukan' });
            return;
        }

        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            res.status(401).json({ error: 'Token tidak valid' });
            return;
        }

        // Check if it's an API Key (for n8n automation)
        const apiKey = process.env.N8N_API_KEY;
        if (apiKey && token === apiKey) {
            // API Key valid - treat as admin for automation
            req.user = {
                uid: 'n8n-automation',
                email: 'automation@atlas-kos.my.id',
                role: 'ADMIN',
            };
            next();
            return;
        }

        // Otherwise verify as Firebase token
        const decodedToken = await auth.verifyIdToken(token);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.uid },
        });

        if (!user) {
            res.status(401).json({ error: 'User tidak ditemukan di database' });
            return;
        }

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            role: user.role,
        };

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Token tidak valid' });
    }
};

// Require Admin Role
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Akses ditolak. Hanya Admin yang diizinkan.' });
        return;
    }
    next();
};

// Require Penghuni Role
export const requirePenghuni = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'PENGHUNI') {
        res.status(403).json({ error: 'Akses ditolak. Hanya Penghuni yang diizinkan.' });
        return;
    }
    next();
};
