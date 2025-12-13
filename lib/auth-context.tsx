"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, Customer } from "./types"
import { supabase } from "./supabase-client"
import { signIn, signOut as supabaseSignOut, getCurrentUser } from "./supabase-auth"
import { mockUsers, mockCustomers } from "./mock-data"

interface AuthContextType {
  user: User | Customer | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; requires2FA?: boolean; message?: string }>
  register: (name: string, email: string, phone?: string) => Promise<boolean>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoadingSession: boolean
  verify2FA: (code: string) => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<boolean>
  resetPassword: (token: string, newPassword: string) => Promise<boolean>
  loginWithOAuth: (provider: "google" | "apple") => Promise<boolean>
  refreshUser: () => Promise<void>
  pending2FA: boolean
  pendingEmail: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | Customer | null>(null)
  const [pending2FA, setPending2FA] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [tempUser, setTempUser] = useState<User | Customer | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  useEffect(() => {
    // Check for Supabase session on mount
    const checkSession = async () => {
      try {
        setIsLoadingSession(true)
        // First check if we explicitly logged out (check for a flag)
        const wasLoggedOut = sessionStorage.getItem('was_logged_out')
        if (wasLoggedOut === 'true') {
          sessionStorage.removeItem('was_logged_out')
          // Clear any lingering sessions
          await supabase.auth.signOut()
          setUser(null)
          setIsLoadingSession(false)
          return
        }
        
        // Add timeout to prevent hanging on getSession
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout after 10 seconds')), 10000)
        )
        
        let sessionResult: any
        try {
          sessionResult = await Promise.race([
            sessionPromise,
            timeoutPromise
          ])
        } catch (timeoutError: any) {
          // Timeout occurred - handle gracefully
          if (timeoutError?.message?.includes('timeout')) {
            console.warn('⚠️ Session check timed out, trying cached session with shorter timeout')
            // Try to get cached session with a shorter timeout (2 seconds)
            try {
              const cachedSessionPromise = supabase.auth.getSession()
              const shortTimeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Cached session timeout')), 2000)
              )
              sessionResult = await Promise.race([cachedSessionPromise, shortTimeoutPromise])
            } catch {
              // If fallback also times out, set no session
              console.warn('⚠️ Cached session check also timed out, proceeding without session')
              sessionResult = { data: { session: null }, error: null }
            }
          } else {
            throw timeoutError
          }
        }
        
        const { data: { session }, error: sessionError } = sessionResult || { data: { session: null }, error: null }
        
        // If there's an error or no session, ensure user is null
        if (sessionError || !session?.user) {
          setUser(null)
          setIsLoadingSession(false)
          return
        }
        
        // Only restore session if we have a valid user
        if (session?.user) {
          try {
            // Add timeout wrapper for getCurrentUser to prevent hanging
            const userPromise = getCurrentUser()
            const userTimeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('User fetch timeout after 10 seconds')), 10000)
            )
            
            let userResult: any
            try {
              userResult = await Promise.race([
                userPromise,
                userTimeoutPromise
              ])
            } catch (timeoutError: any) {
              // Timeout occurred - handle gracefully
              if (timeoutError?.message?.includes('timeout')) {
                console.warn('⚠️ User fetch timed out, using session data')
                // Return timeout error so it's handled below
                userResult = { user: null, profile: null, error: 'User fetch timeout after 10 seconds' }
              } else {
                throw timeoutError
              }
            }
            
            const { user, profile, error } = userResult || { user: null, profile: null, error: null }
            
            // Handle network errors gracefully - don't clear user if it's just a network issue
            if (error && (error.includes('Network error') || error.includes('timeout'))) {
              console.warn('⚠️ Network/timeout error checking user profile, using cached session data')
              // Use session data if network fails - check user metadata for role first
              const roleFromMetadata = session.user.user_metadata?.role
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                role: roleFromMetadata || 'customer', // Use metadata role if available, otherwise default
                createdAt: session.user.created_at || new Date().toISOString(),
                status: 'active'
              } as any)
              setIsLoadingSession(false)
              return
            }
            
            if (!error && profile && user) {
              // Prioritize user_metadata.role if it exists (more reliable for admin/teller)
              // Only fall back to profile.role if metadata doesn't have a role
              const detectedRole = user.user_metadata?.role || profile.role || 'customer'
              // Debug logging for role detection
              console.log('🔍 [auth-context] Role detection (profile fetch):', {
                profileRole: profile.role,
                metadataRole: user.user_metadata?.role,
                finalRole: detectedRole,
                priority: user.user_metadata?.role ? 'metadata' : 'profile',
                userId: user.id,
                email: user.email
              })
              setUser({
                id: user.id,
                email: user.email || profile.email || '',
                name: profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                role: detectedRole, // Prioritize metadata role
                createdAt: user.created_at || new Date().toISOString(),
                status: profile.status || 'active'
              } as any)
            } else if (!error && user && !profile) {
              // User exists but profile doesn't - use session data with metadata role
              const roleFromMetadata = user.user_metadata?.role
              setUser({
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                role: roleFromMetadata || 'customer', // Use metadata role if available
                createdAt: user.created_at || new Date().toISOString(),
                status: 'active'
              } as any)
            } else {
              // If there's a real error (not network), clear user
              setUser(null)
            }
          } catch (profileError: any) {
            console.warn('Error fetching profile:', profileError)
            // On error, try to use session data if available - check metadata for role
            if (session?.user) {
              const roleFromMetadata = session.user.user_metadata?.role
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                role: roleFromMetadata || 'customer', // Use metadata role if available
                createdAt: session.user.created_at || new Date().toISOString(),
                status: 'active'
              } as any)
            } else {
              setUser(null)
            }
          }
        }
      } catch (error: any) {
        console.error('Error checking session:', error)
        // Don't clear user on network/timeout errors - might be temporary
        if (error.message?.includes('Failed to fetch') || 
            error.message?.includes('network') ||
            error.message?.includes('timeout') ||
            error.message?.includes('Timeout')) {
          console.warn('⚠️ Network/timeout error during session check - app will continue with cached data')
          // Try to use any cached session data if available - check metadata for role
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
              const roleFromMetadata = session.user.user_metadata?.role
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                role: roleFromMetadata || 'customer', // Use metadata role if available
                createdAt: session.user.created_at || new Date().toISOString(),
                status: 'active'
              } as any)
            }
          } catch {
            // Ignore errors in fallback
          }
        } else {
          setUser(null)
        }
      } finally {
        setIsLoadingSession(false)
      }
    }
    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email)
      
      // Check if user explicitly logged out
      const wasLoggedOut = sessionStorage.getItem('was_logged_out')
      if (wasLoggedOut === 'true') {
        console.log('🚫 Ignoring auth state change - user logged out')
        setUser(null)
        setPending2FA(false)
        setTempUser(null)
        setPendingEmail("")
        return
      }
      
      // On SIGNED_OUT event, clear everything
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        setPending2FA(false)
        setTempUser(null)
        setPendingEmail("")
        return
      }
      
      // On SIGNED_IN or TOKEN_REFRESHED, update user (only if not logged out)
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        // Double-check logout flag
        const stillLoggedOut = sessionStorage.getItem('was_logged_out')
        if (stillLoggedOut === 'true') {
          console.log('🚫 Ignoring session restore - user logged out')
          setUser(null)
          return
        }
        
        try {
          // Add timeout to prevent hanging
          const userPromise = getCurrentUser()
          const userTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('User fetch timeout')), 10000)
          )
          
          let userResult: any
          try {
            userResult = await Promise.race([
              userPromise,
              userTimeoutPromise
            ])
          } catch (timeoutError: any) {
            // Timeout occurred - handle gracefully
            if (timeoutError?.message?.includes('timeout')) {
              console.warn('⚠️ User fetch timed out during auth state change, using session data')
              // Return timeout error so it's handled below
              userResult = { user: null, profile: null, error: 'User fetch timeout' }
            } else {
              throw timeoutError
            }
          }
          
          const { user, profile, error } = userResult || { user: null, profile: null, error: null }
          
        if (!error && profile && user) {
          // Prioritize user_metadata.role if it exists (more reliable for admin/teller)
          // Only fall back to profile.role if metadata doesn't have a role
          const detectedRole = user.user_metadata?.role || profile.role || 'customer'
          // Debug logging for role detection
          console.log('🔍 [auth-context] Role detection (auth state change):', {
            profileRole: profile.role,
            metadataRole: user.user_metadata?.role,
            finalRole: detectedRole,
            priority: user.user_metadata?.role ? 'metadata' : 'profile',
            userId: user.id,
            email: user.email
          })
          setUser({
            id: user.id,
            email: user.email || profile.email || '',
            name: profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: detectedRole, // Prioritize metadata role
            createdAt: user.created_at || new Date().toISOString(),
            status: profile.status || 'active'
          } as any)
          } else if (error && (error.includes('timeout') || error.includes('Network error'))) {
            // Use session data on timeout/network error - check metadata for role
            const roleFromMetadata = session.user.user_metadata?.role
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              role: roleFromMetadata || 'customer', // Use metadata role if available
              createdAt: session.user.created_at || new Date().toISOString(),
              status: 'active'
            } as any)
          } else {
            setUser(null)
          }
        } catch (err: any) {
          // On timeout/error, use session data as fallback - check metadata for role
          if (err.message?.includes('timeout') || err.message?.includes('Timeout')) {
            const roleFromMetadata = session.user.user_metadata?.role
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              role: roleFromMetadata || 'customer', // Use metadata role if available
              createdAt: session.user.created_at || new Date().toISOString(),
              status: 'active'
            } as any)
        } else {
          setUser(null)
          }
        }
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (
    email: string, 
    password: string, 
    rememberMe: boolean = false
  ): Promise<{ success: boolean; requires2FA?: boolean; message?: string }> => {
    try {
      console.log('🔵 [auth-context] Starting login for:', email)
      // Use real Supabase authentication
      const { data, error } = await signIn({ email, password })
      console.log('🔵 [auth-context] SignIn response:', { hasData: !!data, hasError: !!error, error })

      if (error) {
        console.log('🔴 [auth-context] SignIn error:', error)
        
        // Provide more specific error messages
        let errorMessage = error
        if (error.includes('Invalid login credentials') || error.includes('Invalid credentials')) {
          errorMessage = "Invalid email or password. If you don't have an account, please create one first."
        } else if (error.includes('Supabase')) {
          errorMessage = "Unable to connect to the server. Please check your internet connection and try again."
        }
        
        return { 
          success: false, 
          message: errorMessage
        }
      }

      if (!data?.user) {
        console.log('🔴 [auth-context] No user in response')
        return { 
          success: false, 
          message: "Failed to sign in. Please try again." 
        }
      }
      
      // Set user immediately with metadata/defaults - don't wait for profile
      // IMPORTANT: Check user_metadata.role first to preserve teller/admin roles
      const roleFromMetadata = data.user.user_metadata?.role
      const baseUser = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        role: (roleFromMetadata || 'customer') as any, // Preserve role from metadata
        createdAt: data.user.created_at || new Date().toISOString(),
        status: 'active' as const
      }
      
      // Set user immediately so login completes fast
      setUser(baseUser as any)
      
      // Fetch profile in background (non-blocking) - use shorter timeout
      Promise.race([
        supabase
          .from('users')
          .select('role, full_name, status')
          .eq('id', data.user.id)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 800)
        )
      ]).then((result: any) => {
        const { data: profile, error: profileError } = result
        if (!profileError && profile) {
          // Update user with profile data if available
          setUser({
            ...baseUser,
            role: profile.role || baseUser.role,
            name: profile.full_name || baseUser.name,
            status: profile.status || baseUser.status
          } as any)
        }
      }).catch(() => {
        // Silently fail - user is already set with metadata/defaults
      })
      
      // Return success immediately - don't wait for profile
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle network errors specifically
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('network') ||
          error.name === 'TypeError' && error.message?.includes('fetch')) {
        return {
          success: false,
          message: 'Cannot connect to server. Please check your internet connection and Supabase configuration. Make sure your .env.local file has the correct NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
        }
      }
      
      return { 
        success: false, 
        message: error.message || "An error occurred during sign in. Please try again." 
      }
    }
  }

  const register = async (name: string, email: string, phone?: string, password?: string): Promise<boolean> => {
    // Registration is now handled by the /api/auth/signup route
    // This function is kept for backward compatibility but redirects to signup page
    // The actual registration happens in the signup page using the API route
    return false
  }

  const verify2FA = async (code: string): Promise<boolean> => {
    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // For demo purposes, accept any 6-digit code
    if (code.length === 6 && tempUser) {
      setUser(tempUser)
      localStorage.setItem("financeapp_user", JSON.stringify(tempUser))
      localStorage.setItem("financeapp_remember", "true")
      setPending2FA(false)
      setTempUser(null)
      setPendingEmail("")
      return true
    }
    
    return false
  }

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    // Simulate password reset request
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Check if email exists
    const userExists = mockUsers.find(u => u.email === email) || mockCustomers.find(c => c.email === email)
    return !!userExists
  }

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    // Simulate password reset
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // For demo purposes, always return true
    return true
  }

  const loginWithOAuth = async (provider: "google" | "apple"): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('OAuth error:', error)
        return false
      }

      // OAuth redirect will happen, so we return true
      // The callback will handle setting the user
      return true
    } catch (error: any) {
      console.error('OAuth login error:', error)
      return false
    }
  }

  const refreshUser = async () => {
    try {
      console.log('🔄 [auth-context] Refreshing user data...')
      const { user: authUser, profile, error } = await getCurrentUser()
      
      if (error || !authUser) {
        console.warn('Failed to refresh user:', error)
        return
      }

      if (profile) {
        const detectedRole = authUser.user_metadata?.role || profile.role || 'customer'
        console.log('✅ [auth-context] User refreshed with role:', detectedRole)
        setUser({
          id: authUser.id,
          email: authUser.email || profile.email || '',
          name: profile.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: detectedRole,
          createdAt: authUser.created_at || new Date().toISOString(),
          status: profile.status || 'active'
        } as any)
      } else if (authUser) {
        const roleFromMetadata = authUser.user_metadata?.role || 'customer'
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: roleFromMetadata,
          createdAt: authUser.created_at || new Date().toISOString(),
          status: 'active'
        } as any)
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error)
    }
  }

  const logout = async () => {
    try {
      // Set logout flag FIRST to prevent session restoration
      sessionStorage.setItem('was_logged_out', 'true')
      
      // Clear all auth state immediately (synchronous - fast)
      setUser(null)
      setPending2FA(false)
      setTempUser(null)
      setPendingEmail("")
      
      // Clear all localStorage items related to auth (synchronous - fast)
      localStorage.removeItem("financeapp_user")
      localStorage.removeItem("financeapp_remember")
      sessionStorage.removeItem("financeapp_user")
      
      // Clear all supabase-related localStorage keys (synchronous - fast)
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Clear all supabase-related sessionStorage keys (synchronous - fast)
      const sessionKeysToRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          sessionKeysToRemove.push(key)
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))
      
      // Clear Supabase session in background (non-blocking - don't wait)
      supabaseSignOut().catch(() => {})
      supabase.auth.signOut().catch(() => {})
      
      // Return success immediately - don't wait for Supabase
      return
    } catch (error) {
      // Even if there's an error, clear local state
      setUser(null)
      setPending2FA(false)
      setTempUser(null)
      setPendingEmail("")
      sessionStorage.setItem('was_logged_out', 'true')
      localStorage.removeItem("financeapp_user")
      return
      localStorage.removeItem("financeapp_remember")
      sessionStorage.removeItem("financeapp_user")
      
      // Try to clear Supabase session in background (non-blocking)
      supabase.auth.signOut().catch(() => {})
      
      return // Return void - state is cleared
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        register, 
        logout, 
        isAuthenticated: !!user,
        isLoadingSession,
        verify2FA,
        requestPasswordReset,
        resetPassword,
        loginWithOAuth,
        refreshUser,
        pending2FA,
        pendingEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

