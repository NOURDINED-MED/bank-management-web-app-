"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, DollarSign, Bell, Copy } from "lucide-react"
import { toast } from "sonner"

export function TellerTools() {
  const [currencyAmount, setCurrencyAmount] = useState("")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [convertedAmount, setConvertedAmount] = useState("")

  // Mock exchange rates
  const exchangeRates: Record<string, Record<string, number>> = {
    USD: { EUR: 0.92, GBP: 0.79, JPY: 149.5, AED: 3.67 },
    EUR: { USD: 1.09, GBP: 0.86, JPY: 162.5, AED: 4.00 },
    GBP: { USD: 1.27, EUR: 1.16, JPY: 189.5, AED: 4.66 },
    JPY: { USD: 0.0067, EUR: 0.0062, GBP: 0.0053, AED: 0.025 },
    AED: { USD: 0.27, EUR: 0.25, GBP: 0.21, JPY: 40.7 }
  }

  const handleCurrencyConvert = () => {
    if (!currencyAmount || isNaN(parseFloat(currencyAmount))) {
      toast.error("Please enter a valid amount")
      return
    }

    const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1
    const converted = parseFloat(currencyAmount) * rate
    setConvertedAmount(converted.toFixed(2))
  }

  const currencies = ["USD", "EUR", "GBP", "JPY", "AED"]

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Teller Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency Converter */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
              Currency Converter
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={currencyAmount}
                onChange={(e) => setCurrencyAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="from">From</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>
              <Button onClick={handleCurrencyConvert} className="w-full">
                Convert
              </Button>
              {convertedAmount && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-foreground">Result:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-foreground">
                    {convertedAmount} {toCurrency}
                    </span>
            <Button
                      variant="ghost"
                      size="sm"
                    onClick={() => {
                        navigator.clipboard.writeText(convertedAmount)
                        toast.success("Copied to clipboard")
                      }}
                    >
                      <Copy className="w-4 h-4" />
                  </Button>
                  </div>
                </div>
              </div>
            )}
              </div>
            </div>

        {/* Branch Announcements */}
        <div className="border-t border-gray-200 dark:border-border pt-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4" />
            Branch Announcements
          </h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">System Maintenance</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Online banking will be unavailable tonight from 11 PM - 1 AM
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">New Policy</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Daily withdrawal limit increased to $10,000
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}