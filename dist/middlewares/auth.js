"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePenghuni = exports.requireAdmin = exports.verifyToken = void 0;
const firebase_1 = require("../config/firebase");
const prisma_1 = __importDefault(require("../config/prisma"));
// Verify Firebase Token or API Key (for n8n automation)
const verifyToken = async (req, res, next) => {
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
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        // Get user from database
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Token tidak valid' });
    }
};
exports.verifyToken = verifyToken;
// Require Admin Role
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Akses ditolak. Hanya Admin yang diizinkan.' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
// Require Penghuni Role
const requirePenghuni = (req, res, next) => {
    if (!req.user || req.user.role !== 'PENGHUNI') {
        res.status(403).json({ error: 'Akses ditolak. Hanya Penghuni yang diizinkan.' });
        return;
    }
    next();
};
exports.requirePenghuni = requirePenghuni;
//# sourceMappingURL=auth.js.map