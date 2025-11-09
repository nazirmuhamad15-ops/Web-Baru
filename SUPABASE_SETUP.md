# Panduan Setup Database di Supabase

## Langkah-langkah Menjalankan Migration SQL

### 1. Buka Supabase Dashboard
1. Kunjungi https://supabase.com/dashboard
2. Login ke akun Anda
3. Pilih project: `epbgagqnxwgtpjhvsjnz`

### 2. Buka SQL Editor
1. Di sidebar kiri, klik **SQL Editor**
2. Klik tombol **New Query** atau **+ New Query**

### 3. Copy dan Paste SQL Script
1. Buka file `prisma/migrations/init.sql` di project Anda
2. Copy semua isi file tersebut (Ctrl+A, Ctrl+C)
3. Paste ke SQL Editor di Supabase Dashboard

### 4. Jalankan SQL
1. Klik tombol **Run** atau tekan `Ctrl+Enter`
2. Tunggu hingga proses selesai
3. Anda akan melihat pesan sukses jika berhasil

### 5. Verifikasi Tabel
1. Di sidebar, klik **Table Editor**
2. Anda seharusnya melihat tabel-tabel berikut:
   - `users`
   - `routes`
   - `daily_capacities`
   - `bookings`
   - `cms_settings`
   - `gallery`

## SQL Script yang Akan Dijalankan

Script akan membuat:
- ✅ 3 Enum types: `Role`, `BookingStatus`, `PaymentStatus`
- ✅ 6 Tables: users, routes, daily_capacities, bookings, cms_settings, gallery
- ✅ Indexes untuk performa
- ✅ Foreign keys untuk relasi antar tabel

## Troubleshooting

### Error: "relation already exists"
- Beberapa tabel mungkin sudah ada
- Hapus tabel yang sudah ada terlebih dahulu, atau
- Skip bagian CREATE TABLE yang sudah ada

### Error: "type already exists"
- Enum types mungkin sudah ada
- Hapus enum yang sudah ada terlebih dahulu, atau
- Skip bagian CREATE TYPE yang sudah ada

### Error: "permission denied"
- Pastikan Anda menggunakan akun admin
- Pastikan database sudah running

## Setelah Migration Berhasil

1. **Test koneksi dari aplikasi:**
   ```bash
   npx prisma db pull
   ```

2. **Generate Prisma Client (jika belum):**
   ```bash
   npx prisma generate
   ```

3. **Test aplikasi:**
   ```bash
   npm run dev
   ```

## Connection String untuk Aplikasi

Gunakan connection pooling untuk aplikasi (sudah di-set di `.env`):
```
postgresql://postgres.epbgagqnxwgtpjhvsjnz:LJTFnAveR57xBJbI@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

Gunakan direct connection untuk migration (jika diperlukan):
```
postgresql://postgres:LJTFnAveR57xBJbI@db.epbgagqnxwgtpjhvsjnz.supabase.co:5432/postgres
```

