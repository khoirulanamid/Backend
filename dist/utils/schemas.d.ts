import { z } from 'zod';
export declare const syncUserSchema: z.ZodObject<{
    email: z.ZodString;
    nama: z.ZodString;
    noHp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    nama: string;
    noHp?: string | undefined;
}, {
    email: string;
    nama: string;
    noHp?: string | undefined;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    nama: z.ZodOptional<z.ZodString>;
    noHp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nama?: string | undefined;
    noHp?: string | undefined;
}, {
    nama?: string | undefined;
    noHp?: string | undefined;
}>;
export declare const createKamarSchema: z.ZodObject<{
    nomorKamar: z.ZodString;
    tipeKamar: z.ZodEnum<["Standard", "VIP"]>;
    hargaBulanan: z.ZodNumber;
    fasilitas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nomorKamar: string;
    tipeKamar: "Standard" | "VIP";
    hargaBulanan: number;
    fasilitas?: string | undefined;
}, {
    nomorKamar: string;
    tipeKamar: "Standard" | "VIP";
    hargaBulanan: number;
    fasilitas?: string | undefined;
}>;
export declare const updateKamarSchema: z.ZodObject<{
    tipeKamar: z.ZodOptional<z.ZodEnum<["Standard", "VIP"]>>;
    hargaBulanan: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["TERSEDIA", "TERISI", "MAINTENANCE"]>>;
    fasilitas: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "TERSEDIA" | "TERISI" | "MAINTENANCE" | undefined;
    tipeKamar?: "Standard" | "VIP" | undefined;
    hargaBulanan?: number | undefined;
    fasilitas?: string | undefined;
}, {
    status?: "TERSEDIA" | "TERISI" | "MAINTENANCE" | undefined;
    tipeKamar?: "Standard" | "VIP" | undefined;
    hargaBulanan?: number | undefined;
    fasilitas?: string | undefined;
}>;
export declare const createPenghuniSchema: z.ZodObject<{
    email: z.ZodString;
    nama: z.ZodString;
    noHp: z.ZodOptional<z.ZodString>;
    kamarId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    email: string;
    nama: string;
    noHp?: string | undefined;
    kamarId?: number | undefined;
}, {
    email: string;
    nama: string;
    noHp?: string | undefined;
    kamarId?: number | undefined;
}>;
export declare const verifyPaymentSchema: z.ZodObject<{
    action: z.ZodEnum<["ACCEPT", "REJECT"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "ACCEPT" | "REJECT";
    reason?: string | undefined;
}, {
    action: "ACCEPT" | "REJECT";
    reason?: string | undefined;
}>;
export declare const createLaporanSchema: z.ZodObject<{
    judul: z.ZodString;
    deskripsi: z.ZodString;
}, "strip", z.ZodTypeAny, {
    judul: string;
    deskripsi: string;
}, {
    judul: string;
    deskripsi: string;
}>;
export declare const updateLaporanStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["BARU", "DIPROSES", "SELESAI"]>;
}, "strip", z.ZodTypeAny, {
    status: "BARU" | "DIPROSES" | "SELESAI";
}, {
    status: "BARU" | "DIPROSES" | "SELESAI";
}>;
export declare const updateSettingsSchema: z.ZodObject<{
    namaKos: z.ZodOptional<z.ZodString>;
    bankInfo: z.ZodOptional<z.ZodString>;
    hargaDasar: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    namaKos?: string | undefined;
    bankInfo?: string | undefined;
    hargaDasar?: number | undefined;
}, {
    namaKos?: string | undefined;
    bankInfo?: string | undefined;
    hargaDasar?: number | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map