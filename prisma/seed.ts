import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Super Admin
  const superAdminPassword = await hashPassword('admin123')
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@curugmara.com' },
    update: {},
    create: {
      email: 'admin@curugmara.com',
      name: 'Super Admin',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
    },
  })

  // Create Admin
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'manager@curugmara.com' },
    update: {},
    create: {
      email: 'manager@curugmara.com',
      name: 'Manager',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create sample customer
  const customerPassword = await hashPassword('customer123')
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'John Doe',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+1234567890',
    },
  })

  // Create routes
  const route1 = await prisma.route.upsert({
    where: { id: 'route-1' },
    update: {},
    create: {
      id: 'route-1',
      name: 'Petualangan Air Terjun',
      description: 'Nikmati keindahan spektakuler Air Terjun Curug Mara dengan pemandu profesional kami.',
      price: 150000,
      duration: 120,
      difficulty: 'Sedang',
    },
  })

  const route2 = await prisma.route.upsert({
    where: { id: 'route-2' },
    update: {},
    create: {
      id: 'route-2',
      name: 'Jelajah Hutan',
      description: 'Trekking pemandangan indah melalui hutan yang rimbun di sekitar air terjun.',
      price: 100000,
      duration: 90,
      difficulty: 'Mudah',
    },
  })

  const route3 = await prisma.route.upsert({
    where: { id: 'route-3' },
    update: {},
    create: {
      id: 'route-3',
      name: 'Panjat Tebing Ekstrem',
      description: 'Untuk jiwa petualang - pendakian menantang dengan pemandangan spektakuler.',
      price: 250000,
      duration: 180,
      difficulty: 'Sulit',
    },
  })

  // Create gallery images
  for (const imageData of [
    {
      id: 'gallery-1',
      title: 'Air Terjun Utama',
      description: 'Air Terjun Curug Mara yang spektakuler dalam aliran penuh',
      imageUrl: 'https://picsum.photos/800/600?random=1',
      thumbnailUrl: 'https://picsum.photos/400/300?random=1',
      category: 'Air Terjun',
      sortOrder: 1,
    },
    {
      id: 'gallery-2',
      title: 'Jalur Hutan',
      description: 'Jalur hutan yang indah menuju air terjun',
      imageUrl: 'https://picsum.photos/800/600?random=2',
      thumbnailUrl: 'https://picsum.photos/400/300?random=2',
      category: 'Alam',
      sortOrder: 2,
    },
    {
      id: 'gallery-3',
      title: 'Grup Petualang',
      description: 'Petualang bahagia setelah menyelesaikan jalur',
      imageUrl: 'https://picsum.photos/800/600?random=3',
      thumbnailUrl: 'https://picsum.photos/400/300?random=3',
      category: 'Orang',
      sortOrder: 3,
    },
    {
      id: 'gallery-4',
      title: 'Formasi Batu',
      description: 'Formasi batu kuno di sepanjang jalur',
      imageUrl: 'https://picsum.photos/800/600?random=4',
      thumbnailUrl: 'https://picsum.photos/400/300?random=4',
      category: 'Alam',
      sortOrder: 4,
    },
    {
      id: 'gallery-5',
      title: 'Pemandangan Sungai',
      description: 'Sungai jernih yang mengalir dari air terjun',
      imageUrl: 'https://picsum.photos/800/600?random=5',
      thumbnailUrl: 'https://picsum.photos/400/300?random=5',
      category: 'Air Terjun',
      sortOrder: 5,
    },
    {
      id: 'gallery-6',
      title: 'Pemandangan Matahari Terbenam',
      description: 'Matahari terbenam yang indah di area air terjun',
      imageUrl: 'https://picsum.photos/800/600?random=6',
      thumbnailUrl: 'https://picsum.photos/400/300?random=6',
      category: 'Lanskap',
      sortOrder: 6,
    },
  ]) {
    await prisma.gallery.upsert({
      where: { id: imageData.id },
      update: {},
      create: imageData,
    })
  }

  // Create CMS settings
  for (const setting of [
    {
      key: 'site_name',
      value: 'Petualangan Curug Mara',
      type: 'text',
      description: 'Nama website yang ditampilkan di header dan judul',
    },
    {
      key: 'site_description',
      value: 'Rasakan sensasi petualangan air terjun di tengah pemandangan alam yang menakjubkan',
      type: 'text',
      description: 'Deskripsi situs untuk SEO dan halaman beranda',
    },
    {
      key: 'contact_email',
      value: 'info@curugmara.id',
      type: 'text',
      description: 'Email kontak untuk pertanyaan',
    },
    {
      key: 'contact_phone',
      value: '+62-812-3456-7890',
      type: 'text',
      description: 'Nomor telepon kontak',
    },
    {
      key: 'primary_color',
      value: '#059669',
      type: 'text',
      description: 'Warna tema utama',
    },
    {
      key: 'secondary_color',
      value: '#2563eb',
      type: 'text',
      description: 'Warna tema sekunder',
    },
  ]) {
    await prisma.cMSSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  // Create sample daily capacities for next 30 days
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    await prisma.dailyCapacity.upsert({
      where: {
        routeId_date: { routeId: route1.id, date: dateStr },
      },
      update: {},
      create: {
        routeId: route1.id,
        date: dateStr,
        maxCapacity: 50,
        currentBookings: 0,
        version: 0,
      },
    })

    await prisma.dailyCapacity.upsert({
      where: {
        routeId_date: { routeId: route2.id, date: dateStr },
      },
      update: {},
      create: {
        routeId: route2.id,
        date: dateStr,
        maxCapacity: 30,
        currentBookings: 0,
        version: 0,
      },
    })

    await prisma.dailyCapacity.upsert({
      where: {
        routeId_date: { routeId: route3.id, date: dateStr },
      },
      update: {},
      create: {
        routeId: route3.id,
        date: dateStr,
        maxCapacity: 20,
        currentBookings: 0,
        version: 0,
      },
    })
  }

  console.log('Database berhasil di-seed!')
  console.log('Kredensial login:')
  console.log('Super Admin: admin@curugmara.id / admin123')
  console.log('Admin: manager@curugmara.id / admin123')
  console.log('Customer: customer@example.com / customer123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })