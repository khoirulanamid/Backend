"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const schemas_1 = require("../utils/schemas");
const zod_1 = require("zod");
exports.AuthController = {
    /**
     * POST /api/auth/sync
     * Sync user from Firebase. Create if new, return existing if already exists.
     */
    async syncUser(req, res) {
        try {
            const { uid, email } = req.user;
            const body = schemas_1.syncUserSchema.parse(req.body);
            let user = await prisma_1.default.user.findUnique({
                where: { id: uid },
                include: { penghuniData: true },
            });
            if (!user) {
                // Create new user
                user = await prisma_1.default.user.create({
                    data: {
                        id: uid,
                        email: body.email || email,
                        nama: body.nama,
                        noHp: body.noHp,
                        role: 'PENGHUNI', // Default role
                    },
                    include: { penghuniData: true },
                });
                // Create Penghuni record
                await prisma_1.default.penghuni.create({
                    data: {
                        userId: uid,
                    },
                });
            }
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    nama: user.nama,
                    noHp: user.noHp,
                    role: user.role,
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error: 'Validasi gagal', details: error.errors });
            }
            console.error('Sync user error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * GET /api/profile
     * Get current user profile
     */
    async getProfile(req, res) {
        try {
            const { uid } = req.user;
            const user = await prisma_1.default.user.findUnique({
                where: { id: uid },
                include: {
                    penghuniData: {
                        include: {
                            kamar: true,
                        },
                    },
                },
            });
            if (!user) {
                return res.status(404).json({ error: 'User tidak ditemukan' });
            }
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    nama: user.nama,
                    noHp: user.noHp,
                    role: user.role,
                    createdAt: user.createdAt,
                    penghuni: user.penghuniData
                        ? {
                            id: user.penghuniData.id,
                            kamar: user.penghuniData.kamar,
                            tanggalMasuk: user.penghuniData.tanggalMasuk,
                        }
                        : null,
                },
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * PUT /api/profile
     * Update user profile (nama, noHp)
     */
    async updateProfile(req, res) {
        try {
            const { uid } = req.user;
            const body = schemas_1.updateProfileSchema.parse(req.body);
            const user = await prisma_1.default.user.update({
                where: { id: uid },
                data: {
                    ...(body.nama && { nama: body.nama }),
                    ...(body.noHp && { noHp: body.noHp }),
                },
            });
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    nama: user.nama,
                    noHp: user.noHp,
                    role: user.role,
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error: 'Validasi gagal', details: error.errors });
            }
            console.error('Update profile error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=AuthController.js.map