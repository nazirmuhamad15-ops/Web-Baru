'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, MapPin, Clock, Users, Star, Check, Menu, X, LogIn, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatRupiah, formatDate } from '@/lib/format'

interface Route {
  id: string
  name: string
  description: string
  price: number
  duration: number
  difficulty?: string
}

interface Gallery {
  id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl?: string
  category?: string
}

export default function Home() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchRoutes()
    fetchGallery()
  }, [])

  useEffect(() => {
    if (mounted) {
      checkAuth()
    }
  }, [mounted])

  const checkAuth = () => {
    if (typeof window === 'undefined' || !mounted) return
    try {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/public/routes')
      if (response.ok) {
        const data = await response.json()
        setRoutes(data)
      }
    } catch (error) {
      console.error('Gagal mengambil rute:', error)
    }
  }

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/public/gallery')
      if (response.ok) {
        const data = await response.json()
        setGallery(data)
      }
    } catch (error) {
      console.error('Gagal mengambil galeri:', error)
    }
  }

  const handleBooking = async () => {
    if (!selectedRoute || !selectedDate) {
      toast.error('Silakan pilih rute dan tanggal')
      return
    }

    if (typeof window === 'undefined') return
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Silakan login untuk melakukan reservasi')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/customer/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          routeId: selectedRoute.id,
          bookingDate: format(selectedDate, 'yyyy-MM-dd'),
          numberOfPeople,
          notes,
        }),
      })

      if (response.ok) {
        toast.success('Reservasi berhasil dibuat!')
        setSelectedRoute(null)
        setSelectedDate(undefined)
        setNumberOfPeople(1)
        setNotes('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal membuat reservasi')
      }
    } catch (error) {
      toast.error('Gagal membuat reservasi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (typeof window === 'undefined' || !mounted) return
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      toast.success('Berhasil logout')
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-green-600">Petualangan Curug Mara</h1>
              <nav className="hidden md:flex gap-6">
                <a href="#routes" className="text-gray-600 hover:text-green-600 transition-colors">Rute</a>
                <a href="#gallery" className="text-gray-600 hover:text-green-600 transition-colors">Galeri</a>
                <a href="#booking" className="text-gray-600 hover:text-green-600 transition-colors">Pesan Sekarang</a>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Selamat datang, {user.name || user.email}</span>
                  <Link href={user.role === 'CUSTOMER' ? '/dashboard/customer' : '/dashboard/admin'}>
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      <LogIn className="h-4 w-4 mr-2" />
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Daftar
                    </Button>
                  </Link>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-4">
                <a href="#routes" className="text-gray-600 hover:text-green-600">Rute</a>
                <a href="#gallery" className="text-gray-600 hover:text-green-600">Galeri</a>
                <a href="#booking" className="text-gray-600 hover:text-green-600">Pesan Sekarang</a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Petualangan Curug Mara
            </h1>
            <p className="text-xl mb-8">
              Rasakan sensasi petualangan air terjun di tengah pemandangan alam yang menakjubkan
            </p>
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              <a href="#booking">Pesan Petualangan Anda</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Routes Section */}
      <section id="routes" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Rute yang Tersedia</h2>
            <p className="text-muted-foreground">Pilih petualangan sempurna Anda</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {routes.map((route) => (
              <Card key={route.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{route.name}</CardTitle>
                    <Badge variant="secondary">{route.difficulty || 'Mudah'}</Badge>
                  </div>
                  <CardDescription>{route.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{route.duration} menit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Cocok untuk grup</span>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-2xl font-bold text-green-600">
                        {formatRupiah(route.price)}
                      </span>
                      <Button 
                        onClick={() => setSelectedRoute(route)}
                        variant={selectedRoute?.id === route.id ? "default" : "outline"}
                      >
                        {selectedRoute?.id === route.id ? "Dipilih" : "Pilih"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Buat Reservasi</CardTitle>
                <CardDescription>
                  Isi detail untuk memesan petualangan Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="route">Rute yang Dipilih</Label>
                    <Input
                      id="route"
                      value={selectedRoute?.name || 'Tidak ada rute yang dipilih'}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Tanggal</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="people">Jumlah Orang</Label>
                    <Select value={numberOfPeople.toString()} onValueChange={(v) => setNumberOfPeople(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Orang' : 'Orang'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="total">Total Harga</Label>
                    <Input
                      id="total"
                      value={selectedRoute ? formatRupiah(selectedRoute.price * numberOfPeople) : 'Rp 0'}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Catatan Khusus (Opsional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Permintaan khusus atau catatan lainnya..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Bayar di lokasi - Tidak perlu pembayaran di muka
                  </div>
                  <Button 
                    onClick={handleBooking}
                    disabled={!selectedRoute || !selectedDate || isLoading}
                    size="lg"
                  >
                    {isLoading ? 'Membuat Reservasi...' : 'Pesan Sekarang'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Galeri</h2>
            <p className="text-muted-foreground">Lihat apa yang menanti Anda</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={image.thumbnailUrl || image.imageUrl}
                    alt={image.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{image.title}</h3>
                  {image.description && (
                    <p className="text-sm text-muted-foreground">{image.description}</p>
                  )}
                  {image.category && (
                    <Badge variant="outline" className="mt-2">
                      {image.category}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Petualangan Curug Mara</h3>
              <p className="text-gray-400">
                Rasakan sensasi petualangan air terjun di tengah pemandangan alam yang menakjubkan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tautan Cepat</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#routes" className="hover:text-white">Rute</a></li>
                <li><a href="#gallery" className="hover:text-white">Galeri</a></li>
                <li><a href="#booking" className="hover:text-white">Pesan Sekarang</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@curugmara.id</li>
                <li>Telepon: +62-812-3456-7890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 Petualangan Curug Mara. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}