import { z } from 'zod';

// User Schemas
export const syncUserSchema = z.object({
    email: z.string().email(),
    nama: z.string().min(1),
    noHp: z.string().optional(),
});

export const updateProfileSchema = z.object({
    nama: z.string().min(1).optional(),
    noHp: z.string().optional(),
});

// Kamar Schemas
export const createKamarSchema = z.object({
    nomorKamar: z.string().min(1),
    tipeKamar: z.enum(['Standard', 'VIP']),
    hargaBulanan: z.number().positive(),
    fasilitas: z.string().optional(),
});

export const updateKamarSchema = z.object({
    tipeKamar: z.enum(['Standard', 'VIP']).optional(),
    hargaBulanan: z.number().positive().optional(),
    status: z.enum(['TERSEDIA', 'TERISI', 'MAINTENANCE']).optional(),
    fasilitas: z.string().optional(),
});

// Penghuni Schemas
export const createPenghuniSchema = z.object({
    email: z.string().email(),
    nama: z.string().min(1),
    noHp: z.string().optional(),
    kamarId: z.number().int().positive().optional(),
});

// Pembayaran Schemas
export const verifyPaymentSchema = z.object({
    action: z.enum(['ACCEPT', 'REJECT']),
    reason: z.string().optional(),
});

// Laporan Schemas
export const createLaporanSchema = z.object({
    judul: z.string().min(1),
    deskripsi: z.string().min(1),
});

export const updateLaporanStatusSchema = z.object({
    status: z.enum(['BARU', 'DIPROSES', 'SELESAI']),
});

// Settings Schemas
export const updateSettingsSchema = z.object({
    namaKos: z.string().min(1).optional(),
    bankInfo: z.string().min(1).optional(),
    hargaDasar: z.number().positive().optional(),
});
