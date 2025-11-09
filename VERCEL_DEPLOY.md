# Panduan Deploy ke Vercel

## Langkah-langkah Deploy

### 1. Install Vercel CLI (Opsional)
```bash
npm i -g vercel
```

### 2. Login ke Vercel
```bash
vercel login
```

### 3. Deploy ke Vercel
```bash
vercel
```

Atau deploy langsung dari GitHub:
1. Push code ke GitHub
2. Import project di https://vercel.com
3. Connect repository Anda
4. Vercel akan otomatis detect Next.js

## Environment Variables

Setelah deploy, pastikan untuk menambahkan environment variables di Vercel Dashboard:

1. Buka project di Vercel Dashboard
2. Pergi ke Settings > Environment Variables
3. Tambahkan variabel berikut:

### Required Variables:

#### Clerk Authentication:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Publishable key dari Clerk (dapatkan di https://dashboard.clerk.com)
- `CLERK_SECRET_KEY` - Secret key dari Clerk

#### Database (PostgreSQL):
- `DATABASE_URL` - PostgreSQL connection string (lihat instruksi di bawah)

#### Pusher (Real-time Features):
- `PUSHER_APP_ID` - Pusher App ID (dapatkan di https://dashboard.pusher.com)
- `PUSHER_KEY` - Pusher Key
- `NEXT_PUBLIC_PUSHER_KEY` - Sama dengan PUSHER_KEY (untuk client-side)
- `PUSHER_SECRET` - Pusher Secret
- `NEXT_PUBLIC_PUSHER_CLUSTER` - Pusher Cluster (e.g., "ap1", "us2", "eu")

#### JWT (jika menggunakan):
- `JWT_SECRET` - Secret untuk JWT token

## Catatan Penting

### Real-time Features dengan Pusher
✅ **Sudah dikonfigurasi**: Aplikasi ini menggunakan **Pusher** untuk real-time features yang kompatibel dengan Vercel serverless.

**Setup Pusher:**
1. Daftar di https://pusher.com (gratis untuk development)
2. Buat aplikasi baru di Pusher Dashboard
3. Pilih cluster terdekat (misalnya "ap1" untuk Asia Pacific)
4. Copy App ID, Key, Secret, dan Cluster
5. Tambahkan ke environment variables di Vercel

**Catatan:**
- Socket.IO hanya bekerja di development/local (via `server.ts`)
- Di production/Vercel, aplikasi otomatis menggunakan Pusher
- Tidak perlu konfigurasi tambahan, sudah terintegrasi

### Build Configuration
- Build command: `npm run build`
- Output directory: `.next` (otomatis)
- Install command: `npm install`

### Database PostgreSQL
✅ **Sudah dikonfigurasi**: Aplikasi ini sudah menggunakan PostgreSQL yang kompatibel dengan Vercel.

**Setup Database:**

1. **Pilih Provider PostgreSQL:**
   - **Vercel Postgres** (Recommended - terintegrasi langsung)
     - Buka Vercel Dashboard > Storage > Create Database > Postgres
     - Vercel akan otomatis set `DATABASE_URL`
   
   - **Supabase** (Gratis tier tersedia)
     - Daftar di https://supabase.com
     - Buat project baru
     - Copy connection string dari Settings > Database
     - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   
   - **Neon** (Serverless PostgreSQL)
     - Daftar di https://neon.tech
     - Buat project baru
     - Copy connection string
   
   - **Railway** (Mudah digunakan)
     - Daftar di https://railway.app
     - Buat PostgreSQL database
     - Copy connection string

2. **Set DATABASE_URL di Vercel:**
   - Buka Vercel Dashboard > Project Settings > Environment Variables
   - Tambahkan `DATABASE_URL` dengan connection string dari provider

3. **Jalankan Migration:**
   ```bash
   # Pull environment variables
   vercel env pull .env.local
   
   # Generate Prisma Client
   npx prisma generate
   
   # Deploy migrations
   npx prisma migrate deploy
   ```

4. **Seed Database (Opsional):**
   ```bash
   npx prisma db seed
   ```

## Setup Lengkap Step-by-Step

### 1. Setup Database PostgreSQL
1. Pilih provider (Vercel Postgres, Supabase, Neon, atau Railway)
2. Buat database dan dapatkan connection string
3. Tambahkan `DATABASE_URL` ke Vercel environment variables

### 2. Setup Pusher
1. Daftar di https://pusher.com
2. Buat aplikasi baru
3. Pilih cluster (misalnya "ap1" untuk Asia)
4. Tambahkan environment variables ke Vercel:
   - `PUSHER_APP_ID`
   - `PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_KEY` (sama dengan PUSHER_KEY)
   - `PUSHER_SECRET`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`

### 3. Setup Clerk
1. Daftar di https://dashboard.clerk.com
2. Buat aplikasi baru
3. Copy Publishable Key dan Secret Key
4. Tambahkan ke Vercel environment variables

### 4. Deploy
1. Push code ke GitHub
2. Import project di Vercel
3. Vercel akan otomatis detect dan build
4. Setelah deploy, jalankan migration:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

## Troubleshooting

### Build Error
- Pastikan semua dependencies terinstall
- Check TypeScript errors
- Pastikan environment variables sudah di-set
- Pastikan Prisma schema sudah di-update ke PostgreSQL

### Runtime Error
- Check logs di Vercel Dashboard
- Pastikan environment variables sudah benar
- Pastikan `DATABASE_URL` format benar
- Pastikan Pusher credentials sudah benar
- Check apakah migration sudah dijalankan

### Database Connection Error
- Pastikan `DATABASE_URL` format benar
- Pastikan database sudah dibuat dan running
- Check apakah IP whitelist sudah di-set (jika diperlukan)
- Pastikan SSL mode sudah di-set (biasanya `?sslmode=require`)

### Pusher Connection Error
- Pastikan semua Pusher environment variables sudah di-set
- Pastikan cluster name sudah benar
- Check Pusher dashboard untuk melihat connection logs

## Support
Untuk bantuan lebih lanjut, kunjungi:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

