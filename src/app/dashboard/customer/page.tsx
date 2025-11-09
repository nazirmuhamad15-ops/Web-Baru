'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, MapPin, Users, Clock, User, Settings, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { formatRupiah, formatDate, formatDateTime } from '@/lib/format'

interface Booking {
  id: string
  bookingDate: string
  numberOfPeople: number
  totalPrice: number
  status: string
  paymentStatus: string
  notes?: string
  route: {
    name: string
    duration: number
    price: number
  }
  createdAt: string
}

interface UserProfile {
  id: string
  email: string
  name?: string
  phone?: string
  role: string
  createdAt: string
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '' })

  // Helper function to get token safely
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  useEffect(() => {
    fetchProfile()
    fetchBookings()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setEditForm({ name: data.user.name || '', phone: data.user.phone || '' })
      }
    } catch (error) {
      console.error('Gagal mengambil profil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch('/api/customer/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Gagal mengambil pemesanan:', error)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        toast.success('Profil berhasil diperbarui!')
        setIsEditing(false)
        fetchProfile()
      } else {
        toast.error('Gagal memperbarui profil')
      }
    } catch (error) {
      toast.error('Gagal memperbarui profil')
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch(`/api/customer/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast.success('Pemesanan berhasil dibatalkan!')
        fetchBookings()
      } else {
        toast.error('Gagal membatalkan pemesanan')
      }
    } catch (error) {
      toast.error('Gagal membatalkan pemesanan')
    }
  }

  const handleLogout = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Dikonfirmasi'
      case 'PENDING': return 'Menunggu'
      case 'CANCELLED': return 'Dibatalkan'
      case 'COMPLETED': return 'Selesai'
      default: return status
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Memuat...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Dashboard Pelanggan</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Pemesanan Saya</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservasi Saya</CardTitle>
                <CardDescription>Lihat dan kelola pemesanan petualangan Anda</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Anda belum melakukan reservasi</p>
                    <Button onClick={() => window.location.href = '/'}>
                      Buat Reservasi Pertama Anda
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rute</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Orang</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.route.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {booking.route.duration} menit
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                          <TableCell>{booking.numberOfPeople}</TableCell>
                          <TableCell>{formatRupiah(booking.totalPrice)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Batalkan
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">Tidak ada aksi</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Informasi Profil</CardTitle>
                    <CardDescription>Kelola detail pribadi Anda</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={profile.email}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">Nama</Label>
                        <Input
                          id="name"
                          value={isEditing ? editForm.name : (profile.name || 'Tidak diatur')}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          readOnly={!isEditing}
                          className={!isEditing ? 'bg-muted' : ''}
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telepon</Label>
                        <Input
                          id="phone"
                          value={isEditing ? editForm.phone : (profile.phone || 'Tidak diatur')}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          readOnly={!isEditing}
                          className={!isEditing ? 'bg-muted' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="memberSince">Anggota Sejak</Label>
                        <Input
                          id="memberSince"
                          value={formatDate(profile.createdAt)}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleUpdateProfile}>Simpan Perubahan</Button>
                        <Button variant="outline" onClick={() => {
                          setIsEditing(false)
                          setEditForm({ name: profile.name || '', phone: profile.phone || '' })
                        }}>
                          Batal
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}