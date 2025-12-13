"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, RefreshCw, CheckCircle, XCircle, Clock, Plus, Lock, Shield, Settings, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { CardManagementModal } from "@/components/card-management-modal"
import type { Customer } from "@/lib/types"

interface CardData {
  id: string
  type: "debit" | "credit"
  last4: string
  fullCardNumber?: string
  cardNumber?: string
  cvv?: string
  brand: string
  expiry: string
  expiryMonth?: number
  expiryYear?: number
  status: "active" | "blocked" | "expired"
  spendingLimit?: number
  currentUsage?: number
}

export function CardsOverviewDetailed() {
  const { user } = useAuth()
  const customer = user as Customer
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [cardStatus, setCardStatus] = useState<'active' | 'locked' | 'blocked' | 'deactivated'>('active')
  const [modalOpen, setModalOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState<'lock' | 'changePin' | 'setLimits' | 'reportLost' | 'block' | 'deactivate'>('lock')
  const [cardType, setCardType] = useState<'visa' | 'mastercard'>('visa')

  useEffect(() => {
    if (user?.id) {
      fetchCards()
    }
  }, [user])

  const fetchCards = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const response = await fetch(`/api/customer/cards?userId=${user.id}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setCards(data.cards || [])
    } catch (error) {
      console.error('Error fetching cards:', error)
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case "blocked":
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Blocked</Badge>
      case "expired":
        return <Badge className="bg-gray-500 text-white"><Clock className="w-3 h-3 mr-1" />Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleReplaceCard = (cardId: string) => {
    toast.success("Card replacement request submitted (UI only)")
  }

  const handleRequestCard = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to request a card")
      return
    }

    try {
      // Request a new card
      const response = await fetch('/api/customer/request-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cardType: 'debit'
        })
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success("Card request submitted successfully! Your new card will be activated within 3-5 business days.")
      
      // Refresh cards list
      fetchCards()
    } catch (error: any) {
      console.error('Error requesting card:', error)
      toast.error("Failed to request card. Please try again or contact support.")
    }
  }

  const currentCard = cards.length > 0 ? cards[0] : null

  return (
    <div className="space-y-6">
      {/* Card Display Section */}
      {currentCard ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Virtual Card Display */}
          <Card className={`${
            cardType === 'visa'
              ? 'bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800'
              : 'bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900'
          } text-white border-0 overflow-hidden relative shadow-2xl`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl ${
              cardType === 'visa' ? 'bg-gradient-to-br from-blue-400/10 to-cyan-400/10' : 'bg-gradient-to-br from-red-400/10 to-orange-400/10'
            }`} />
            <CardContent className="p-8 relative">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-white/60 text-sm mb-1">Premium Debit Card</p>
                  <Badge
                    className={`${
                      cardStatus === 'active' ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' :
                      cardStatus === 'locked' ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' :
                      cardStatus === 'blocked' ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' :
                      'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30'
                    } border-0`}
                  >
                    {cardStatus === 'active' ? 'Active' :
                     cardStatus === 'locked' ? 'Locked' :
                     cardStatus === 'blocked' ? 'Blocked' : 'Deactivated'}
                  </Badge>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <CreditCard className="w-8 h-8" />
                </div>
              </div>

              <div className="mb-8">
                <p className="text-2xl font-mono tracking-wider mb-2">
                  {currentCard.fullCardNumber || (currentCard.cardNumber ? 
                    `${currentCard.cardNumber.slice(0, 4)} ${currentCard.cardNumber.slice(4, 8)} ${currentCard.cardNumber.slice(8, 12)} ${currentCard.cardNumber.slice(12, 16)}` : 
                    `**** **** **** ${currentCard.last4}`)}
                </p>
                <p className="text-white/60 text-xs">Valid thru {currentCard.expiry}</p>
                <p className="text-white/60 text-xs">CVV {currentCard.cvv || '***'}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs mb-1">Card Holder</p>
                  <p className="font-semibold uppercase tracking-wide">{customer?.name || 'CARD HOLDER'}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {cardType === 'visa' ? (
                      <div className="w-8 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-sm flex items-center justify-center">
                        <span className="text-black text-xs font-bold">VISA</span>
                      </div>
                    ) : (
                      <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">MC</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Details/Options */}
          <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-emerald-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-800">Card Type</h3>
                      <p className="text-sm text-emerald-600">Choose your preferred card network</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant={cardType === 'visa' ? 'default' : 'outline'}
                      onClick={() => setCardType('visa')}
                      className={`text-xs font-semibold transition-all duration-200 ${
                        cardType === 'visa'
                          ? 'bg-blue-600 hover:bg-blue-700 shadow-md'
                          : 'hover:bg-blue-50 border-blue-200'
                      }`}
                    >
                      VISA
                    </Button>
                    <Button
                      size="sm"
                      variant={cardType === 'mastercard' ? 'default' : 'outline'}
                      onClick={() => setCardType('mastercard')}
                      className={`text-xs font-semibold transition-all duration-200 ${
                        cardType === 'mastercard'
                          ? 'bg-red-600 hover:bg-red-700 shadow-md'
                          : 'hover:bg-red-50 border-red-200'
                      }`}
                    >
                      Mastercard
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/70 rounded-xl border border-white/50 shadow-sm">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3 rounded-xl shadow-md">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600 mb-1 font-medium">Security Status</p>
                    <p className="font-bold text-xl text-emerald-800">Fully Protected</p>
                    <p className="text-xs text-emerald-500 mt-1">PIN, CVV, and biometric security enabled</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border border-gray-200 dark:border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Cards Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Loading cards...</p>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <CreditCard className="w-16 h-16 mx-auto text-gray-400 dark:text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-foreground mb-2">No cards found</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground mb-4">
                    You don't have any active cards. Request a new card to get started.
                  </p>
                </div>
                <Button
                  onClick={handleRequestCard}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Request New Card
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card Management Section */}
      {currentCard && (
        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border-indigo-200/50 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-indigo-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  Card Management
                </CardTitle>
                <p className="text-indigo-600 mt-2 font-medium">Securely manage your card settings and preferences</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCards}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                variant="outline"
                className="justify-start h-auto p-5 bg-white/80 hover:bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 group"
                onClick={() => {
                  setCurrentAction('lock')
                  setModalOpen(true)
                }}
                disabled={cardStatus === 'blocked' || cardStatus === 'deactivated'}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-3 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-md">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-indigo-800 mb-1">Lock Card</p>
                    <p className="text-xs text-indigo-600">Temporarily disable your card</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-5 bg-white/80 hover:bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 group"
                onClick={() => {
                  setCurrentAction('changePin')
                  setModalOpen(true)
                }}
                disabled={cardStatus === 'blocked' || cardStatus === 'deactivated'}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-md">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-indigo-800 mb-1">Change PIN</p>
                    <p className="text-xs text-indigo-600">Update your card PIN</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-5 bg-white/80 hover:bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 group"
                onClick={() => {
                  setCurrentAction('setLimits')
                  setModalOpen(true)
                }}
                disabled={cardStatus === 'blocked' || cardStatus === 'deactivated'}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-md">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-indigo-800 mb-1">Set Limits</p>
                    <p className="text-xs text-indigo-600">Configure spending limits</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-5 bg-white/80 hover:bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 group"
                onClick={() => {
                  setCurrentAction('reportLost')
                  setModalOpen(true)
                }}
                disabled={cardStatus === 'blocked' || cardStatus === 'deactivated'}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-3 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-md">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-indigo-800 mb-1">Report Lost</p>
                    <p className="text-xs text-indigo-600">Report lost or stolen card</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-5 bg-white/80 hover:bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 group"
                onClick={() => {
                  setCurrentAction('block')
                  setModalOpen(true)
                }}
                disabled={cardStatus === 'blocked' || cardStatus === 'deactivated'}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="bg-gradient-to-br from-gray-600 to-slate-700 text-white p-3 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-md">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-indigo-800 mb-1">Block Card</p>
                    <p className="text-xs text-indigo-600">Permanently block your card</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-5 bg-white/80 hover:bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 group"
                onClick={() => {
                  setCurrentAction('deactivate')
                  setModalOpen(true)
                }}
                disabled={cardStatus === 'deactivated'}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="bg-gradient-to-br from-slate-500 to-gray-600 text-white p-3 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-md">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-indigo-800 mb-1">Deactivate Card</p>
                    <p className="text-xs text-indigo-600">Deactivate your card</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CardManagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        action={currentAction}
        currentStatus={cardStatus}
        onStatusChange={setCardStatus}
      />
    </div>
  )
}