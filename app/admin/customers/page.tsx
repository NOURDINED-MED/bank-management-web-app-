"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Mail, Phone, Wallet, CreditCard, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { CustomerMiniProfile } from "@/components/customer-mini-profile"

interface Customer {
  id: string
  email: string
  name: string
  phone: string
  accountNumber: string
  accountType: string
  balance: number
  status: string
  kycStatus?: string
  createdAt: string
}

export default function CustomersManagement() {
  const { user: userData } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)

  useEffect(() => {
    if (userData?.id) {
      fetchCustomers()
    }
  }, [userData])

  const fetchCustomers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await fetch(`/api/admin/customers?userId=${userData!.id}`)
      const data = await response.json()

      if (data.error) throw new Error(data.error)
      
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case "savings":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20"
      case "checking":
        return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
      case "business":
        return "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20"
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-balance">Customer Management</h1>
              <p className="text-muted-foreground mt-2">View and manage customer accounts</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => fetchCustomers(true)} disabled={refreshing} variant="outline">
                <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Link href="/admin/customers/create">
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </Link>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or account number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Loading customers...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="space-y-3 flex-1">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{customer.name}</h3>
                            <Badge className={getAccountTypeBadge(customer.accountType)}>
                              {customer.accountType.charAt(0).toUpperCase() + customer.accountType.slice(1)}
                            </Badge>
                            <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                              {customer.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Account Number</p>
                            <p className="font-mono font-medium">{customer.accountNumber}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Wallet className="w-3 h-3" />
                              Balance
                            </div>
                            <p className="font-bold text-lg text-green-600">
                              $
                              {customer.balance.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setShowCustomerDetails(true)
                        }}
                      >
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}

          {!loading && filteredCustomers.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No customers found matching your search.' : 'No customers found. Customers will appear here when they sign up.'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Customer Details Dialog */}
          <CustomerMiniProfile
            customer={selectedCustomer as any}
            open={showCustomerDetails}
            onClose={() => {
              setShowCustomerDetails(false)
              setSelectedCustomer(null)
            }}
            onDeposit={() => {
              if (selectedCustomer?.accountNumber) {
                window.location.href = `/admin/customers/deposit?account=${encodeURIComponent(selectedCustomer.accountNumber)}`
              }
            }}
            onWithdrawal={() => {
              if (selectedCustomer?.accountNumber) {
                window.location.href = `/admin/customers/withdrawal?account=${encodeURIComponent(selectedCustomer.accountNumber)}`
              }
            }}
            onTransfer={() => {
              if (selectedCustomer?.accountNumber) {
                window.location.href = `/admin/customers/transfer?fromAccount=${encodeURIComponent(selectedCustomer.accountNumber)}`
              }
            }}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}
