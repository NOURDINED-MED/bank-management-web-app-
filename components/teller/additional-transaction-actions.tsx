"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FileText, Receipt, CreditCard, Lock, Unlock, Calculator } from "lucide-react"
import type { Customer } from "@/lib/types"
import { toast } from "sonner"

interface AdditionalTransactionActionsProps {
  customer: Customer | null
  onActionComplete?: () => void
}

export function AdditionalTransactionActions({ customer, onActionComplete }: AdditionalTransactionActionsProps) {
  const [cashierCheckAmount, setCashierCheckAmount] = useState("")
  const [billAmount, setBillAmount] = useState("")
  const [loanAmount, setLoanAmount] = useState("")
  const [accountFrozen, setAccountFrozen] = useState(false)

  if (!customer) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Additional Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Select a customer to perform actions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleCashierCheck = () => {
    if (!cashierCheckAmount || parseFloat(cashierCheckAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    toast.success(`Cashier check issued for $${parseFloat(cashierCheckAmount).toLocaleString()}`)
    setCashierCheckAmount("")
    onActionComplete?.()
  }

  const handleBillPayment = () => {
    if (!billAmount || parseFloat(billAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    toast.success(`Bill payment of $${parseFloat(billAmount).toLocaleString()} processed`)
    setBillAmount("")
    onActionComplete?.()
  }

  const handleLoanPayment = () => {
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    toast.success(`Loan installment of $${parseFloat(loanAmount).toLocaleString()} processed`)
    setLoanAmount("")
    onActionComplete?.()
  }

  const handleFreezeToggle = () => {
    setAccountFrozen(!accountFrozen)
    toast.success(`Account ${!accountFrozen ? 'frozen' : 'unfrozen'}`)
    onActionComplete?.()
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Additional Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Cashier Check */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Receipt className="w-4 h-4 mr-2" />
              Issue Cashier Check
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Cashier Check</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="check-amount">Amount</Label>
                <Input
                  id="check-amount"
                  type="number"
                  placeholder="0.00"
                  value={cashierCheckAmount}
                  onChange={(e) => setCashierCheckAmount(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>Customer: {customer.name}</p>
                <p>Account: {customer.accountNumber}</p>
              </div>
              <Button onClick={handleCashierCheck} className="w-full">
                Issue Check
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bill Payment */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="w-4 h-4 mr-2" />
              Bill Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Bill Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bill-amount">Amount</Label>
                <Input
                  id="bill-amount"
                  type="number"
                  placeholder="0.00"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>Customer: {customer.name}</p>
                <p>Account: {customer.accountNumber}</p>
              </div>
              <Button onClick={handleBillPayment} className="w-full">
                Process Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loan Installment */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Calculator className="w-4 h-4 mr-2" />
              Loan Installment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Loan Installment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="loan-amount">Amount</Label>
                <Input
                  id="loan-amount"
                  type="number"
                  placeholder="0.00"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>Customer: {customer.name}</p>
                <p>Account: {customer.accountNumber}</p>
              </div>
              <Button onClick={handleLoanPayment} className="w-full">
                Process Installment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Account Freeze/Unfreeze */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            {accountFrozen ? (
              <>
                <Lock className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-900">Account Frozen</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Account Active</span>
              </>
            )}
          </div>
          <Switch
            checked={accountFrozen}
            onCheckedChange={handleFreezeToggle}
          />
        </div>
      </CardContent>
    </Card>
  )
}

