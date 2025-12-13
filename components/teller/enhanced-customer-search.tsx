"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Customer } from "@/lib/types"

interface EnhancedCustomerSearchProps {
  customers: Customer[]
  onSelectCustomer?: (customer: Customer) => void
}

export function EnhancedCustomerSearch({ customers, onSelectCustomer }: EnhancedCustomerSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"all" | "account" | "name">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "flagged">("all")
  const [results, setResults] = useState<Customer[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    let filtered = customers

    // Apply search filter
    if (searchType === "account") {
      filtered = filtered.filter(c => 
        c.accountNumber.toLowerCase().includes(query.toLowerCase())
      )
    } else if (searchType === "name") {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    } else {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.accountNumber.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => {
        if (statusFilter === "flagged") {
          return (c.status as string) === "flagged" || c.kycStatus !== "verified"
        }
        return c.status === statusFilter
      })
    }

    setResults(filtered.slice(0, 10))
    setShowResults(true)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSearchType("all")
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={
            searchType === "account" 
              ? "Search by account number..." 
              : searchType === "name"
              ? "Search by customer name..."
              : "Search by account number, name, email, or phone..."
          }
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={searchType} onValueChange={(value: any) => {
          setSearchType(value)
          if (searchQuery.length >= 2) handleSearch(searchQuery)
        }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fields</SelectItem>
            <SelectItem value="account">Account #</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value: any) => {
          setStatusFilter(value)
          if (searchQuery.length >= 2) handleSearch(searchQuery)
        }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>

        {(searchQuery || statusFilter !== "all") && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Results */}
      {showResults && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-[400px] overflow-y-auto shadow-lg">
          <div className="p-2">
            {results.map((customer) => (
              <div
                key={customer.id}
                className="p-3 hover:bg-accent rounded-lg transition-colors cursor-pointer"
                onClick={() => {
                  onSelectCustomer?.(customer)
                  setShowResults(false)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{customer.name}</h4>
                      <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                        {customer.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{customer.accountNumber}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-foreground">
                    ${customer.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showResults && searchQuery.length >= 2 && results.length === 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
          <div className="p-6 text-center text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No customers found</p>
          </div>
        </Card>
      )}
    </div>
  )
}