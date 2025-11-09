import { NextRequest, NextResponse } from 'next/server'
import { withAdminRole } from '@/lib/middleware'
import { db } from '@/lib/db'
import { exportToExcel, prepareBookingExportData, prepareUserExportData, prepareRouteExportData, prepareRevenueReportData } from '@/lib/excel'
import * as XLSX from 'xlsx'

interface ExportResult {
  headers: string[]
  data: (string | number)[][]
}

export const POST = withAdminRole(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { type, filters = {} } = body

    let exportData: ExportResult
    let fileName: string
    let sheetName: string

    switch (type) {
      case 'bookings':
        const bookings = await db.booking.findMany({
          where: {
            ...(filters.status && { status: filters.status }),
            ...(filters.dateFrom && { bookingDate: { gte: filters.dateFrom } }),
            ...(filters.dateTo && { bookingDate: { lte: filters.dateTo } }),
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            route: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        const bookingExport = prepareBookingExportData(bookings)
        exportData = bookingExport
        fileName = `reservasi_${new Date().toISOString().split('T')[0]}`
        sheetName = 'Reservasi'
        break

      case 'users':
        const users = await db.user.findMany({
          where: {
            ...(filters.role && { role: filters.role }),
            ...(filters.isActive !== undefined && { isActive: filters.isActive }),
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        })

        const userExport = prepareUserExportData(users)
        exportData = userExport
        fileName = `pengguna_${new Date().toISOString().split('T')[0]}`
        sheetName = 'Pengguna'
        break

      case 'routes':
        const routes = await db.route.findMany({
          where: {
            ...(filters.isActive !== undefined && { isActive: filters.isActive }),
          },
          orderBy: { name: 'asc' },
        })

        const routeExport = prepareRouteExportData(routes)
        exportData = routeExport
        fileName = `rute_${new Date().toISOString().split('T')[0]}`
        sheetName = 'Rute'
        break

      case 'revenue':
        const revenueBookings = await db.booking.findMany({
          where: {
            ...(filters.dateFrom && { bookingDate: { gte: filters.dateFrom } }),
            ...(filters.dateTo && { bookingDate: { lte: filters.dateTo } }),
            status: { in: ['CONFIRMED', 'COMPLETED'] },
          },
          include: {
            route: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        const revenueExport = prepareRevenueReportData(revenueBookings)
        exportData = revenueExport
        fileName = `laporan_pendapatan_${new Date().toISOString().split('T')[0]}`
        sheetName = 'Pendapatan'
        break

      default:
        return NextResponse.json(
          { error: 'Tipe export tidak valid' },
          { status: 400 }
        )
    }

    // Create Excel file
    const wb = XLSX.utils.book_new()
    const wsData = [exportData.headers, ...exportData.data]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    
    // Set column widths
    const colWidths = exportData.headers.map(() => ({ wch: 20 }))
    ws['!cols'] = colWidths
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    
    // Convert to buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    
    // Return file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}.xlsx"`,
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Gagal mengekspor data' },
      { status: 500 }
    )
  }
})