"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ArrowUpRight, ArrowDownRight, Download, Search, Send, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { getTransactionTypeLabel, getTransactionStatusLabel } from "@/lib/translation-helpers"

interface Transaction {
  id: string
  transaction_type: string
  amount: number
  balance_after: number
  description: string
  category: string
  merchant_name?: string
  status: string
  reference_number: string
  created_at: string
}

interface Account {
  id: string
  account_number: string
  account_type: string
  balance: number
}

export default function TransactionsPage() {
  const { user } = useAuth()
  const { t } = useTranslation('common')
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [sendMoneyOpen, setSendMoneyOpen] = useState(false)
  
  // Send money form
  const [selectedAccount, setSelectedAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [description, setDescription] = useState("")
  const [transactionType, setTransactionType] = useState("payment")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchAccounts()
      fetchTransactions()
    }
  }, [user])

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active')

      if (error) throw error
      setAccounts(data || [])
      if (data && data.length > 0) {
        setSelectedAccount(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('Failed to load accounts')
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/transactions?userId=${user!.id}&limit=100`)
      const data = await response.json()

      if (data.error) throw new Error(data.error)
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAccount || !amount || parseFloat(amount) <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSending(true)
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.id,
          accountId: selectedAccount,
          transactionType,
          amount: parseFloat(amount),
          description: description || `${transactionType} transaction`,
          category: transactionType,
          merchantName: recipient || undefined,
        }),
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      toast.success(t('transactions.transactionSuccessful', { ref: data.referenceNumber }))
      setSendMoneyOpen(false)
      
      // Reset form
      setAmount("")
      setRecipient("")
      setDescription("")
      
      // Refresh data
      fetchTransactions()
      fetchAccounts()
    } catch (error: any) {
      console.error('Transaction error:', error)
      toast.error(error.message || 'Transaction failed')
    } finally {
      setSending(false)
    }
  }

  // Apply filters
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.transaction_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || t.transaction_type === filterType
    return matchesSearch && matchesFilter
  })

  const getTransactionIcon = (type: string) => {
    if (type === 'deposit') return <ArrowDownRight className="w-4 h-4 text-green-600" />
    return <ArrowUpRight className="w-4 h-4 text-red-600" />
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      cancelled: "outline",
    }
    return <Badge variant={variants[status] || "default"}>{getTransactionStatusLabel(status, t)}</Badge>
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["customer"]}>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">{t('transactions.loadingTransactions')}</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/customer" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
              {t('transactions.backToDashboard')}
            </Link>
            <div className="flex justify-between items-start">
              <div>
            <h1 className="text-4xl font-bold text-balance">{t('transactions.title')}</h1>
                <p className="text-muted-foreground mt-2">{t('transactions.subtitle')}</p>
              </div>
              <Dialog open={sendMoneyOpen} onOpenChange={setSendMoneyOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Send className="w-4 h-4 mr-2" />
                    {t('transactions.sendMoney')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{t('transactions.newTransaction')}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSendMoney} className="space-y-4">
                    <div>
                      <Label htmlFor="account">{t('transactions.fromAccount')}</Label>
                      <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('transactions.selectAccount')} />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.account_type.toUpperCase()} - {account.account_number} (${account.balance.toFixed(2)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="type">{t('transactions.transactionType')}</Label>
                      <Select value={transactionType} onValueChange={setTransactionType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="payment">{t('transactions.types.payment')}</SelectItem>
                          <SelectItem value="withdrawal">{t('transactions.types.withdrawal')}</SelectItem>
                          <SelectItem value="transfer">{t('transactions.types.transfer')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">{t('transactions.amount')}</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder={t('transactions.amountPlaceholder')}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="recipient">{t('transactions.recipientMerchant')}</Label>
                      <Input
                        id="recipient"
                        placeholder={t('transactions.recipientPlaceholder')}
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">{t('transactions.description')}</Label>
                      <Input
                        id="description"
                        placeholder={t('transactions.descriptionPlaceholder')}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setSendMoneyOpen(false)} className="flex-1">
                        {t('transactions.cancel')}
                      </Button>
                      <Button type="submit" disabled={sending} className="flex-1">
                        {sending ? t('transactions.processing') : t('transactions.sendMoney')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Account Balances */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {account.account_type.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${account.balance.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{account.account_number}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={t('transactions.searchTransactions')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant={filterType === "all" ? "default" : "outline"} onClick={() => setFilterType("all")}>
                    {t('transactions.all')}
                  </Button>
                  <Button
                    variant={filterType === "deposit" ? "default" : "outline"}
                    onClick={() => setFilterType("deposit")}
                  >
                    {t('transactions.deposits')}
                  </Button>
                  <Button
                    variant={filterType === "withdrawal" ? "default" : "outline"}
                    onClick={() => setFilterType("withdrawal")}
                  >
                    {t('transactions.withdrawals')}
                  </Button>
                  <Button
                    variant={filterType === "payment" ? "default" : "outline"}
                    onClick={() => setFilterType("payment")}
                  >
                    {t('transactions.payments')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('transactions.allTransactions')} ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t('transactions.noTransactions')}</p>
                  <Button onClick={() => setSendMoneyOpen(true)} variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('transactions.createFirstTransaction')}
                  </Button>
                </div>
              ) : (
              <div className="space-y-1">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-accent">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description || getTransactionTypeLabel(transaction.transaction_type, t)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {transaction.merchant_name && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <p className="text-sm text-muted-foreground">{transaction.merchant_name}</p>
                              </>
                            )}
                            <span className="text-muted-foreground">•</span>
                            <p className="text-xs text-muted-foreground">{transaction.reference_number}</p>
                      </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(transaction.status)}
                    </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
