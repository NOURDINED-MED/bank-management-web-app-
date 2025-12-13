import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user's accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError)
      return NextResponse.json(
        { error: 'Failed to fetch accounts' },
        { status: 500 }
      )
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        cards: []
      })
    }

    const accountIds = accounts.map(acc => acc.id)

    // Get cards for all user accounts
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from('cards')
      .select('*')
      .in('account_id', accountIds)
      .order('created_at', { ascending: false })

    if (cardsError) {
      console.error('Error fetching cards:', cardsError)
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      )
    }

    // Format cards to match expected structure
    const formattedCards = (cards || []).map((card: any) => {
      const cardNumber = card.card_number || ''
      const last4 = cardNumber.slice(-4) || '****'
      
      // Format full card number with spaces (XXXX XXXX XXXX XXXX)
      const formatCardNumber = (num: string) => {
        if (!num || num.length !== 16) return num
        return `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8, 12)} ${num.slice(12, 16)}`
      }
      
      // Determine card brand based on card number (simplified)
      let brand = 'VISA'
      if (cardNumber && cardNumber.startsWith('5')) brand = 'MASTERCARD'
      
      return {
        id: card.id,
        type: card.card_type,
        last4: last4,
        fullCardNumber: formatCardNumber(cardNumber),
        cardNumber: cardNumber, // Full number without formatting
        cvv: card.cvv || '***', // Return CVV if available
        brand: brand,
        expiry: `${String(card.expiry_month).padStart(2, '0')}/${String(card.expiry_year).slice(-2)}`,
        expiryMonth: card.expiry_month,
        expiryYear: card.expiry_year,
        status: card.card_status === 'frozen' ? 'blocked' : card.card_status,
        spendingLimit: parseFloat(card.monthly_limit || 0),
        currentUsage: 0 // Would need to calculate from transactions
      }
    })

    return NextResponse.json({
      cards: formattedCards
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

