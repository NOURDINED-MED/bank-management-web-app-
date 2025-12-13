"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Shield, ArrowLeft, AlertCircle, Mail, Smartphone } from "lucide-react"
import Link from "next/link"

export default function Verify2FAPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [method, setMethod] = useState<"email" | "sms">("email")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const { verify2FA, user, pending2FA, pendingEmail, logout } = useAuth()
  const router = useRouter()

  // Redirect if not in 2FA flow
  useEffect(() => {
    if (!pending2FA && !user) {
      router.push("/login")
    } else if (user && !pending2FA) {
      // Already authenticated, redirect to dashboard
      if (user.role === "admin") {
        router.push("/admin")
      } else if (user.role === "teller") {
        router.push("/teller")
      } else if (user.role === "customer") {
        router.push("/customer")
      }
    }
  }, [user, pending2FA, router])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value

    setCode(newCode)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit if all digits entered
    if (newCode.every(digit => digit !== "") && index === 5) {
      handleSubmit(newCode.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()
    
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("")
      setCode(newCode)
      inputRefs.current[5]?.focus()
      // Auto-submit
      handleSubmit(pastedData)
    }
  }

  const handleSubmit = async (codeValue?: string) => {
    const verificationCode = codeValue || code.join("")
    
    if (verificationCode.length !== 6) {
      setError("Please enter the complete 6-digit code.")
      return
    }

    setLoading(true)
    setError("")

    const success = await verify2FA(verificationCode)

    if (success) {
      // Will redirect via useEffect
    } else {
      setError("Invalid verification code. Please check and try again.")
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }

    setLoading(false)
  }

  const handleResend = async () => {
    setResendLoading(true)
    // Simulate resending code
    await new Promise(resolve => setTimeout(resolve, 1000))
    setResendLoading(false)
    setError("")
    setCode(["", "", "", "", "", ""])
    inputRefs.current[0]?.focus()
  }

  const handleCancel = () => {
    logout()
    router.push("/login")
  }

  if (!pending2FA) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-2xl relative z-10 border-2">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto bg-gradient-to-br from-orange-500 to-amber-600 w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Two-Factor Authentication</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter the 6-digit code sent to your {method === "email" ? "email" : "phone"}
            </CardDescription>
            {pendingEmail && (
              <p className="text-sm font-medium text-primary mt-2">{pendingEmail}</p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Method toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            <Button
              type="button"
              variant={method === "email" ? "default" : "ghost"}
              className="flex-1 rounded-lg"
              onClick={() => setMethod("email")}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              type="button"
              variant={method === "sms" ? "default" : "ghost"}
              className="flex-1 rounded-lg"
              onClick={() => setMethod("sms")}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              SMS
            </Button>
          </div>

          {/* Code input */}
          <div className="space-y-4">
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={el => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-xl"
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3.5 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={() => handleSubmit()}
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
              disabled={loading || code.some(d => d === "")}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify Code"
              )}
            </Button>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded-xl text-sm">
            <p className="text-blue-900 dark:text-blue-100 mb-2">
              <strong>Demo Code:</strong> Use any 6-digit code (e.g., 123456) for testing.
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-xs">
              In production, this would be a time-limited OTP sent to your device.
            </p>
          </div>

          {/* Resend and cancel */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="link"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm"
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </Button>
            <Button
              variant="link"
              onClick={handleCancel}
              className="text-sm text-destructive"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

