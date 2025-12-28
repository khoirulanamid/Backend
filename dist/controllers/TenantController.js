"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const schemas_1 = require("../utils/schemas");
const zod_1 = require("zod");
exports.TenantController = {
    // ===================== TAGIHAN =====================
    /**
     * GET /api/penghuni/tagihan/active
     * Get active bill for current month
     */
    async getActiveTagihan(req, res) {
        try {
            const { uid } = req.user;
            const penghuni = await prisma_1.default.penghuni.findUnique({
                where: { userId: uid },
            });
            if (!penghuni) {
                return res.status(404).json({ error: 'Data penghuni tidak ditemukan' });
            }
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);
            const tagihan = await prisma_1.default.tagihan.findFirst({
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
        }
        catch (error) {
            console.error('Get active tagihan error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * GET /api/penghuni/tagihan/history
     * Get payment history
     */
    async getTagihanHistory(req, res) {
        try {
            const { uid } = req.user;
            const penghuni = await prisma_1.default.penghuni.findUnique({
                where: { userId: uid },
            });
            if (!penghuni) {
                return res.status(404).json({ error: 'Data penghuni tidak ditemukan' });
            }
            const tagihan = await prisma_1.default.tagihan.findMany({
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
        }
        catch (error) {
            console.error('Get tagihan history error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * POST /api/penghuni/tagihan/:id/bayar
     * Upload payment proof
     */
    async uploadPaymentProof(req, res) {
        try {
            const { uid } = req.user;
            const { id } = req.params;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'File bukti pembayaran wajib diupload' });
            }
            const penghuni = await prisma_1.default.penghuni.findUnique({
                where: { userId: uid },
            });
            if (!penghuni) {
                return res.status(404).json({ error: 'Data penghuni tidak ditemukan' });
            }
            const tagihan = await prisma_1.default.tagihan.findFirst({
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
            await prisma_1.default.pembayaran.create({
                data: {
                    tagihanId: tagihan.id,
                    buktiFoto: buktiFotoUrl,
                },
            });
            // Update tagihan status
            await prisma_1.default.tagihan.update({
                where: { id: tagihan.id },
                data: { status: 'MENUNGGU_VERIFIKASI' },
            });
            return res.json({
                success: true,
                message: 'Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.',
            });
        }
        catch (error) {
            console.error('Upload payment proof error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    // ===================== LAPORAN =====================
    /**
     * GET /api/penghuni/laporan
     * Get my reports
     */
    async getMyLaporan(req, res) {
        try {
            const { uid } = req.user;
            const penghuni = await prisma_1.default.penghuni.findUnique({
                where: { userId: uid },
            });
            if (!penghuni) {
                return res.status(404).json({ error: 'Data penghuni tidak ditemukan' });
            }
            const laporan = await prisma_1.default.laporan.findMany({
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
        }
        catch (error) {
            console.error('Get my laporan error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * POST /api/penghuni/laporan
     * Create new report
     */
    async createLaporan(req, res) {
        try {
            const { uid } = req.user;
            const body = schemas_1.createLaporanSchema.parse(req.body);
            const file = req.file;
            const penghuni = await prisma_1.default.penghuni.findUnique({
                where: { userId: uid },
            });
            if (!penghuni) {
                return res.status(404).json({ error: 'Data penghuni tidak ditemukan' });
            }
            const fotoUrl = file ? `/uploads/${file.filename}` : null;
            const laporan = await prisma_1.default.laporan.create({
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
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error: 'Validasi gagal', details: error.errors });
            }
            console.error('Create laporan error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=TenantController.js.map