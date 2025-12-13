"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Moon, 
  Sun,
  Shield,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  CreditCard,
  Smartphone,
  CheckCircle2
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login, user, pending2FA } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if already logged in or if 2FA is required
  useEffect(() => {
    if (pending2FA) {
      router.replace("/verify-2fa")
    } else if (user) {
      if (user.role === "admin") {
        router.replace("/admin")
      } else if (user.role === "teller") {
        router.replace("/teller")
      } else if (user.role === "customer") {
        router.replace("/customer")
      }
    }
  }, [user, router, pending2FA])

  // Don't render anything while redirecting
  if (user || pending2FA) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Please enter both email and password to continue.")
      setLoading(false)
      return
    }

    try {
      const result = await login(email, password, rememberMe)

      if (result.success) {
        setLoading(false)
        // Don't set error on success
      } else if (result.requires2FA) {
        setLoading(false)
        // Don't set error if 2FA is required
      } else {
        setError(result.message || "Invalid email or password. If you don't have an account, please sign up first.")
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      // Set error message from the caught error
      const errorMessage = error?.message || error?.toString() || "An unexpected error occurred. Please try again."
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-500" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          <div>
            <Link href="/landing">
              <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10 mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">BAMS</h1>
                <p className="text-white/80 text-sm">Banking Management System</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Welcome Back
            </h2>
            <p className="text-xl text-white/90 mb-12">
              Secure banking made simple. Access your account with confidence.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Bank-Level Security</h3>
                <p className="text-white/80 text-sm">256-bit encryption and multi-factor authentication</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Real-Time Analytics</h3>
                <p className="text-white/80 text-sm">Track your finances with instant updates</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Mobile First</h3>
                <p className="text-white/80 text-sm">Bank from anywhere with our mobile app</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-12 bg-white dark:bg-slate-950 relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between py-4">
          <Link href="/landing">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg">BAMS</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              disabled={!mounted}
            >
              {mounted && theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Desktop Theme Toggle */}
        <div className="hidden lg:block absolute top-8 right-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            disabled={!mounted}
          >
            {mounted && theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        {/* Centered Login Form Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Sign In
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Enter your credentials to access your account
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-12 rounded-lg border-slate-300 dark:border-slate-700 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 pr-12 h-12 rounded-lg border-slate-300 dark:border-slate-700 focus:border-primary focus:ring-primary"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-slate-300 dark:border-slate-700"
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <span>{error}</span>
                    {error.includes('Invalid email or password') && (
                      <div className="pt-2 space-y-2">
                        <p className="text-xs text-red-600 dark:text-red-400">
                          <strong>Don't have an account?</strong> Create one to get started.
                        </p>
                        <Link href="/signup">
                          <Button variant="outline" size="sm" className="w-full text-sm">
                            Create New Account
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                {error.includes('Supabase') && (
                  <Link href="/login/check-config">
                    <Button variant="outline" size="sm" className="w-full">
                      Check Supabase Configuration
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 rounded-lg text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                  Create one here
                </Link>
              </p>
            </div>

            {/* Security Note */}
            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Security Notice
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Never share your login credentials. Our staff will never ask for your password.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© 2025 BAMS Banking. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
