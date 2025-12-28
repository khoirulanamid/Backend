"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsSchema = exports.updateLaporanStatusSchema = exports.createLaporanSchema = exports.verifyPaymentSchema = exports.createPenghuniSchema = exports.updateKamarSchema = exports.createKamarSchema = exports.updateProfileSchema = exports.syncUserSchema = void 0;
const zod_1 = require("zod");
// User Schemas
exports.syncUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    nama: zod_1.z.string().min(1),
    noHp: zod_1.z.string().optional(),
});
exports.updateProfileSchema = zod_1.z.object({
    nama: zod_1.z.string().min(1).optional(),
    noHp: zod_1.z.string().optional(),
});
// Kamar Schemas
exports.createKamarSchema = zod_1.z.object({
    nomorKamar: zod_1.z.string().min(1),
    tipeKamar: zod_1.z.enum(['Standard', 'VIP']),
    hargaBulanan: zod_1.z.number().positive(),
    fasilitas: zod_1.z.string().optional(),
});
exports.updateKamarSchema = zod_1.z.object({
    tipeKamar: zod_1.z.enum(['Standard', 'VIP']).optional(),
    hargaBulanan: zod_1.z.number().positive().optional(),
    status: zod_1.z.enum(['TERSEDIA', 'TERISI', 'MAINTENANCE']).optional(),
    fasilitas: zod_1.z.string().optional(),
});
// Penghuni Schemas
exports.createPenghuniSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    nama: zod_1.z.string().min(1),
    noHp: zod_1.z.string().optional(),
    kamarId: zod_1.z.number().int().positive().optional(),
});
// Pembayaran Schemas
exports.verifyPaymentSchema = zod_1.z.object({
    action: zod_1.z.enum(['ACCEPT', 'REJECT']),
    reason: zod_1.z.string().optional(),
});
// Laporan Schemas
exports.createLaporanSchema = zod_1.z.object({
    judul: zod_1.z.string().min(1),
    deskripsi: zod_1.z.string().min(1),
});
exports.updateLaporanStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['BARU', 'DIPROSES', 'SELESAI']),
});
// Settings Schemas
exports.updateSettingsSchema = zod_1.z.object({
    namaKos: zod_1.z.string().min(1).optional(),
    bankInfo: zod_1.z.string().min(1).optional(),
    hargaDasar: zod_1.z.number().positive().optional(),
});
//# sourceMappingURL=schemas.js.map