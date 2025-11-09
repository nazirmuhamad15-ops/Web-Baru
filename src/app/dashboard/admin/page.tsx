'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { 
  BarChart3, 
  Users, 
  MapPin, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  FileSpreadsheet
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { formatRupiah, formatDate, formatDateTime } from '@/lib/format'

interface User {
  id: string
  email: string
  name?: string
  role: string
  phone?: string
  isActive: boolean
  createdAt: string
}

interface Route {
  id: string
  name: string
  description: string
  price: number
  duration: number
  difficulty?: string
  isActive: boolean
  createdAt: string
}

interface Booking {
  id: string
  bookingDate: string
  numberOfPeople: number
  totalPrice: number
  status: string
  paymentStatus: string
  notes?: string
  user: {
    name?: string
    email: string
  }
  route: {
    name: string
    duration: number
    price: number
  }
  createdAt: string
}

interface DailyCapacity {
  id: string
  routeId: string
  date: string
  maxCapacity: number
  currentBookings: number
  version: number
  isActive: boolean
  route: {
    name: string
  }
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState<User[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [capacities, setCapacities] = useState<DailyCapacity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  // Form states
  const [routeForm, setRouteForm] = useState({ name: '', description: '', price: 0, duration: 60, difficulty: 'Mudah' })
  const [capacityForm, setCapacityForm] = useState({ routeId: '', date: '', maxCapacity: 50 })
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null)

  // Helper function to get token safely
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  useEffect(() => {
    fetchProfile()
    fetchUsers()
    fetchRoutes()
    fetchBookings()
    fetchCapacities()
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
      }
    } catch (error) {
      console.error('Gagal mengambil profil:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Gagal mengambil pengguna:', error)
    }
  }

  const fetchRoutes = async () => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch('/api/admin/routes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setRoutes(data)
      }
    } catch (error) {
      console.error('Gagal mengambil rute:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch('/api/admin/bookings', {
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

  const fetchCapacities = async () => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch('/api/admin/capacities', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setCapacities(data)
      }
    } catch (error) {
      console.error('Gagal mengambil kapasitas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRoute = async () => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(routeForm),
      })

      if (response.ok) {
        toast.success('Rute berhasil dibuat!')
        setRouteForm({ name: '', description: '', price: 0, duration: 60, difficulty: 'Mudah' })
        fetchRoutes()
      } else {
        toast.error('Gagal membuat rute')
      }
    } catch (error) {
      toast.error('Gagal membuat rute')
    }
  }

  const handleUpdateRoute = async () => {
    console.log('handleUpdateRoute called', { editingRoute, routeForm })
    
    // Simple test alert
    if (!editingRoute) {
      alert('Tidak ada rute yang sedang diedit!')
      return
    }

    // Validation
    if (!routeForm.name || routeForm.price <= 0 || routeForm.duration <= 0) {
      toast.error('Mohon lengkapi semua field yang diperlukan')
      return
    }

    try {
      const token = getToken()
      if (!token) return
      console.log('Sending update request', { 
        routeId: editingRoute.id, 
        data: routeForm 
      })
      
      const response = await fetch(`/api/admin/routes/${editingRoute.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(routeForm),
      })

      console.log('Update response status:', response.status)
      
      if (response.ok) {
        toast.success('Rute berhasil diperbarui!')
        setEditingRoute(null)
        setRouteForm({ name: '', description: '', price: 0, duration: 60, difficulty: 'Mudah' })
        fetchRoutes()
      } else {
        const error = await response.json()
        console.error('Update error:', error)
        toast.error(error.error || 'Gagal memperbarui rute')
      }
    } catch (error) {
      console.error('Update exception:', error)
      toast.error('Gagal memperbarui rute')
    }
  }

  const handleDeleteRoute = async (route: Route) => {
    setRouteToDelete(route)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteRoute = async () => {
    if (!routeToDelete) return

    try {
      const token = getToken()
      if (!token) return
      const response = await fetch(`/api/admin/routes/${routeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success('Rute berhasil dihapus!')
        setDeleteDialogOpen(false)
        setRouteToDelete(null)
        fetchRoutes()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus rute')
      }
    } catch (error) {
      toast.error('Gagal menghapus rute')
    }
  }

  const handleToggleRouteStatus = async (routeId: string, isActive: boolean) => {
    console.log('handleToggleRouteStatus called', { routeId, isActive })
    
    try {
      const token = getToken()
      if (!token) return
      console.log('Sending toggle request:', { routeId, isActive })
      
      const response = await fetch(`/api/admin/routes/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      })

      console.log('Toggle response status:', response.status)
      
      if (response.ok) {
        toast.success(`Rute berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}!`)
        fetchRoutes()
      } else {
        const error = await response.json()
        console.error('Toggle error:', error)
        toast.error(error.error || 'Gagal memperbarui status rute')
      }
    } catch (error) {
      console.error('Toggle exception:', error)
      toast.error('Gagal memperbarui status rute')
    }
  }

  const handleCreateCapacity = async () => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch('/api/admin/capacities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(capacityForm),
      })

      if (response.ok) {
        toast.success('Kapasitas berhasil diatur!')
        setCapacityForm({ routeId: '', date: '', maxCapacity: 50 })
        fetchCapacities()
      } else {
        toast.error('Gagal mengatur kapasitas')
      }
    } catch (error) {
      toast.error('Gagal mengatur kapasitas')
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast.success(`Pengguna berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}!`)
        fetchUsers()
      } else {
        toast.error('Gagal memperbarui status pengguna')
      }
    } catch (error) {
      toast.error('Gagal memperbarui status pengguna')
    }
  }

  const handleLogout = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  interface ExportFilters {
    status?: string
    dateFrom?: string
    dateTo?: string
    role?: string
    isActive?: boolean
  }

  const handleExport = async (type: string, filters: ExportFilters = {}) => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, filters }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Get filename from response headers
        const contentDisposition = response.headers.get('content-disposition')
        let filename = `export_${type}_${new Date().toISOString().split('T')[0]}.xlsx`
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success('Data berhasil diekspor!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengekspor data')
      }
    } catch (error) {
      toast.error('Gagal mengekspor data')
    }
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

  const getRoleText = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin'
      case 'ADMIN': return 'Admin'
      case 'CUSTOMER': return 'Pelanggan'
      default: return role
    }
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Pengguna', icon: Users },
    { id: 'routes', label: 'Rute', icon: MapPin },
    { id: 'bookings', label: 'Pemesanan', icon: Calendar },
    { id: 'capacities', label: 'Kapasitas', icon: Settings },
    { id: 'export', label: 'Export Data', icon: Download },
  ]

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Memuat...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b flex justify-between items-center">
          {sidebarOpen && <h2 className="text-xl font-bold">Panel Admin</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="flex-1 p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start mb-2 ${!sidebarOpen && 'px-2'}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-4 w-4" />
                {sidebarOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b p-6">
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">Selamat datang kembali, {profile?.name || 'Admin'}</p>
        </header>

        <div className="p-6">
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rute Aktif</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{routes.filter(r => r.isActive).length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pemesanan</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatRupiah(bookings.reduce((sum, b) => sum + b.totalPrice, 0))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Management */}
          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Manajemen Pengguna</CardTitle>
                    <CardDescription>Kelola akun pengguna dan perizinan</CardDescription>
                  </div>
                  <Button onClick={() => handleExport('users')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Peran</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'SUPER_ADMIN' ? 'destructive' : 'secondary'}>
                            {getRoleText(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={(checked) => handleToggleUserStatus(user.id, checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Routes Management */}
          {activeTab === 'routes' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Manajemen Rute</CardTitle>
                      <CardDescription>Buat dan kelola rute petualangan</CardDescription>
                    </div>
                    <Button onClick={() => handleExport('routes')} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="routeName">Nama Rute</Label>
                      <Input
                        id="routeName"
                        value={routeForm.name}
                        onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="routePrice">Harga</Label>
                      <Input
                        id="routePrice"
                        type="number"
                        value={routeForm.price}
                        onChange={(e) => setRouteForm({ ...routeForm, price: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="routeDuration">Durasi (menit)</Label>
                      <Input
                        id="routeDuration"
                        type="number"
                        value={routeForm.duration}
                        onChange={(e) => setRouteForm({ ...routeForm, duration: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="routeDifficulty">Kesulitan</Label>
                      <Select value={routeForm.difficulty} onValueChange={(value) => setRouteForm({ ...routeForm, difficulty: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mudah">Mudah</SelectItem>
                          <SelectItem value="Sedang">Sedang</SelectItem>
                          <SelectItem value="Sulit">Sulit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="routeDescription">Deskripsi</Label>
                    <Textarea
                      id="routeDescription"
                      value={routeForm.description}
                      onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    {editingRoute ? (
                      <>
                        <Button type="button" onClick={handleUpdateRoute}>Perbarui Rute</Button>
                        <Button type="button" variant="outline" onClick={() => {
                          console.log('Cancel edit clicked')
                          setEditingRoute(null)
                          setRouteForm({ name: '', description: '', price: 0, duration: 60, difficulty: 'Mudah' })
                        }}>
                          Batal
                        </Button>
                      </>
                    ) : (
                      <Button type="button" onClick={handleCreateRoute}>
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Rute
                      </Button>
                    )}
                  </div>
                  {editingRoute && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <strong>Mode Edit:</strong> {editingRoute.name}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rute yang Ada</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Durasi</TableHead>
                        <TableHead>Kesulitan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routes.map((route) => (
                        <TableRow key={route.id}>
                          <TableCell>{route.name}</TableCell>
                          <TableCell>{formatRupiah(route.price)}</TableCell>
                          <TableCell>{route.duration} menit</TableCell>
                          <TableCell>{route.difficulty}</TableCell>
                          <TableCell>
                            <Switch
                              checked={route.isActive}
                              onCheckedChange={(checked) => {
                                console.log('Switch clicked for route:', route.name, 'new value:', checked)
                                handleToggleRouteStatus(route.id, checked)
                              }}
                              aria-label={`Toggle status for ${route.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log('Edit button clicked for route:', route)
                                  setEditingRoute(route)
                                  setRouteForm({
                                    name: route.name,
                                    description: route.description,
                                    price: route.price,
                                    duration: route.duration,
                                    difficulty: route.difficulty || 'Mudah'
                                  })
                                  console.log('Route form set for editing:', {
                                    name: route.name,
                                    description: route.description,
                                    price: route.price,
                                    duration: route.duration,
                                    difficulty: route.difficulty || 'Mudah'
                                  })
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteRoute(route)}
                                disabled={!route.isActive} // Disable delete if route is active
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bookings Management */}
          {activeTab === 'bookings' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Manajemen Pemesanan</CardTitle>
                    <CardDescription>Lihat dan kelola semua reservasi</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleExport('revenue')} variant="outline">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Laporan Pendapatan
                    </Button>
                    <Button onClick={() => handleExport('bookings')} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pelanggan</TableHead>
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
                            <div className="font-medium">{booking.user.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{booking.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.route.name}</TableCell>
                        <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                        <TableCell>{booking.numberOfPeople}</TableCell>
                        <TableCell>{formatRupiah(booking.totalPrice)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Capacity Management */}
          {activeTab === 'capacities' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manajemen Kapasitas Harian</CardTitle>
                  <CardDescription>Atur batas kapasitas harian untuk rute</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="capacityRoute">Rute</Label>
                      <Select value={capacityForm.routeId} onValueChange={(value) => setCapacityForm({ ...capacityForm, routeId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih rute" />
                        </SelectTrigger>
                        <SelectContent>
                          {routes.map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="capacityDate">Tanggal</Label>
                      <Input
                        id="capacityDate"
                        type="date"
                        value={capacityForm.date}
                        onChange={(e) => setCapacityForm({ ...capacityForm, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxCapacity">Kapasitas Maksimal</Label>
                      <Input
                        id="maxCapacity"
                        type="number"
                        value={capacityForm.maxCapacity}
                        onChange={(e) => setCapacityForm({ ...capacityForm, maxCapacity: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateCapacity}>
                    <Plus className="h-4 w-4 mr-2" />
                    Atur Kapasitas
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kapasitas yang Ada</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rute</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pemesanan Saat Ini</TableHead>
                        <TableHead>Kapasitas Maksimal</TableHead>
                        <TableHead>Tersedia</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {capacities.map((capacity) => {
                        const available = capacity.maxCapacity - capacity.currentBookings
                        return (
                          <TableRow key={capacity.id}>
                            <TableCell>{capacity.route.name}</TableCell>
                            <TableCell>{formatDate(capacity.date)}</TableCell>
                            <TableCell>{capacity.currentBookings}</TableCell>
                            <TableCell>{capacity.maxCapacity}</TableCell>
                            <TableCell>
                              <Badge variant={available > 0 ? 'default' : 'destructive'}>
                                {available}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={capacity.isActive ? 'default' : 'secondary'}>
                                {capacity.isActive ? 'Aktif' : 'Tidak Aktif'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Export Data */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>Unduh data dalam format Excel untuk analisis dan laporan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleExport('bookings')}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Export Reservasi
                        </CardTitle>
                        <CardDescription>
                          Unduh semua data reservasi dengan detail pelanggan dan rute
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Export Reservasi
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleExport('users')}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Export Pengguna
                        </CardTitle>
                        <CardDescription>
                          Unduh data semua pengguna dengan peran dan status
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Export Pengguna
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleExport('routes')}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Export Rute
                        </CardTitle>
                        <CardDescription>
                          Unduh data rute dengan harga dan durasi
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Export Rute
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-3" onClick={() => handleExport('revenue')}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileSpreadsheet className="h-5 w-5" />
                          Laporan Pendapatan
                        </CardTitle>
                        <CardDescription>
                          Unduh laporan pendapatan per rute dengan statistik lengkap
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" size="lg">
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Export Laporan Pendapatan
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informasi Export</CardTitle>
                  <CardDescription>Panduan untuk fitur export data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">📊 Reservasi</h4>
                        <p className="text-sm text-muted-foreground">
                          Data lengkap reservasi termasuk informasi pelanggan, rute, tanggal, harga, dan status.
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">👥 Pengguna</h4>
                        <p className="text-sm text-muted-foreground">
                          Data semua pengguna terdaftar dengan peran, status aktif, dan informasi kontak.
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">🗺️ Rute</h4>
                        <p className="text-sm text-muted-foreground">
                          Informasi lengkap rute petualangan dengan harga, durasi, dan tingkat kesulitan.
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">💰 Laporan Pendapatan</h4>
                        <p className="text-sm text-muted-foreground">
                          Analisis pendapatan per rute dengan total reservasi, jumlah pelanggan, dan rata-rata harga.
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg md:col-span-2">
                        <h4 className="font-semibold mb-2 text-red-800">🗑️ Manajemen Rute</h4>
                        <p className="text-sm text-red-700">
                          <strong>Hapus Rute:</strong> Hapus permanen rute tanpa pemesanan aktif.
                          <br />
                          <strong>Nonaktifkan Rute:</strong> Sembunyikan rute dari publik tanpa menghapus data.
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-800">💡 Tips</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• File Excel akan otomatis diunduh ke perangkat Anda</li>
                        <li>• Nama file mengandung tanggal export untuk organisasi yang baik</li>
                        <li>• Semua data sudah diformat dengan format Indonesia (Rupiah, Tanggal)</li>
                        <li>• Data dapat dibuka di Microsoft Excel, Google Sheets, atau software spreadsheet lainnya</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Rute</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus rute "{routeToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {routeToDelete && (
              <div className="space-y-2">
                <p><strong>Nama Rute:</strong> {routeToDelete.name}</p>
                <p><strong>Harga:</strong> {formatRupiah(routeToDelete.price)}</p>
                <p><strong>Durasi:</strong> {routeToDelete.duration} menit</p>
                <p><strong>Kesulitan:</strong> {routeToDelete.difficulty}</p>
              </div>
            )}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Perhatian:</strong> Rute yang memiliki pemesanan aktif tidak dapat dihapus.
                Nonaktifkan rute sebagai gantinya jika ada pemesanan terkait.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRoute}>
              Hapus Permanen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}