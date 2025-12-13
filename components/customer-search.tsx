"use client"

import { useState } from "react"
import { Search, ArrowUp, ArrowDown, ArrowRight, Shield, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Customer } from "@/lib/types"

interface CustomerSearchProps {
  customers: Customer[]
  onDeposit?: (customer: Customer) => void
  onWithdrawal?: (customer: Customer) => void
  onTransfer?: (customer: Customer) => void
  onViewProfile?: (customer: Customer) => void
}

export function CustomerSearch({ 
  customers, 
  onDeposit, 
  onWithdrawal, 
  onTransfer,
  onViewProfile 
}: CustomerSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const results = customers.filter(customer => 
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase()) ||
      customer.accountNumber.toLowerCase().includes(query.toLowerCase()) ||
      customer.phone?.includes(query)
    ).slice(0, 5)

    setSearchResults(results)
    setShowResults(true)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search customer by name, account, email, or phone..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-[400px] overflow-y-auto shadow-lg">
          <div className="p-2">
            {searchResults.map((customer) => (
              <div
                key={customer.id}
                className="p-3 hover:bg-accent rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{customer.name}</h4>
                      <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                        {customer.status}
                      </Badge>
                      {customer.kycStatus === "verified" && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                      <div>
                        <span className="font-medium">Account:</span> {customer.accountNumber}
                      </div>
                      <div>
                        <span className="font-medium">Balance:</span>{" "}
                        <span className={customer.balance > 10000 ? "text-green-600 font-semibold" : ""}>
                          ${customer.balance.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {customer.accountType}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {customer.phone || "N/A"}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          onDeposit?.(customer)
                          setShowResults(false)
                        }}
                      >
                        <ArrowUp className="w-3 h-3 mr-1" />
                        Deposit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          onWithdrawal?.(customer)
                          setShowResults(false)
                        }}
                      >
                        <ArrowDown className="w-3 h-3 mr-1" />
                        Withdraw
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          onTransfer?.(customer)
                          setShowResults(false)
                        }}
                      >
                        <ArrowRight className="w-3 h-3 mr-1" />
                        Transfer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onViewProfile?.(customer)
                          setShowResults(false)
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showResults && searchQuery.length >= 2 && searchResults.length === 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
          <div className="p-6 text-center text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No customers found matching "{searchQuery}"</p>
          </div>
        </Card>
      )}
    </div>
  )
}

