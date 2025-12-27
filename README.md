# Atlas Kos Backend - Walkthrough

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema with all models
├── src/
│   ├── config/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── firebase.ts        # Firebase Admin SDK setup
│   ├── controllers/
│   │   ├── AuthController.ts  # Auth & Profile endpoints
│   │   ├── AdminController.ts # All Admin endpoints
│   │   └── TenantController.ts# All Tenant endpoints
│   ├── middlewares/
│   │   ├── auth.ts            # JWT verification & role guards
│   │   └── upload.ts          # Multer file upload config
│   ├── routes/
│   │   ├── auth.ts            # /api/auth routes
│   │   ├── admin.ts           # /api/admin routes
│   │   ├── kamar.ts           # /api/kamar routes
│   │   └── penghuni.ts        # /api/penghuni routes
│   ├── services/
│   │   └── N8nService.ts      # n8n webhook for notifications
│   ├── utils/
│   │   └── schemas.ts         # Zod validation schemas
│   └── app.ts                 # Express entry point
├── .env.example               # Environment template
├── package.json               # Dependencies & scripts
└── tsconfig.json              # TypeScript config
```

## Setup Instructions

1. **Configure Environment**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

2. **Database Setup**:
   ```bash
   # Push schema to MySQL database
   npm run db:push
   
   # Generate Prisma client
   npm run db:generate
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth & Profile (`/api/auth`)
- `POST /sync` - Sync Firebase user to database
- `GET /profile` - Get current user profile
- `PUT /profile` - Update profile (nama, noHp)

### Admin (`/api/admin`) - Protected
- `GET /stats` - Dashboard statistics
- `GET /settings` - System configuration
- `PUT /settings` - Update configuration
- `GET /penghuni` - List all tenants
- `POST /penghuni` - Register tenant manually
- `GET /pembayaran/pending` - Pending payments
- `POST /pembayaran/:id/confirm` - Verify/reject payment
- `GET /laporan` - All maintenance reports
- `PUT /laporan/:id/status` - Update report status

### Kamar (`/api/kamar`)
- `GET /` - List all rooms
- `POST /` - Create room (Admin)
- `PUT /:id` - Update room (Admin)

### Penghuni (`/api/penghuni`) - Protected
- `GET /tagihan/active` - Current month bill
- `GET /tagihan/history` - Payment history
- `POST /tagihan/:id/bayar` - Upload payment proof
- `GET /laporan` - My reports
- `POST /laporan` - Create new report

## Verification Completed
- ✅ All controllers implemented
- ✅ Zod validation on all inputs
- ✅ Firebase token verification middleware
- ✅ Role-based access control (Admin/Penghuni)
- ✅ Multer file upload for proofs
- ✅ N8n webhook integration for notifications
