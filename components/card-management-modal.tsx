"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Lock, Unlock, AlertTriangle, CreditCard, Shield, Settings } from "lucide-react"

interface CardManagementModalProps {
  isOpen: boolean
  onClose: () => void
  action: 'lock' | 'changePin' | 'setLimits' | 'reportLost' | 'block' | 'deactivate'
  currentStatus: 'active' | 'locked' | 'blocked' | 'deactivated'
  onStatusChange: (newStatus: 'active' | 'locked' | 'blocked' | 'deactivated') => void
}

export function CardManagementModal({
  isOpen,
  onClose,
  action,
  currentStatus,
  onStatusChange
}: CardManagementModalProps) {
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [dailyLimit, setDailyLimit] = useState("")
  const [monthlyLimit, setMonthlyLimit] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLockCard = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newStatus = currentStatus === 'locked' ? 'active' : 'locked'
    onStatusChange(newStatus)
    toast.success(`Card ${newStatus === 'locked' ? 'locked' : 'unlocked'} successfully`)
    setIsLoading(false)
    onClose()
  }

  const handleChangePin = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      toast.error("Please fill in all PIN fields")
      return
    }

    if (newPin !== confirmPin) {
      toast.error("New PIN and confirmation don't match")
      return
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      toast.error("PIN must be 4 digits")
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.success("PIN changed successfully")
    setIsLoading(false)
    setCurrentPin("")
    setNewPin("")
    setConfirmPin("")
    onClose()
  }

  const handleSetLimits = async () => {
    if (!dailyLimit && !monthlyLimit) {
      toast.error("Please set at least one limit")
      return
    }

    const daily = dailyLimit ? parseFloat(dailyLimit) : 0
    const monthly = monthlyLimit ? parseFloat(monthlyLimit) : 0

    if (daily < 0 || monthly < 0) {
      toast.error("Limits cannot be negative")
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success("Spending limits updated successfully")
    setIsLoading(false)
    setDailyLimit("")
    setMonthlyLimit("")
    onClose()
  }

  const handleReportLost = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for reporting the card as lost")
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate new card details
    const newCardNumber = `4532-****-****-${Math.floor(Math.random() * 9000 + 1000)}`
    const newExpiry = `${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}/${String(new Date().getFullYear() + Math.floor(Math.random() * 5 + 1)).slice(-2)}`

    toast.success("Card reported as lost. A new card will be issued within 3-5 business days.")
    toast.info(`New card details will be sent to your registered email address.`)

    setIsLoading(false)
    setReason("")
    onClose()
  }

  const handleBlockCard = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    onStatusChange('blocked')
    toast.error("Card permanently blocked. Contact customer support to issue a replacement card.")
    setIsLoading(false)
    onClose()
  }

  const handleDeactivateCard = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    onStatusChange('deactivated')
    toast.error("Card deactivated. Contact customer support to reactivate or issue a new card.")
    setIsLoading(false)
    onClose()
  }

  const renderContent = () => {
    switch (action) {
      case 'lock':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {currentStatus === 'locked' ? (
                <Unlock className="w-8 h-8 text-green-600" />
              ) : (
                <Lock className="w-8 h-8 text-yellow-600" />
              )}
              <div>
                <h3 className="text-lg font-semibold">
                  {currentStatus === 'locked' ? 'Unlock Card' : 'Lock Card'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentStatus === 'locked'
                    ? 'Restore card functionality for transactions'
                    : 'Temporarily disable card for security'
                  }
                </p>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {currentStatus === 'locked'
                  ? 'Unlocking your card will restore all transaction capabilities.'
                  : 'Locked cards cannot be used for transactions until unlocked.'
                }
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button onClick={handleLockCard} disabled={isLoading} className="flex-1">
                {isLoading ? 'Processing...' : (currentStatus === 'locked' ? 'Unlock Card' : 'Lock Card')}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        )

      case 'changePin':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Change PIN</h3>
                <p className="text-sm text-muted-foreground">Update your card PIN for security</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="currentPin">Current PIN</Label>
                <Input
                  id="currentPin"
                  type="password"
                  placeholder="Enter current PIN"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  maxLength={4}
                />
              </div>
              <div>
                <Label htmlFor="newPin">New PIN</Label>
                <Input
                  id="newPin"
                  type="password"
                  placeholder="Enter new PIN (4 digits)"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength={4}
                />
              </div>
              <div>
                <Label htmlFor="confirmPin">Confirm New PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  placeholder="Confirm new PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                PIN must be 4 digits. Keep your PIN secure and don't share it with anyone.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button onClick={handleChangePin} disabled={isLoading} className="flex-1">
                {isLoading ? 'Updating...' : 'Change PIN'}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        )

      case 'setLimits':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold">Set Spending Limits</h3>
                <p className="text-sm text-muted-foreground">Configure daily and monthly transaction limits</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="dailyLimit">Daily Limit ($)</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  placeholder="e.g., 500"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="monthlyLimit">Monthly Limit ($)</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  placeholder="e.g., 2000"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Setting limits to $0 will block all transactions. Limits apply to all card transactions.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button onClick={handleSetLimits} disabled={isLoading} className="flex-1">
                {isLoading ? 'Updating...' : 'Set Limits'}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        )

      case 'reportLost':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold">Report Lost/Stolen Card</h3>
                <p className="text-sm text-muted-foreground">Immediately disable your card and request replacement</p>
              </div>
            </div>

            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                This action cannot be undone. Your current card will be permanently blocked.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="reason">Reason for reporting</Label>
              <Input
                id="reason"
                placeholder="Brief description (e.g., lost wallet, stolen card)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleReportLost} disabled={isLoading} variant="destructive" className="flex-1">
                {isLoading ? 'Reporting...' : 'Report Card Lost'}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        )

      case 'block':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold">Block Card Permanently</h3>
                <p className="text-sm text-muted-foreground">Irreversibly disable this card</p>
              </div>
            </div>

            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> This action is permanent and cannot be undone.
                You will need to contact customer support to get a replacement card.
              </AlertDescription>
            </Alert>

            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>What happens when you block your card:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>All transactions will be permanently disabled</li>
                    <li>Card cannot be reactivated</li>
                    <li>You must request a replacement card</li>
                    <li>Processing may take 3-5 business days</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={handleBlockCard} disabled={isLoading} variant="destructive" className="flex-1">
                {isLoading ? 'Blocking...' : 'Block Card Permanently'}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        )

      case 'deactivate':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold">Deactivate Card</h3>
                <p className="text-sm text-muted-foreground">Temporarily disable card until reactivation</p>
              </div>
            </div>

            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Deactivated cards can be reactivated by contacting customer support.
                This is different from permanent blocking.
              </AlertDescription>
            </Alert>

            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>What happens when you deactivate your card:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>All transactions will be disabled</li>
                    <li>Card can be reactivated by support</li>
                    <li>No replacement card needed</li>
                    <li>Reactivation typically takes 24-48 hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={handleDeactivateCard} disabled={isLoading} variant="destructive" className="flex-1">
                {isLoading ? 'Deactivating...' : 'Deactivate Card'}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Card Management</DialogTitle>
          <DialogDescription>
            Manage your card security and settings
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
