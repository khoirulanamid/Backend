"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const schemas_1 = require("../utils/schemas");
const zod_1 = require("zod");
const N8nService_1 = require("../services/N8nService");
const crypto_1 = __importDefault(require("crypto"));
exports.AdminController = {
    /**
     * GET /api/admin/stats
     * Get dashboard statistics
     */
    async getStats(req, res) {
        try {
            const [totalKamar, kamarTersedia, kamarTerisi, kamarMaintenance, totalPenghuni, pendingPayments, totalRevenue,] = await Promise.all([
                prisma_1.default.kamar.count(),
                prisma_1.default.kamar.count({ where: { status: 'TERSEDIA' } }),
                prisma_1.default.kamar.count({ where: { status: 'TERISI' } }),
                prisma_1.default.kamar.count({ where: { status: 'MAINTENANCE' } }),
                prisma_1.default.penghuni.count(),
                prisma_1.default.tagihan.count({ where: { status: 'MENUNGGU_VERIFIKASI' } }),
                prisma_1.default.tagihan.aggregate({
                    where: { status: 'LUNAS' },
                    _sum: { jumlah: true },
                }),
            ]);
            return res.json({
                success: true,
                stats: {
                    totalKamar,
                    kamarTersedia,
                    kamarTerisi,
                    kamarMaintenance,
                    totalPenghuni,
                    pendingPayments,
                    totalRevenue: totalRevenue._sum.jumlah || 0,
                },
            });
        }
        catch (error) {
            console.error('Get stats error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * GET /api/admin/settings
     * Get system configuration
     */
    async getSettings(req, res) {
        try {
            let settings = await prisma_1.default.systemConfig.findFirst();
            if (!settings) {
                settings = await prisma_1.default.systemConfig.create({
                    data: {},
                });
            }
            return res.json({
                success: true,
                settings: {
                    namaKos: settings.namaKos,
                    bankInfo: settings.bankInfo,
                    hargaDasar: settings.hargaDasar,
                },
            });
        }
        catch (error) {
            console.error('Get settings error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * PUT /api/admin/settings
     * Update system configuration
     */
    async updateSettings(req, res) {
        try {
            const body = schemas_1.updateSettingsSchema.parse(req.body);
            const settings = await prisma_1.default.systemConfig.upsert({
                where: { id: 1 },
                update: {
                    ...(body.namaKos && { namaKos: body.namaKos }),
                    ...(body.bankInfo && { bankInfo: body.bankInfo }),
                    ...(body.hargaDasar && { hargaDasar: body.hargaDasar }),
                },
                create: {
                    namaKos: body.namaKos || 'Atlas Kos',
                    bankInfo: body.bankInfo || 'BCA 123456789 a.n Atlas',
                    hargaDasar: body.hargaDasar || 500000,
                },
            });
            return res.json({
                success: true,
                settings,
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error: 'Validasi gagal', details: error.errors });
            }
            console.error('Update settings error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    // ===================== KAMAR =====================
    /**
     * GET /api/kamar
     * List all rooms
     */
    async listKamar(req, res) {
        try {
            const kamar = await prisma_1.default.kamar.findMany({
                include: {
                    penghuni: {
                        include: {
                            user: {
                                select: { nama: true, email: true, noHp: true },
                            },
                        },
                    },
                },
                orderBy: { nomorKamar: 'asc' },
            });
            return res.json({
                success: true,
                kamar: kamar.map((k) => ({
                    id: k.id,
                    nomorKamar: k.nomorKamar,
                    tipeKamar: k.tipeKamar,
                    hargaBulanan: k.hargaBulanan,
                    status: k.status,
                    fasilitas: k.fasilitas,
                    penghuni: k.penghuni
                        ? {
                            id: k.penghuni.id,
                            nama: k.penghuni.user.nama,
                            email: k.penghuni.user.email,
                            noHp: k.penghuni.user.noHp,
                        }
                        : null,
                })),
            });
        }
        catch (error) {
            console.error('List kamar error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * POST /api/kamar
     * Create new room
     */
    async createKamar(req, res) {
        try {
            const body = schemas_1.createKamarSchema.parse(req.body);
            const existing = await prisma_1.default.kamar.findUnique({
                where: { nomorKamar: body.nomorKamar },
            });
            if (existing) {
                return res.status(400).json({ error: 'Nomor kamar sudah ada' });
            }
            const kamar = await prisma_1.default.kamar.create({
                data: {
                    nomorKamar: body.nomorKamar,
                    tipeKamar: body.tipeKamar,
                    hargaBulanan: body.hargaBulanan,
                    fasilitas: body.fasilitas,
                },
            });
            return res.status(201).json({
                success: true,
                kamar,
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error: 'Validasi gagal', details: error.errors });
            }
            console.error('Create kamar error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * PUT /api/kamar/:id
     * Update room
     */
    async updateKamar(req, res) {
        try {
            const { id } = req.params;
            const body = schemas_1.updateKamarSchema.parse(req.body);
            const kamar = await prisma_1.default.kamar.update({
                where: { id: parseInt(id) },
                data: {
                    ...(body.tipeKamar && { tipeKamar: body.tipeKamar }),
                    ...(body.hargaBulanan && { hargaBulanan: body.hargaBulanan }),
                    ...(body.status && { status: body.status }),
                    ...(body.fasilitas !== undefined && { fasilitas: body.fasilitas }),
                },
            });
            return res.json({
                success: true,
                kamar,
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error: 'Validasi gagal', details: error.errors });
            }
            console.error('Update kamar error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    // ===================== PENGHUNI =====================
    /**
     * GET /api/admin/penghuni
     * List all tenants
     */
    async listPenghuni(req, res) {
        try {
            const penghuni = await prisma_1.default.penghuni.findMany({
                include: {
                    user: true,
                    kamar: true,
                    tagihan: {
                        where: {
                            periode: {
                                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                            },
                        },
                        take: 1,
                    },
                },
                orderBy: { tanggalMasuk: 'desc' },
            });
            return res.json({
                success: true,
                penghuni: penghuni.map((p) => ({
                    id: p.id,
                    userId: p.userId,
                    nama: p.user.nama,
                    email: p.user.email,
                    noHp: p.user.noHp,
                    kamar: p.kamar
                        ? {
                            id: p.kamar.id,
                            nomorKamar: p.kamar.nomorKamar,
                            tipeKamar: p.kamar.tipeKamar,
                        }
                        : null,
                    tanggalMasuk: p.tanggalMasuk,
                    statusBayarBulanIni: p.tagihan[0]?.status || 'BELUM_BAYAR',
                })),
            });
        }
        catch (error) {
            console.error('List penghuni error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * POST /api/admin/penghuni
     * Register new tenant manually
     */
    async createPenghuni(req, res) {
        try {
            const body = schemas_1.createPenghuniSchema.parse(req.body);
            // Generate a temporary Firebase-like UID
            const tempUid = 'manual-' + crypto_1.default.randomBytes(12).toString('hex');
            // Create user
            const user = await prisma_1.default.user.create({
                data: {
                    id: tempUid,
                    email: body.email,
                    nama: body.nama,
                    noHp: body.noHp,
                    role: 'PENGHUNI',
                },
            });
            // Create penghuni
            const penghuni = await prisma_1.default.penghuni.create({
                data: {
                    userId: user.id,
                    kamarId: body.kamarId,
                },
            });
            // Update room status if assigned
            if (body.kamarId) {
                await prisma_1.default.kamar.update({
                    where: { id: body.kamarId },
                    data: { status: 'TERISI' },
                });
            }
            return res.status(201).json({
                success: true,
                penghuni: {
                    id: penghuni.id,
                    userId: user.id,
                    nama: user.nama,
                    email: user.email,
                    kamarId: penghuni.kamarId,
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error: 'Validasi gagal', details: error.errors });
            }
            console.error('Create penghuni error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    // ===================== PEMBAYARAN =====================
    /**
     * GET /api/admin/pembayaran/pending
     * List pending payments
     */
    async listPendingPayments(req, res) {
        try {
            const tagihan = await prisma_1.default.tagihan.findMany({
                where: { status: 'MENUNGGU_VERIFIKASI' },
                include: {
                    penghuni: {
                        include: {
                            user: { select: { nama: true, email: true, noHp: true } },
                            kamar: { select: { nomorKamar: true } },
                        },
                    },
                    pembayaran: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            return res.json({
                success: true,
                pembayaran: tagihan.map((t) => ({
                    id: t.id,
                    periode: t.periode,
                    jumlah: t.jumlah,
                    status: t.status,
                    penghuni: {
                        nama: t.penghuni.user.nama,
                        email: t.penghuni.user.email,
                        noHp: t.penghuni.user.noHp,
                        kamar: t.penghuni.kamar?.nomorKamar,
                    },
                    bukti: t.pembayaran?.buktiFoto,
                    tanggalBayar: t.pembayaran?.tanggalBayar,
                })),
            });
        }
        catch (error) {
            console.error('List pending payments error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * POST /api/admin/pembayaran/:id/confirm
     * Confirm or reject payment
     */
    async confirmPayment(req, res) {
        try {
            const { id } = req.params;
            const body = schemas_1.verifyPaymentSchema.parse(req.body);
            const adminUid = req.user.uid;
            const tagihan = await prisma_1.default.tagihan.findUnique({
                where: { id: parseInt(id) },
                include: {
                    penghuni: {
                        include: {
                            user: { select: { nama: true, noHp: true } },
                        },
                    },
                    pembayaran: true,
                },
            });
            if (!tagihan) {
                return res.status(404).json({ error: 'Tagihan tidak ditemukan' });
            }
            if (tagihan.status !== 'MENUNGGU_VERIFIKASI') {
                return res.status(400).json({ error: 'Tagihan tidak dalam status menunggu verifikasi' });
            }
            const newStatus = body.action === 'ACCEPT' ? 'LUNAS' : 'DITOLAK';
            // Update tagihan status
            await prisma_1.default.tagihan.update({
                where: { id: parseInt(id) },
                data: { status: newStatus },
            });
            // Update pembayaran validation info
            if (tagihan.pembayaran) {
                await prisma_1.default.pembayaran.update({
                    where: { id: tagihan.pembayaran.id },
                    data: {
                        validasiOleh: adminUid,
                        alasanTolak: body.action === 'REJECT' ? body.reason : null,
                    },
                });
            }
            // Trigger n8n webhook
            const noHp = tagihan.penghuni.user.noHp;
            if (noHp) {
                const message = body.action === 'ACCEPT'
                    ? `Pembayaran untuk ${tagihan.penghuni.user.nama} telah diverifikasi. Terima kasih!`
                    : `Pembayaran untuk ${tagihan.penghuni.user.nama} ditolak. Alasan: ${body.reason || 'Tidak ada'}`;
                await N8nService_1.N8nService.notifyPaymentStatus(noHp, newStatus, message);
            }
            return res.json({
                success: true,
                message: body.action === 'ACCEPT' ? 'Pembayaran dikonfirmasi' : 'Pembayaran ditolak',
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error: 'Validasi gagal', details: error.errors });
            }
            console.error('Confirm payment error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    // ===================== LAPORAN =====================
    /**
     * GET /api/admin/laporan
     * List all maintenance reports
     */
    async listLaporan(req, res) {
        try {
            const laporan = await prisma_1.default.laporan.findMany({
                include: {
                    penghuni: {
                        include: {
                            user: { select: { nama: true } },
                            kamar: { select: { nomorKamar: true } },
                        },
                    },
                },
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
                    penghuni: {
                        nama: l.penghuni.user.nama,
                        kamar: l.penghuni.kamar?.nomorKamar,
                    },
                })),
            });
        }
        catch (error) {
            console.error('List laporan error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * PUT /api/admin/laporan/:id/status
     * Update report status
     */
    async updateLaporanStatus(req, res) {
        try {
            const { id } = req.params;
            const body = schemas_1.updateLaporanStatusSchema.parse(req.body);
            const laporan = await prisma_1.default.laporan.update({
                where: { id: parseInt(id) },
                data: { status: body.status },
            });
            return res.json({
                success: true,
                laporan,
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error: 'Validasi gagal', details: error.errors });
            }
            console.error('Update laporan status error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=AdminController.js.map