"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Building2, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  Moon, 
  Sun,
  Shield,
  AlertCircle,
  ArrowLeft,
  Check,
  X,
  MapPin,
  Calendar,
  Briefcase,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Globe,
  DollarSign,
  FileText,
  Upload,
  UserCheck,
  Users,
  HelpCircle,
  Bell,
  Settings,
  ShieldCheck
} from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslation } from "react-i18next"
import { LanguageSwitcher } from "@/components/language-switcher"
import Link from "next/link"
import { supabase } from "@/lib/supabase-client"

export default function SignupPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation('common')

  // Multi-step form state
  const [step, setStep] = useState(1)
  const totalSteps = 5

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Account Type
    accountType: 'personal', // personal or business
    
    // Step 2: Personal Info
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Step 3: Address & Security
    address: '',
    city: '',
    state: '',
    zipCode: '',
    password: '',
    confirmPassword: '',
    
    // Business fields (if business account)
    businessName: '',
    businessType: '',
    taxId: '',
    
    // Step 4: KYC & Employment
    ssnLast4: '',
    citizenship: 'US',
    employmentStatus: 'employed',
    employer: '',
    occupation: '',
    annualIncome: '',
    sourceOfFunds: 'salary',
    
    // Emergency Contact
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    
    // Step 5: Document Upload
    idFrontFile: null as File | null,
    idBackFile: null as File | null,
    proofOfAddressFile: null as File | null,
    
    // Security Questions
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: '',
    
    // Preferences
    preferredLanguage: 'en',
    receiveEmailNotifications: true,
    receiveSmsNotifications: true,
    enableTwoFactor: false,
    
    // Agreements
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false
  })

  // UI State
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState('')

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0)
      setPasswordFeedback('')
      return
    }

    let strength = 0
    const feedback: string[] = []

    // Length check
    if (formData.password.length >= 8) strength += 20
    else feedback.push('At least 8 characters')

    if (formData.password.length >= 12) strength += 10

    // Uppercase check
    if (/[A-Z]/.test(formData.password)) strength += 20
    else feedback.push('One uppercase letter')

    // Lowercase check
    if (/[a-z]/.test(formData.password)) strength += 20
    else feedback.push('One lowercase letter')

    // Number check
    if (/[0-9]/.test(formData.password)) strength += 15
    else feedback.push('One number')

    // Special character check
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 15
    else feedback.push('One special character')

    setPasswordStrength(strength)
    setPasswordFeedback(feedback.join(', '))
  }, [formData.password])

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500'
    if (passwordStrength < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Weak'
    if (passwordStrength < 70) return 'Medium'
    return 'Strong'
  }

  // Validation functions
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.accountType) {
      newErrors.accountType = 'Please select an account type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    } else {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old'
      }
    }

    // Business-specific validation
    if (formData.accountType === 'business') {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required'
      }
      if (!formData.businessType.trim()) {
        newErrors.businessType = 'Business type is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code format'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (passwordStrength < 70) {
      newErrors.password = 'Password is too weak. Use a stronger password.'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions'
    }

    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = 'You must agree to the privacy policy'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.ssnLast4) {
      newErrors.ssnLast4 = 'Last 4 digits of SSN are required'
    } else if (!/^\d{4}$/.test(formData.ssnLast4)) {
      newErrors.ssnLast4 = 'Must be exactly 4 digits'
    }

    if (!formData.citizenship.trim()) {
      newErrors.citizenship = 'Citizenship is required'
    }

    if (!formData.employmentStatus) {
      newErrors.employmentStatus = 'Employment status is required'
    }

    if (formData.employmentStatus === 'employed') {
      if (!formData.employer.trim()) {
        newErrors.employer = 'Employer name is required'
      }
      if (!formData.occupation.trim()) {
        newErrors.occupation = 'Occupation is required'
      }
    }

    if (!formData.annualIncome) {
      newErrors.annualIncome = 'Annual income is required'
    }

    if (!formData.emergencyName.trim()) {
      newErrors.emergencyName = 'Emergency contact name is required'
    }

    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Emergency phone is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep5 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.securityQuestion1 || !formData.securityAnswer1) {
      newErrors.securityQuestion1 = 'Please set up security questions'
    }

    if (!formData.securityQuestion2 || !formData.securityAnswer2) {
      newErrors.securityQuestion2 = 'Please set up second security question'
    }

    // Document upload is optional but recommended
    // Can add validation here if you want to make it required

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    let isValid = false

    if (step === 1) isValid = validateStep1()
    else if (step === 2) isValid = validateStep2()
    else if (step === 3) isValid = validateStep3()
    else if (step === 4) isValid = validateStep4()
    
    if (isValid && step < totalSteps) {
      setStep(step + 1)
      setErrors({})
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      setErrors({})
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep5()) return

    setLoading(true)
    setErrors({})

    try {
      // Use server-side API route to handle signup (bypasses RLS)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          dateOfBirth: formData.dateOfBirth,
          accountType: formData.accountType,
          businessName: formData.businessName,
          // KYC fields
          ssnLast4: formData.ssnLast4,
          citizenship: formData.citizenship,
          employmentStatus: formData.employmentStatus,
          employer: formData.employer,
          occupation: formData.occupation,
          annualIncome: formData.annualIncome,
          sourceOfFunds: formData.sourceOfFunds,
          emergencyName: formData.emergencyName,
          emergencyRelationship: formData.emergencyRelationship,
          emergencyPhone: formData.emergencyPhone
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to create account')
      }

      const userId = data.user?.id
      
      console.log('Account created successfully:', data)

      // Upload documents if provided (after account is created)
      if (userId) {
        const uploadPromises = []
        
        if (formData.idFrontFile) {
          const formDataUpload = new FormData()
          formDataUpload.append('file', formData.idFrontFile)
          formDataUpload.append('userId', userId)
          formDataUpload.append('documentType', 'idFront')
          
          uploadPromises.push(
            fetch('/api/upload-document', {
              method: 'POST',
              body: formDataUpload
            }).catch(err => {
              console.error('Error uploading ID front:', err)
            })
          )
        }

        if (formData.idBackFile) {
          const formDataUpload = new FormData()
          formDataUpload.append('file', formData.idBackFile)
          formDataUpload.append('userId', userId)
          formDataUpload.append('documentType', 'idBack')
          
          uploadPromises.push(
            fetch('/api/upload-document', {
              method: 'POST',
              body: formDataUpload
            }).catch(err => {
              console.error('Error uploading ID back:', err)
            })
          )
        }

        if (formData.proofOfAddressFile) {
          const formDataUpload = new FormData()
          formDataUpload.append('file', formData.proofOfAddressFile)
          formDataUpload.append('userId', userId)
          formDataUpload.append('documentType', 'proofOfAddress')
          
          uploadPromises.push(
            fetch('/api/upload-document', {
              method: 'POST',
              body: formDataUpload
            }).catch(err => {
              console.error('Error uploading proof of address:', err)
            })
          )
        }

        // Upload documents in parallel (don't wait for them to complete)
        Promise.all(uploadPromises).catch(err => {
          console.error('Some document uploads failed:', err)
        })
      }

      // Success! Auto-login the user and redirect immediately
      // Sign in immediately after signup (email is already confirmed)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) {
        // If auto-login fails, redirect to login page
        console.error('Auto-login error:', signInError)
        router.push('/login?registered=true&email=' + encodeURIComponent(formData.email))
      } else {
        // Successfully logged in - redirect immediately (auth context will update automatically)
        router.push('/customer')
      }

    } catch (error: any) {
      console.error('Signup error:', error)
      setErrors({ 
        submit: error.message || 'Registration failed. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignup = async (provider: 'google' | 'apple') => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error: any) {
      console.error('OAuth error:', error)
      setErrors({ submit: 'OAuth signup failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-2xl relative shadow-2xl">
        {/* Header */}
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/landing">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-base">
                Join us today and manage your finances with ease
              </CardDescription>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
            
            <div className="flex justify-between pt-2 text-xs">
              <div className={`flex items-center gap-1 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                {step > 1 ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                <span className="font-medium hidden sm:inline">Account</span>
              </div>
              <div className={`flex items-center gap-1 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                {step > 2 ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                <span className="font-medium hidden sm:inline">Personal</span>
              </div>
              <div className={`flex items-center gap-1 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                {step > 3 ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                <span className="font-medium hidden sm:inline">Address</span>
              </div>
              <div className={`flex items-center gap-1 ${step >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
                {step > 4 ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                <span className="font-medium hidden sm:inline">KYC</span>
              </div>
              <div className={`flex items-center gap-1 ${step >= 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className="w-3 h-3 rounded-full border-2 border-current" />
                <span className="font-medium hidden sm:inline">Verify</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Account Type */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    Choose Your Account Type
                  </Label>
                  <RadioGroup
                    value={formData.accountType}
                    onValueChange={(value) => updateFormData('accountType', value)}
                    className="grid gap-4"
                  >
                    <Label
                      htmlFor="personal"
                      className={`flex items-start gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        formData.accountType === 'personal'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <RadioGroupItem value="personal" id="personal" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">Personal Account</p>
                            <p className="text-sm text-muted-foreground">For individual banking needs</p>
                          </div>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-13">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Free checking & savings accounts
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Debit & credit cards
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Mobile banking & budgeting tools
                          </li>
                        </ul>
                      </div>
                    </Label>

                    <Label
                      htmlFor="business"
                      className={`flex items-start gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        formData.accountType === 'business'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <RadioGroupItem value="business" id="business" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">Business Account</p>
                            <p className="text-sm text-muted-foreground">For businesses and entrepreneurs</p>
                          </div>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-13">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Business checking with unlimited transactions
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Merchant services & payroll
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Business loans & credit lines
                          </li>
                        </ul>
                      </div>
                    </Label>
                  </RadioGroup>
                  {errors.accountType && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.accountType}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* STEP 2: Personal Information */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => updateFormData('fullName', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                </div>

                {/* Business-specific fields */}
                {formData.accountType === 'business' && (
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="businessName"
                          placeholder="Acme Corporation"
                          value={formData.businessName}
                          onChange={(e) => updateFormData('businessName', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.businessName && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.businessName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Input
                        id="businessType"
                        placeholder="LLC, Corporation, etc."
                        value={formData.businessType}
                        onChange={(e) => updateFormData('businessType', e.target.value)}
                      />
                      {errors.businessType && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.businessType}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / EIN (Optional)</Label>
                      <Input
                        id="taxId"
                        placeholder="XX-XXXXXXX"
                        value={formData.taxId}
                        onChange={(e) => updateFormData('taxId', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Address & Security */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="123 Main Street"
                        value={formData.address}
                        onChange={(e) => updateFormData('address', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.address && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                      />
                      {errors.city && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={formData.state}
                        onChange={(e) => updateFormData('state', e.target.value)}
                      />
                      {errors.state && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.state}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={(e) => updateFormData('zipCode', e.target.value)}
                      />
                      {errors.zipCode && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress value={passwordStrength} className={`h-2 ${getPasswordStrengthColor()}`} />
                          <span className={`text-xs font-medium ${
                            passwordStrength < 40 ? 'text-red-600' :
                            passwordStrength < 70 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        {passwordFeedback && (
                          <p className="text-xs text-muted-foreground">
                            Add: {passwordFeedback}
                          </p>
                        )}
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-green-600 text-sm flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Passwords match
                      </p>
                    )}
                    {errors.confirmPassword && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms and agreements */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => updateFormData('agreeTerms', checked)}
                    />
                    <Label htmlFor="agreeTerms" className="text-sm cursor-pointer leading-relaxed">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms and Conditions
                      </Link>
                      {' '}*
                    </Label>
                  </div>
                  {errors.agreeTerms && (
                    <p className="text-red-600 text-sm flex items-center gap-1 ml-7">
                      <AlertCircle className="w-3 h-3" />
                      {errors.agreeTerms}
                    </p>
                  )}

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onCheckedChange={(checked) => updateFormData('agreePrivacy', checked)}
                    />
                    <Label htmlFor="agreePrivacy" className="text-sm cursor-pointer leading-relaxed">
                      I agree to the{' '}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      {' '}*
                    </Label>
                  </div>
                  {errors.agreePrivacy && (
                    <p className="text-red-600 text-sm flex items-center gap-1 ml-7">
                      <AlertCircle className="w-3 h-3" />
                      {errors.agreePrivacy}
                    </p>
                  )}

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agreeMarketing"
                      checked={formData.agreeMarketing}
                      onCheckedChange={(checked) => updateFormData('agreeMarketing', checked)}
                    />
                    <Label htmlFor="agreeMarketing" className="text-sm cursor-pointer leading-relaxed">
                      I want to receive promotional emails and updates (optional)
                    </Label>
                  </div>
                </div>

                {/* Security note */}
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-orange-900 dark:text-orange-200">
                        Security Note
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                        Never share your login credentials with anyone. Our staff will never ask for your password.
                      </p>
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-900 dark:text-red-200">{errors.submit}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1"
                    disabled={loading}
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: KYC & Employment Information */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-5">
                <div className="space-y-4">
                  {/* SSN & Citizenship */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ssnLast4">Last 4 Digits of SSN *</Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="ssnLast4"
                          type="text"
                          maxLength={4}
                          placeholder="1234"
                          value={formData.ssnLast4}
                          onChange={(e) => updateFormData('ssnLast4', e.target.value.replace(/\D/g, ''))}
                          className="pl-10"
                        />
                      </div>
                      {errors.ssnLast4 && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.ssnLast4}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="citizenship">Citizenship *</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <select
                          id="citizenship"
                          value={formData.citizenship}
                          onChange={(e) => updateFormData('citizenship', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                          <option value="FR">France</option>
                          <option value="DE">Germany</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Employment Status */}
                  <div className="space-y-2">
                    <Label>Employment Status *</Label>
                    <RadioGroup
                      value={formData.employmentStatus}
                      onValueChange={(value) => updateFormData('employmentStatus', value)}
                      className="grid grid-cols-2 md:grid-cols-4 gap-3"
                    >
                      {['employed', 'self-employed', 'unemployed', 'retired'].map((status) => (
                        <Label
                          key={status}
                          htmlFor={status}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.employmentStatus === status
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <RadioGroupItem value={status} id={status} />
                          <span className="text-sm font-medium capitalize">{status}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Employment Details */}
                  {(formData.employmentStatus === 'employed' || formData.employmentStatus === 'self-employed') && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employer">
                          {formData.employmentStatus === 'self-employed' ? 'Business Name' : 'Employer Name'} *
                        </Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="employer"
                            placeholder="Acme Corporation"
                            value={formData.employer}
                            onChange={(e) => updateFormData('employer', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        {errors.employer && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.employer}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation *</Label>
                        <Input
                          id="occupation"
                          placeholder="Software Engineer"
                          value={formData.occupation}
                          onChange={(e) => updateFormData('occupation', e.target.value)}
                        />
                        {errors.occupation && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.occupation}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Income & Source of Funds */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="annualIncome">Annual Income *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <select
                          id="annualIncome"
                          value={formData.annualIncome}
                          onChange={(e) => updateFormData('annualIncome', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select range</option>
                          <option value="0-25000">$0 - $25,000</option>
                          <option value="25000-50000">$25,000 - $50,000</option>
                          <option value="50000-100000">$50,000 - $100,000</option>
                          <option value="100000-250000">$100,000 - $250,000</option>
                          <option value="250000+">$250,000+</option>
                        </select>
                      </div>
                      {errors.annualIncome && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.annualIncome}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sourceOfFunds">Source of Funds *</Label>
                      <select
                        id="sourceOfFunds"
                        value={formData.sourceOfFunds}
                        onChange={(e) => updateFormData('sourceOfFunds', e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="salary">Salary/Employment</option>
                        <option value="business">Business Income</option>
                        <option value="investment">Investment Returns</option>
                        <option value="inheritance">Inheritance</option>
                        <option value="savings">Savings</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-primary" />
                      Emergency Contact
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName">Full Name *</Label>
                        <Input
                          id="emergencyName"
                          placeholder="Jane Doe"
                          value={formData.emergencyName}
                          onChange={(e) => updateFormData('emergencyName', e.target.value)}
                        />
                        {errors.emergencyName && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.emergencyName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyRelationship">Relationship *</Label>
                        <select
                          id="emergencyRelationship"
                          value={formData.emergencyRelationship}
                          onChange={(e) => updateFormData('emergencyRelationship', e.target.value)}
                          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select</option>
                          <option value="spouse">Spouse</option>
                          <option value="parent">Parent</option>
                          <option value="sibling">Sibling</option>
                          <option value="child">Child</option>
                          <option value="friend">Friend</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="emergencyPhone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.emergencyPhone}
                            onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        {errors.emergencyPhone && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.emergencyPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: Document Upload & Security */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
                {/* Security Questions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    Security Questions
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="securityQuestion1">Security Question 1 *</Label>
                      <select
                        id="securityQuestion1"
                        value={formData.securityQuestion1}
                        onChange={(e) => updateFormData('securityQuestion1', e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select a question</option>
                        <option value="pet">What is your first pet's name?</option>
                        <option value="city">In what city were you born?</option>
                        <option value="school">What is the name of your first school?</option>
                        <option value="teacher">What is your favorite teacher's name?</option>
                        <option value="food">What is your favorite food?</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="securityAnswer1">Answer *</Label>
                      <Input
                        id="securityAnswer1"
                        placeholder="Your answer"
                        value={formData.securityAnswer1}
                        onChange={(e) => updateFormData('securityAnswer1', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="securityQuestion2">Security Question 2 *</Label>
                      <select
                        id="securityQuestion2"
                        value={formData.securityQuestion2}
                        onChange={(e) => updateFormData('securityQuestion2', e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select a question</option>
                        <option value="movie">What is your favorite movie?</option>
                        <option value="book">What is your favorite book?</option>
                        <option value="color">What is your favorite color?</option>
                        <option value="childhood">What is your childhood nickname?</option>
                        <option value="car">What was your first car?</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="securityAnswer2">Answer *</Label>
                      <Input
                        id="securityAnswer2"
                        placeholder="Your answer"
                        value={formData.securityAnswer2}
                        onChange={(e) => updateFormData('securityAnswer2', e.target.value)}
                      />
                    </div>

                    {errors.securityQuestion1 && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.securityQuestion1}
                      </p>
                    )}
                  </div>
                </div>

                {/* Document Upload */}
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Document Upload (Optional)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload documents now or later in your account settings
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="idFront">Government ID (Front)</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, PDF (max. 5MB)
                        </p>
                        <input
                          id="idFront"
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) updateFormData('idFrontFile', file)
                          }}
                        />
                        {formData.idFrontFile && (
                          <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" />
                            {formData.idFrontFile.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ID Back (Optional)</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                          <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Click to upload</p>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) updateFormData('idBackFile', file)
                            }}
                          />
                          {formData.idBackFile && (
                            <p className="text-xs text-green-600 mt-1 truncate">
                              {formData.idBackFile.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Proof of Address (Optional)</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                          <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Click to upload</p>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) updateFormData('proofOfAddressFile', file)
                            }}
                          />
                          {formData.proofOfAddressFile && (
                            <p className="text-xs text-green-600 mt-1 truncate">
                              {formData.proofOfAddressFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Preferences */}
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Account Preferences
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Email Notifications</p>
                          <p className="text-xs text-muted-foreground">Receive account updates via email</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={formData.receiveEmailNotifications}
                        onCheckedChange={(checked) => updateFormData('receiveEmailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">SMS Notifications</p>
                          <p className="text-xs text-muted-foreground">Receive alerts via text message</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={formData.receiveSmsNotifications}
                        onCheckedChange={(checked) => updateFormData('receiveSmsNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Two-Factor Authentication</p>
                          <p className="text-xs text-muted-foreground">Add extra security layer (recommended)</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={formData.enableTwoFactor}
                        onCheckedChange={(checked) => updateFormData('enableTwoFactor', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredLanguage">Preferred Language</Label>
                      <select
                        id="preferredLanguage"
                        value={formData.preferredLanguage}
                        onChange={(e) => updateFormData('preferredLanguage', e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Security Note */}
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-green-900 dark:text-green-200">
                        Almost Done!
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Your information is encrypted and secure. Click "Create Account" to complete your registration.
                      </p>
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-900 dark:text-red-200">{errors.submit}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-blue-600"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* OAuth options - Show on all steps */}
            {step === 1 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      OR CONTINUE WITH
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignup('google')}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignup('apple')}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Apple
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Sign in link */}
          <div className="text-center pt-6 border-t mt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

