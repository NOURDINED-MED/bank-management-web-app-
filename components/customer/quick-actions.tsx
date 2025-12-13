"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, FileText, Download, Repeat, PiggyBank, HelpCircle, ArrowRightLeft } from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  onAction?: (action: string) => void
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    {
      id: "send-money",
      title: "Send Money",
      description: "Transfer money to another account",
      icon: ArrowRightLeft,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      link: "/customer/send-money"
    },
    {
      id: "add-card",
      title: "Add Card",
      description: "Request a new debit or credit card",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      link: "/customer/cards"
    },
    {
      id: "request-loan",
      title: "Request Loan",
      description: "Apply for personal or business loan",
      icon: PiggyBank,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      link: "/customer/request-loan"
    },
    {
      id: "download-statement",
      title: "Download Statement",
      description: "Get your monthly account statement",
      icon: Download,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      link: "/customer/statements"
    },
    {
      id: "auto-transfer",
      title: "Auto Transfer",
      description: "Set up recurring transfers",
      icon: Repeat,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      link: "/customer/auto-transfer"
    },
    {
      id: "view-documents",
      title: "View Documents",
      description: "Access all your documents",
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
      link: "/customer/documents"
    },
    {
      id: "get-help",
      title: "Get Help",
      description: "Contact support or open ticket",
      icon: HelpCircle,
      color: "text-pink-600",
      bgColor: "bg-pink-500/10",
      link: "/customer/feedback"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon
            const content = (
              <div
                className="p-4 border rounded-lg hover:border-accent hover:shadow-md transition-all cursor-pointer"
                onClick={() => onAction?.(action.id)}
              >
                <div className={`${action.bgColor} ${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-1 text-sm">{action.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {action.description}
                </p>
              </div>
            )

            return action.link !== "#" ? (
              <Link key={action.id} href={action.link}>
                {content}
              </Link>
            ) : (
              <div key={action.id}>{content}</div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

