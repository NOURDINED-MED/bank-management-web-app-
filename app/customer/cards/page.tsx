"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import type { Customer } from "@/lib/types"
import { CreditCard, Lock, Plus, Calendar, Shield, Settings, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { toast } from "sonner"
import { CardManagementModal } from "@/components/card-management-modal"

export default function CardsPage() {
  const { user } = useAuth()
  const customer = user as Customer
  const { t } = useTranslation('common')
  const [cardStatus, setCardStatus] = useState<'active' | 'locked' | 'blocked' | 'deactivated'>('active')
  const [modalOpen, setModalOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState<'lock' | 'changePin' | 'setLimits' | 'reportLost' | 'block' | 'deactivate'>('lock')
  const [cardType, setCardType] = useState<'visa' | 'mastercard'>('visa')

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/customer" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">My Cards</h1>
            <p className="text-slate-600 mt-3 text-lg font-medium">Manage your premium payment cards with advanced security features</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                  <p className="text-2xl font-mono tracking-wider mb-2">{customer?.cardNumber}</p>
                  <p className="text-white/60 text-xs">Valid thru {customer?.cardExpiry}</p>
                  <p className="text-white/60 text-xs">CVV {customer?.cardCvv}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Card Holder</p>
                    <p className="font-semibold uppercase tracking-wide">{customer?.name}</p>
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

          {/* Card Management */}
          <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border-indigo-200/50 shadow-xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-indigo-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Card Management
              </CardTitle>
              <p className="text-indigo-600 mt-2 font-medium">Securely manage your card settings and preferences</p>
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
                      <p className="font-semibold text-indigo-800 mb-1">{t('cards.lockCard')}</p>
                      <p className="text-xs text-indigo-600">{t('cards.lockCardDesc')}</p>
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
                      <p className="font-semibold text-indigo-800 mb-1">{t('cards.changePin')}</p>
                      <p className="text-xs text-indigo-600">{t('cards.changePinDesc')}</p>
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
                      <p className="font-semibold text-indigo-800 mb-1">{t('cards.setLimits')}</p>
                      <p className="text-xs text-indigo-600">{t('cards.setLimitsDesc')}</p>
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
                      <p className="font-semibold text-indigo-800 mb-1">{t('cards.reportLost')}</p>
                      <p className="text-xs text-indigo-600">{t('cards.reportLostDesc')}</p>
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
                      <p className="font-semibold text-indigo-800 mb-1">{t('cards.blockCard')}</p>
                      <p className="text-xs text-indigo-600">{t('cards.blockCardDesc')}</p>
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
                      <p className="font-semibold text-indigo-800 mb-1">{t('cards.deactivateCard')}</p>
                      <p className="text-xs text-indigo-600">{t('cards.deactivateCardDesc')}</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <CardManagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        action={currentAction}
        currentStatus={cardStatus}
        onStatusChange={setCardStatus}
      />
    </ProtectedRoute>
  )
}
