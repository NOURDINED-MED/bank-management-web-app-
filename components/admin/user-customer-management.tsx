"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Lock, 
  Unlock, 
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCcw
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import type { Customer } from "@/lib/types"

interface UserCustomerManagementProps {
  customers: Customer[]
  onUpdateCustomer?: (customer: Customer) => void
}

interface Teller {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  createdAt: string
}

export function UserCustomerManagement({ customers, onUpdateCustomer }: UserCustomerManagementProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "frozen" | "flagged">("all")
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [tellers, setTellers] = useState<Teller[]>([])
  const [loadingTellers, setLoadingTellers] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active" as "active" | "inactive" | "frozen",
    kycStatus: "pending" as "pending" | "verified" | "rejected"
  })

  // Fetch tellers
  useEffect(() => {
    if (user?.id) {
      fetchTellers()
    }
  }, [user?.id])

  const fetchTellers = async () => {
    if (!user?.id) return
    
    setLoadingTellers(true)
    try {
      const response = await fetch(`/api/admin/users?userId=${user.id}`)
      const data = await response.json()
      
      if (data.error) throw new Error(data.error)
      
      // Filter to only tellers
      const tellersList = (data.users || []).filter((u: any) => u.role === 'teller')
      setTellers(tellersList)
    } catch (error) {
      console.error('Error fetching tellers:', error)
      setTellers([])
    } finally {
      setLoadingTellers(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      statusFilter === "all" || 
      customer.status === statusFilter ||
      (statusFilter === "flagged" && customer.kycStatus !== "verified")

    return matchesSearch && matchesStatus
  })

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer)
    setEditFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: (customer as any).phone || "",
      status: (customer.status as "active" | "inactive" | "frozen") || "active",
      kycStatus: (customer.kycStatus as "pending" | "verified" | "rejected") || "pending"
    })
    setShowEditDialog(true)
  }

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer || !user?.id) return

    setUpdating(true)
    try {
      const response = await fetch('/api/admin/update-customer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: user.id,
          customerId: editingCustomer.id,
          name: editFormData.name.trim(),
          email: editFormData.email.trim().toLowerCase(),
          phone: editFormData.phone.trim() || null,
          status: editFormData.status,
          kycStatus: editFormData.kycStatus
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update customer')
      }

      toast.success('Customer updated successfully')
      setShowEditDialog(false)
      setEditingCustomer(null)
      
      // Notify parent to refresh
      if (onUpdateCustomer && data.customer) {
        onUpdateCustomer(data.customer)
      }
    } catch (error: any) {
      console.error('Error updating customer:', error)
      toast.error(error.message || 'Failed to update customer')
    } finally {
      setUpdating(false)
    }
  }

  const handleCloseEditDialog = () => {
    if (!updating) {
      setShowEditDialog(false)
      setEditingCustomer(null)
    }
  }

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            User & Customer Management
          </CardTitle>
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="tellers">Tellers/Staff</TabsTrigger>
            <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
            <TabsTrigger value="documents">Document Queue</TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                <Input
                  placeholder="Search by name, account, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="frozen">Frozen</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>

            {/* Customer List */}
            <div className="border border-gray-200 dark:border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-secondary">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Customer</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Account</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Balance</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">KYC</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-t border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent">
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-foreground">{customer.name}</p>
                          <p className="text-xs text-gray-500 dark:text-muted-foreground">{customer.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm text-gray-900 dark:text-foreground">{customer.accountNumber}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-gray-900 dark:text-foreground">${customer.balance.toLocaleString()}</span>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={customer.status === "active" ? "default" : "secondary"}
                          className={(customer.status as string) === "frozen" ? "bg-red-500 dark:bg-red-600" : ""}
                        >
                          {customer.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={customer.kycStatus === "verified" ? "default" : "secondary"}
                          className={customer.kycStatus === "verified" ? "bg-green-500 dark:bg-green-600" : "bg-yellow-500 dark:bg-yellow-600"}
                        >
                          {customer.kycStatus || "Pending"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(customer)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {customer.status === "active" ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 dark:text-red-400"
                              onClick={async () => {
                                if (!user?.id) return
                                try {
                                  const response = await fetch('/api/admin/update-customer', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      adminId: user.id,
                                      customerId: customer.id,
                                      status: 'frozen'
                                    })
                                  })
                                  const data = await response.json()
                                  if (response.ok) {
                                    toast.success('Customer account frozen')
                                    if (onUpdateCustomer && data.customer) {
                                      onUpdateCustomer(data.customer)
                                    }
                                  } else {
                                    toast.error(data.error || 'Failed to freeze account')
                                  }
                                } catch (error: any) {
                                  toast.error('Failed to freeze account')
                                }
                              }}
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600 dark:text-green-400"
                              onClick={async () => {
                                if (!user?.id) return
                                try {
                                  const response = await fetch('/api/admin/update-customer', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      adminId: user.id,
                                      customerId: customer.id,
                                      status: 'active'
                                    })
                                  })
                                  const data = await response.json()
                                  if (response.ok) {
                                    toast.success('Customer account activated')
                                    if (onUpdateCustomer && data.customer) {
                                      onUpdateCustomer(data.customer)
                                    }
                                  } else {
                                    toast.error(data.error || 'Failed to activate account')
                                  }
                                } catch (error: any) {
                                  toast.error('Failed to activate account')
                                }
                              }}
                            >
                              <Unlock className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Tellers/Staff Tab */}
          <TabsContent value="tellers" className="space-y-4">
            {/* Search */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button size="sm" variant="outline" onClick={fetchTellers} disabled={loadingTellers}>
                <RefreshCcw className={`w-4 h-4 mr-2 ${loadingTellers ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Teller
              </Button>
            </div>

            {/* Teller List */}
            {loadingTellers ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400 dark:text-gray-300" />
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Loading tellers...</p>
              </div>
            ) : tellers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-500 dark:text-muted-foreground">No tellers found</p>
                <Button className="mt-4" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Teller
                </Button>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-border rounded-lg overflow-hidden bg-white dark:bg-card">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-secondary/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Teller</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Email</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Phone</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Status</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Joined</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-border">
                    {tellers
                      .filter((teller) => 
                        teller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        teller.email.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((teller) => (
                        <tr key={teller.id} className="hover:bg-gray-50 dark:hover:bg-accent/50 transition-colors">
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-foreground">{teller.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500 dark:text-muted-foreground">ID: {teller.id.slice(0, 8)}...</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-gray-900 dark:text-foreground">{teller.email}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-gray-900 dark:text-foreground">{teller.phone || 'N/A'}</span>
                          </td>
                          <td className="p-3">
                            <Badge 
                              variant={teller.status === "active" ? "default" : "secondary"}
                              className={teller.status === "active" ? "bg-green-500 dark:bg-green-600 text-white" : "bg-gray-500 dark:bg-gray-600 text-white"}
                            >
                              {teller.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-gray-600 dark:text-muted-foreground">
                              {new Date(teller.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-accent">
                                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </Button>
                              <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-accent">
                                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </Button>
                              {teller.status === "active" ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                  <Lock className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20"
                                >
                                  <Unlock className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* KYC Verification Tab */}
          <TabsContent value="kyc" className="space-y-4">
            <div className="border border-gray-200 dark:border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-secondary">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Customer</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Submitted</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.filter(c => c.kycStatus !== "verified").map((customer) => (
                    <tr key={customer.id} className="border-t border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent">
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-foreground">{customer.name}</p>
                          <p className="text-xs text-gray-500 dark:text-muted-foreground">{customer.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="bg-yellow-500 dark:bg-yellow-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600 dark:text-muted-foreground">2 days ago</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Document Queue Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-muted-foreground" />
              <p>Document approval queue coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Customer Dialog */}
        <Dialog open={showEditDialog} onOpenChange={handleCloseEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>
                Update customer information. Changes will be saved immediately.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUpdateCustomer}>
              <div className="grid gap-4 py-4">
                {/* Name */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="John Doe"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                    disabled={updating}
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="user@example.com"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                    disabled={updating}
                  />
                </div>

                {/* Phone */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    disabled={updating}
                  />
                </div>

                {/* Status */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Account Status *</Label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value: "active" | "inactive" | "frozen") => 
                      setEditFormData({ ...editFormData, status: value })
                    }
                    disabled={updating}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* KYC Status */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-kyc">KYC Status *</Label>
                  <Select
                    value={editFormData.kycStatus}
                    onValueChange={(value: "pending" | "verified" | "rejected") => 
                      setEditFormData({ ...editFormData, kycStatus: value })
                    }
                    disabled={updating}
                  >
                    <SelectTrigger id="edit-kyc">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseEditDialog}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Customer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

