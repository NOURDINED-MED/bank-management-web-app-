"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Settings, 
  Building2, 
  Percent, 
  CreditCard, 
  Bell, 
  Layout,
  Save,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface SettingsData {
  branch: {
    name: string
    address: string
    phone: string
  }
  interestRates: {
    savings: number
    checking: number
  }
  notifications: {
    email: boolean
    sms: boolean
    system: boolean
  }
}

export function SettingsConfiguration() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SettingsData>({
    branch: {
      name: 'Main Branch',
      address: '123 Main St, City, State 12345',
      phone: '(555) 123-4567'
    },
    interestRates: {
      savings: 2.5,
      checking: 0.5
    },
    notifications: {
      email: true,
      sms: false,
      system: true
    }
  })

  // Load settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveBranchInfo = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: settings.branch,
          interestRates: settings.interestRates,
          notifications: settings.notifications
        })
      })

      if (response.ok) {
        toast.success('Branch information updated successfully')
      } else {
        toast.error('Failed to update branch information')
      }
    } catch (error) {
      console.error('Error saving branch info:', error)
      toast.error('Failed to save branch information')
    } finally {
      setSaving(false)
    }
  }

  const saveInterestRates = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: settings.branch,
          interestRates: settings.interestRates,
          notifications: settings.notifications
        })
      })

      if (response.ok) {
        toast.success('Interest rates updated successfully')
      } else {
        toast.error('Failed to update interest rates')
      }
    } catch (error) {
      console.error('Error saving interest rates:', error)
      toast.error('Failed to save interest rates')
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: settings.branch,
          interestRates: settings.interestRates,
          notifications: settings.notifications
        })
      })

      if (response.ok) {
        toast.success('Notification settings updated successfully')
      } else {
        toast.error('Failed to update notification settings')
      }
    } catch (error) {
      console.error('Error saving notifications:', error)
      toast.error('Failed to save notification settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Settings & Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Branch Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            Branch Information
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="branch-name" className="text-gray-700 dark:text-gray-300">Branch Name</Label>
              <Input 
                id="branch-name" 
                value={settings.branch.name}
                onChange={(e) => setSettings({
                  ...settings,
                  branch: { ...settings.branch, name: e.target.value }
                })}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="branch-address" className="text-gray-700 dark:text-gray-300">Address</Label>
              <Input 
                id="branch-address" 
                value={settings.branch.address}
                onChange={(e) => setSettings({
                  ...settings,
                  branch: { ...settings.branch, address: e.target.value }
                })}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="branch-phone" className="text-gray-700 dark:text-gray-300">Phone</Label>
              <Input 
                id="branch-phone" 
                value={settings.branch.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  branch: { ...settings.branch, phone: e.target.value }
                })}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <Button 
              size="sm" 
              onClick={saveBranchInfo}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Update Branch Info
            </Button>
          </div>
        </div>

        {/* Interest Rates */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Percent className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            Interest Rates
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="savings-rate" className="text-gray-700 dark:text-gray-300">Savings Account Rate (%)</Label>
              <Input 
                id="savings-rate" 
                type="number" 
                step="0.1"
                value={settings.interestRates.savings}
                onChange={(e) => setSettings({
                  ...settings,
                  interestRates: { ...settings.interestRates, savings: parseFloat(e.target.value) || 0 }
                })}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="checking-rate" className="text-gray-700 dark:text-gray-300">Checking Account Rate (%)</Label>
              <Input 
                id="checking-rate" 
                type="number" 
                step="0.1"
                value={settings.interestRates.checking}
                onChange={(e) => setSettings({
                  ...settings,
                  interestRates: { ...settings.interestRates, checking: parseFloat(e.target.value) || 0 }
                })}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Interest rates are applied to new accounts and updated accounts</p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={saveInterestRates}
              disabled={saving}
              className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Rates
            </Button>
          </div>
        </div>

        {/* Account Types */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            Account Types
          </h3>
          <div className="space-y-2">
            {["Savings", "Checking", "Business", "Premium"].map((type) => (
              <div 
                key={type} 
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800/50"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{type}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            Notification Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive email alerts for critical events</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notifications.email}
                onChange={(e) => {
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, email: e.target.checked }
                  })
                  saveNotifications()
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">SMS Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive SMS for urgent alerts</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notifications.sms}
                onChange={(e) => {
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, sms: e.target.checked }
                  })
                  saveNotifications()
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">System Alerts</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">In-app system notifications</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notifications.system}
                onChange={(e) => {
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, system: e.target.checked }
                  })
                  saveNotifications()
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Dashboard Layout Customization */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Layout className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            Customize Dashboard Layout
          </h3>
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Dashboard customization coming soon</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">You'll be able to rearrange widgets and customize your dashboard view.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
