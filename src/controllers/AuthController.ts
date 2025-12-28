import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'atlas-kos-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    nama: z.string().min(2, 'Nama minimal 2 karakter'),
    noHp: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(1, 'Password harus diisi'),
});

const updateProfileSchema = z.object({
    nama: z.string().optional(),
    noHp: z.string().optional(),
});

export const AuthController = {
    /**
     * POST /api/auth/register
     * Register a new user
     */
    async register(req: Request, res: Response) {
        try {
            const body = registerSchema.parse(req.body);

            // Check if email already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: body.email },
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Email sudah terdaftar'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(body.password, 10);

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: body.email,
                    password: hashedPassword,
                    nama: body.nama,
                    noHp: body.noHp,
                    role: 'PENGHUNI',
                },
            });

            // Create Penghuni record
            await prisma.penghuni.create({
                data: {
                    userId: user.id,
                },
            });

            // Generate JWT token
            const token = jwt.sign(
                { uid: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            return res.status(201).json({
                success: true,
                message: 'Registrasi berhasil',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    nama: user.nama,
                    noHp: user.noHp,
                    role: user.role,
                },
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validasi gagal',
                    details: error.errors
                });
            }
            console.error('Register error:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/auth/login
     * Login user
     */
    async login(req: Request, res: Response) {
        try {
            const body = loginSchema.parse(req.body);

            // Find user by email
            const user = await prisma.user.findUnique({
                where: { email: body.email },
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Email atau password salah'
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(body.password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Email atau password salah'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { uid: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            return res.json({
                success: true,
                message: 'Login berhasil',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    nama: user.nama,
                    noHp: user.noHp,
                    role: user.role,
                },
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validasi gagal',
                    details: error.errors
                });
            }
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * GET /api/auth/profile
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
                return res.status(404).json({
                    success: false,
                    error: 'User tidak ditemukan'
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
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * PUT /api/auth/profile
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
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validasi gagal',
                    details: error.errors
                });
            }
            console.error('Update profile error:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },
};
