import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/prisma';
import { syncUserSchema, updateProfileSchema } from '../utils/schemas';
import { ZodError } from 'zod';

export const AuthController = {
    /**
     * POST /api/auth/sync
     * Sync user from Firebase. Create if new, return existing if already exists.
     */
    async syncUser(req: AuthenticatedRequest, res: Response) {
        try {
            const { uid, email } = req.user!;
            const body = syncUserSchema.parse(req.body);

            let user = await prisma.user.findUnique({
                where: { id: uid },
                include: { penghuniData: true },
            });

            if (!user) {
                // Create new user
                user = await prisma.user.create({
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
                await prisma.penghuni.create({
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
        } catch (error) {
            if (error instanceof ZodError) {
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
    async getProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const { uid } = req.user!;

            const user = await prisma.user.findUnique({
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
        } catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * PUT /api/profile
     * Update user profile (nama, noHp)
     */
    async updateProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const { uid } = req.user!;
            const body = updateProfileSchema.parse(req.body);

            const user = await prisma.user.update({
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
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: 'Validasi gagal', details: error.errors });
            }
            console.error('Update profile error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};
