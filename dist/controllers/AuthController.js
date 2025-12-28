"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const JWT_SECRET = process.env.JWT_SECRET || 'atlas-kos-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
// Validation schemas
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email tidak valid'),
    password: zod_1.z.string().min(6, 'Password minimal 6 karakter'),
    nama: zod_1.z.string().min(2, 'Nama minimal 2 karakter'),
    noHp: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email tidak valid'),
    password: zod_1.z.string().min(1, 'Password harus diisi'),
});
const updateProfileSchema = zod_1.z.object({
    nama: zod_1.z.string().optional(),
    noHp: zod_1.z.string().optional(),
});
exports.AuthController = {
    /**
     * POST /api/auth/register
     * Register a new user
     */
    async register(req, res) {
        try {
            const body = registerSchema.parse(req.body);
            // Check if email already exists
            const existingUser = await prisma_1.default.user.findUnique({
                where: { email: body.email },
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Email sudah terdaftar'
                });
            }
            // Hash password
            const hashedPassword = await bcrypt_1.default.hash(body.password, 10);
            // Create user
            const user = await prisma_1.default.user.create({
                data: {
                    email: body.email,
                    password: hashedPassword,
                    nama: body.nama,
                    noHp: body.noHp,
                    role: 'PENGHUNI',
                },
            });
            // Create Penghuni record
            await prisma_1.default.penghuni.create({
                data: {
                    userId: user.id,
                },
            });
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ uid: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    async login(req, res) {
        try {
            const body = loginSchema.parse(req.body);
            // Find user by email
            const user = await prisma_1.default.user.findUnique({
                where: { email: body.email },
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Email atau password salah'
                });
            }
            // Verify password
            const isPasswordValid = await bcrypt_1.default.compare(body.password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Email atau password salah'
                });
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ uid: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
        }
        catch (error) {
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
    async updateProfile(req, res) {
        try {
            const { uid } = req.user;
            const body = updateProfileSchema.parse(req.body);
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
            if (error instanceof zod_1.z.ZodError) {
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
//# sourceMappingURL=AuthController.js.map