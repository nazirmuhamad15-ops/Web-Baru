'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        toast.success('Login berhasil!')
        
        // Redirect based on role
        if (data.user.role === 'CUSTOMER') {
          router.push('/dashboard/customer')
        } else {
          router.push('/dashboard/admin')
        }
      } else {
        toast.error(data.error || 'Login gagal')
      }
    } catch (error) {
      toast.error('Login gagal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <Link className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Selamat Datang Kembali</CardTitle>
          <CardDescription>
            Masuk ke akun Petualangan Curug Mara Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Belum punya akun? </span>
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/register')}>
              Daftar
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Akun Demo:</p>
            <div className="space-y-1 text-xs">
              <div><strong>Super Admin:</strong> admin@curugmara.id / admin123</div>
              <div><strong>Admin:</strong> manager@curugmara.id / admin123</div>
              <div><strong>Customer:</strong> customer@example.com / customer123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}