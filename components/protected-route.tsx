"use client"

import React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type { UserRole } from "@/lib/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoadingSession, refreshUser } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = React.useState(false)
  const [hasRefreshed, setHasRefreshed] = React.useState(false)

  useEffect(() => {
    // Wait for session check to complete before redirecting
    if (isLoadingSession) {
      return
    }

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!user) {
      return
    }

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    const isAdminPath = currentPath.startsWith('/admin')

    // If user's role doesn't match allowed roles
    if (!allowedRoles.includes(user.role)) {
      // Special case: If trying to access admin page but role is customer,
      // try refreshing user data first (in case role was updated in database)
      if (isAdminPath && user.role === 'customer' && !hasRefreshed) {
        console.log('🔄 [ProtectedRoute] User role mismatch on admin path, refreshing user data...')
        setHasRefreshed(true)
        refreshUser().then(() => {
          // After refresh, the useEffect will run again and check the updated role
          console.log('✅ [ProtectedRoute] User data refreshed, re-checking access...')
        }).catch((error) => {
          console.error('Failed to refresh user:', error)
          // If refresh fails, proceed with redirect
          const targetPath = "/customer"
          setIsRedirecting(true)
          router.replace(targetPath)
          setTimeout(() => setIsRedirecting(false), 2000)
        })
        return
      }

      // Determine target path based on user's actual role
      let targetPath = "/"
      
      if (user.role === "admin" || user.role === "super_admin" || user.role === "manager") {
        targetPath = "/admin"
      } else if (user.role === "teller") {
        targetPath = "/teller"
      } else if (user.role === "customer") {
        targetPath = "/customer"
      }
      
      // Only redirect if we're not already on the target path
      // This prevents redirect loops
      if (currentPath !== targetPath && !currentPath.startsWith(targetPath)) {
        console.log('🔄 [ProtectedRoute] Redirecting to appropriate dashboard:', {
          userRole: user.role,
          currentPath,
          targetPath
        })
        setIsRedirecting(true)
        router.replace(targetPath)
        // Reset redirecting state after a delay (in case redirect fails)
        setTimeout(() => setIsRedirecting(false), 2000)
      }
    }
  }, [isAuthenticated, isLoadingSession, user, allowedRoles, router, refreshUser, hasRefreshed])

  // Show loading state while checking session or redirecting
  if (isLoadingSession || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-muted-foreground">
            {isRedirecting ? 'Redirecting to your dashboard...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">Access Denied</h2>
          <p className="text-gray-600 dark:text-muted-foreground">You need to be logged in to access this page.</p>
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  // If user doesn't have the right role, show access denied (only if redirect hasn't happened yet)
  if (!user || !allowedRoles.includes(user.role)) {
    // Determine the user's dashboard based on their role
    const userDashboard = 
      user?.role === "admin" || user?.role === "super_admin" || user?.role === "manager" ? "/admin" :
      user?.role === "teller" ? "/teller" :
      user?.role === "customer" ? "/customer" : "/"

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center space-y-4 p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">Access Denied</h2>
          <p className="text-gray-600 dark:text-muted-foreground">
            You don't have permission to access this page. Required role: <strong>{allowedRoles.join(' or ')}</strong>.
          </p>
          <p className="text-sm text-gray-500 dark:text-muted-foreground">
            Your current role: <strong>{user?.role || 'Unknown'}</strong>
          </p>
          <div className="flex flex-col gap-3 pt-4">
            {user && (
              <a 
                href={userDashboard}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to My Dashboard
              </a>
            )}
            <a 
              href="/login" 
              className="inline-block px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-foreground rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Login with Different Account
            </a>
          </div>
          {user?.role === 'customer' && (
            <p className="text-xs text-gray-500 dark:text-muted-foreground pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
              💡 To access admin pages, you need to update your role to "admin" in Supabase. See FIX_ADMIN_ACCESS.md for instructions.
            </p>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
