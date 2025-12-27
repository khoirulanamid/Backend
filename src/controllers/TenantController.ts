import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/prisma';
import { createLaporanSchema } from '../utils/schemas';
import { ZodError } from 'zod';

export const TenantController = {
    // ===================== TAGIHAN =====================

    /**
     * GET /api/penghuni/tagihan/active
     * Get active bill for current month
     */
    async getActiveTagihan(req: AuthenticatedRequest, res: Response) {
        try {
            const { uid } = req.user!;

            const penghuni = await prisma.penghuni.findUnique({
                where: { userId: uid },
            });

            if (!penghuni) {
                return res.status(404).json({ error: 'Data penghuni tidak ditemukan' });
            }

            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);

            const tagihan = await prisma.tagihan.findFirst({
                where: {
                    penghuniId: penghuni.id,
                    periode: {
                        gte: currentMonth,
                    },
                },
                include: {
                    pembayaran: true,
                },
            });

            return res.json({
                success: true,
                tagihan: tagihan
                    ? {
                        id: tagihan.id,
                        periode: tagihan.periode,
                        jumlah: tagihan.jumlah,
                        status: tagihan.status,
                        bukti: tagihan.pembayaran?.buktiFoto,
                        tanggalBayar: tagihan.pembayaran?.tanggalBayar,
                    }
                    : null,
            });
        } catch (error) {
            console.error('Get active tagihan error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * GET /api/penghuni/tagihan/history
     * Get payment history
     */
    async getTagihanHistory(req: AuthenticatedRequest, res: Response) {
        try {
            const { uid } = req.user!;

            const penghuni = await prisma.penghuni.findUnique({
                where: { userId: uid },
            });

            if (!penghuni) {
                return res.status(404).json({ error: 'Data penghuni tidak ditemukan' });
            }

            const tagihan = await prisma.tagihan.findMany({
                where: {
                    penghuniId: penghuni.id,
                    status: 'LUNAS',
                },
                include: {
                    pembayaran: true,
                },
                orderBy: { periode: 'desc' },
            });

            return res.json({
                success: true,
                history: tagihan.map((t) => ({
                    id: t.id,
                    periode: t.periode,
                    jumlah: t.jumlah,
                    status: t.status,
                    tanggalBayar: t.pembayaran?.tanggalBayar,
                })),
            });
        } catch (error) {
            console.error('Get tagihan history error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * POST /api/penghuni/tagihan/:id/bayar
     * Upload payment proof
     */
    async uploadPaymentProof(req: AuthenticatedRequest, res: Response) {
        try {
            const { uid } = req.user!;
            const { id } = req.params;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'File bukti pembayaran wajib diupload' });
            }

            const penghuni = await prisma.penghuni.findUnique({
                where: { userId: uid },
            });

            if (!penghuni) {
                return res.status(404).json({ error: 'Data penghuni tidak ditemukan' });
            }

            const tagihan = await prisma.tagihan.findFirst({
                where: {
                    id: parseInt(id),
                    penghuniId: penghuni.id,
                },
            });

            if (!tagihan) {
                return res.status(404).json({ error: 'Tagihan tidak ditemukan' });
            }

            if (tagihan.status !== 'BELUM_BAYAR') {
                return res.status(400).json({ error: 'Tagihan sudah dalam proses atau lunas' });
            }

            // Create payment record
            const buktiFotoUrl = `/uploads/${file.filename}`;

            await prisma.pembayaran.create({
                data: {
                    tagihanId: tagihan.id,
                    buktiFoto: buktiFotoUrl,
                },
            });

            // Update tagihan status
            await prisma.tagihan.update({
                where: { id: tagihan.id },
                data: { status: 'MENUNGGU_VERIFIKASI' },
            });

            return res.json({
                success: true,
                message: 'Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.',
            });
        } catch (error) {
            console.error('Upload payment proof error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // ===================== LAPORAN =====================

    /**
     * GET /api/penghuni/laporan
     * Get my reports
     */
    async getMyLaporan(req: AuthenticatedRequest, res: Response) {
        try {
            const { uid } = req.user!;

            const penghuni = await prisma.penghuni.findUnique({
                where: { userId: uid },
            });

            if (!penghuni) {
                return res.status(404).json({ error: 'Data penghuni tidak ditemukan' });
            }

            const laporan = await prisma.laporan.findMany({
                where: { penghuniId: penghuni.id },
                orderBy: { createdAt: 'desc' },
            });

            return res.json({
                success: true,
                laporan: laporan.map((l) => ({
                    id: l.id,
                    judul: l.judul,
                    deskripsi: l.deskripsi,
                    foto: l.foto,
                    status: l.status,
                    createdAt: l.createdAt,
                    updatedAt: l.updatedAt,
                })),
            });
        } catch (error) {
            console.error('Get my laporan error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * POST /api/penghuni/laporan
     * Create new report
     */
    async createLaporan(req: AuthenticatedRequest, res: Response) {
        try {
            const { uid } = req.user!;
            const body = createLaporanSchema.parse(req.body);
            const file = req.file;

            const penghuni = await prisma.penghuni.findUnique({
                where: { userId: uid },
            });

            if (!penghuni) {
                return res.status(404).json({ error: 'Data penghuni tidak ditemukan' });
            }

            const fotoUrl = file ? `/uploads/${file.filename}` : null;

            const laporan = await prisma.laporan.create({
                data: {
                    penghuniId: penghuni.id,
                    judul: body.judul,
                    deskripsi: body.deskripsi,
                    foto: fotoUrl,
                },
            });

            return res.status(201).json({
                success: true,
                laporan: {
                    id: laporan.id,
                    judul: laporan.judul,
                    deskripsi: laporan.deskripsi,
                    foto: laporan.foto,
                    status: laporan.status,
                    createdAt: laporan.createdAt,
                },
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: 'Validasi gagal', details: error.errors });
            }
            console.error('Create laporan error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};
