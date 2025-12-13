"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft, 
  Receipt, 
  FileText,
  CreditCard,
  Lock,
  Unlock,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import type { Customer } from "@/lib/types"

interface TellerTransactionActionsProps {
  customer: Customer | null
  onDeposit?: () => void
  onWithdrawal?: () => void
  onTransfer?: () => void
  onFreezeAccount?: () => void
  onUnfreezeAccount?: () => void
}

export function TellerTransactionActions({
  customer,
  onDeposit,
  onWithdrawal,
  onTransfer,
  onFreezeAccount,
  onUnfreezeAccount
}: TellerTransactionActionsProps) {
  const isAccountFrozen = (customer?.status as string) === 'frozen' || (customer?.status as string) === 'locked'

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Transaction Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="h-auto py-4 flex-col gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={onDeposit}
            disabled={!customer || isAccountFrozen}
          >
            <ArrowUpRight className="w-5 h-5" />
            <span className="font-semibold">Deposit</span>
          </Button>
          <Button
            className="h-auto py-4 flex-col gap-2 bg-red-600 hover:bg-red-700 text-white"
            onClick={onWithdrawal}
            disabled={!customer || isAccountFrozen}
          >
            <ArrowDownRight className="w-5 h-5" />
            <span className="font-semibold">Withdrawal</span>
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-2 border-gray-300"
            onClick={onTransfer}
            disabled={!customer || isAccountFrozen}
          >
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            <span className="text-sm">Transfer</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-2 border-gray-300"
            disabled={!customer || isAccountFrozen}
          >
            <Receipt className="w-5 h-5 text-purple-600" />
            <span className="text-sm">Cashier Check</span>
          </Button>
        </div>

        {/* Tertiary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-2 border-gray-300"
            disabled={!customer || isAccountFrozen}
          >
            <FileText className="w-5 h-5 text-orange-600" />
            <span className="text-sm">Bill Payment</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-2 border-gray-300"
            disabled={!customer || isAccountFrozen}
          >
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span className="text-sm">Loan Payment</span>
          </Button>
        </div>

        {/* Account Freeze/Unfreeze */}
        <div className="pt-3 border-t border-gray-200">
          {isAccountFrozen ? (
            <Button
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-50"
              onClick={onUnfreezeAccount}
              disabled={!customer}
            >
              <Unlock className="w-4 h-4 mr-2" />
              Unfreeze Account
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
              onClick={onFreezeAccount}
              disabled={!customer}
            >
              <Lock className="w-4 h-4 mr-2" />
              Freeze Account
            </Button>
          )}
        </div>

        {!customer && (
          <p className="text-xs text-center text-gray-500 pt-2">
            Select a customer to enable actions
          </p>
        )}
        {customer && isAccountFrozen && (
          <p className="text-xs text-center text-red-600 pt-2">
            Account is frozen - actions disabled
          </p>
        )}
      </CardContent>
    </Card>
  )
}