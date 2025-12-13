"use client"

import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, FileText, CreditCard, Lock, Unlock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Customer } from "@/lib/types"

interface TransactionActionsProps {
  customer: Customer | null
  onDeposit?: () => void
  onWithdrawal?: () => void
  onTransfer?: () => void
  onCheck?: () => void
  onBillPayment?: () => void
  onLoanPayment?: () => void
  onFreeze?: () => void
  onUnfreeze?: () => void
}

export function TransactionActions({
  customer,
  onDeposit,
  onWithdrawal,
  onTransfer,
  onCheck,
  onBillPayment,
  onLoanPayment,
  onFreeze,
  onUnfreeze
}: TransactionActionsProps) {
  const isFrozen = (customer?.status as string) === "frozen"

  if (!customer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teller Transaction Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a customer to perform transactions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teller Transaction Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onDeposit}
            className="h-auto py-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <ArrowUpRight className="w-6 h-6 text-green-600" />
            <span className="text-sm font-semibold">Deposit</span>
          </Button>

          <Button
            onClick={onWithdrawal}
            className="h-auto py-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <ArrowDownRight className="w-6 h-6 text-red-600" />
            <span className="text-sm font-semibold">Withdrawal</span>
          </Button>

          <Button
            onClick={onTransfer}
            className="h-auto py-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-semibold">Transfer</span>
          </Button>

          <Button
            onClick={onCheck}
            className="h-auto py-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <FileText className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-semibold">Cashier Check</span>
          </Button>

          <Button
            onClick={onBillPayment}
            className="h-auto py-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <CreditCard className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-semibold">Bill Payment</span>
          </Button>

          <Button
            onClick={onLoanPayment}
            className="h-auto py-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <FileText className="w-6 h-6 text-indigo-600" />
            <span className="text-sm font-semibold">Loan Payment</span>
          </Button>
        </div>

        {/* Account Freeze/Unfreeze */}
        <div className="mt-4 pt-4 border-t">
          <Button
            onClick={isFrozen ? onUnfreeze : onFreeze}
            variant={isFrozen ? "default" : "destructive"}
            className="w-full"
          >
            {isFrozen ? (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Unfreeze Account
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Freeze Account
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
