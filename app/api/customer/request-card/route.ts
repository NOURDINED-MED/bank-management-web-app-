import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * POST /api/customer/request-card
 * Request a new card for a customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, cardType = 'debit' } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .eq('role', 'customer')
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's active account
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('id, account_number, account_type')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1)

    if (accountsError || !accounts || accounts.length === 0) {
      return NextResponse.json(
        { error: 'No active account found. Please create an account first.' },
        { status: 400 }
      )
    }

    const account = accounts[0]

    // Check if user already has an active card for this account
    const { data: existingCards, error: cardsError } = await supabaseAdmin
      .from('cards')
      .select('id, card_status')
      .eq('account_id', account.id)
      .eq('card_status', 'active')

    if (cardsError) {
      console.error('Error checking existing cards:', cardsError)
    }

    // If user already has an active card, inform them
    if (existingCards && existingCards.length > 0) {
      return NextResponse.json(
        { 
          error: 'You already have an active card. Please use the card management page to request a replacement.',
          hasActiveCard: true
        },
        { status: 400 }
      )
    }

    // Generate card details
    const cardNumber = generateCardNumber()
    const expiryMonth = new Date().getMonth() + 1
    const expiryYear = new Date().getFullYear() + 3 // 3 years from now
    const cvv = Math.floor(Math.random() * 900 + 100).toString() // Generate 3-digit CVV

    // Create card record (status: pending - needs admin approval)
    const { data: newCard, error: insertError } = await supabaseAdmin
      .from('cards')
      .insert({
        account_id: account.id,
        card_number: cardNumber,
        card_type: cardType,
        card_status: 'active', // Auto-activate for now, can be changed to 'pending' for admin approval
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        cvv: cvv, // Store CVV (in production, this should be encrypted)
        daily_limit: 1000.00,
        monthly_limit: 10000.00
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating card:', insertError)
      return NextResponse.json(
        { error: 'Failed to create card. Please try again or contact support.' },
        { status: 500 }
      )
    }

    // Create notification for the user
    try {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'card_issued',
          title: 'New Card Issued',
          message: `Your new ${cardType} card ending in ${cardNumber.slice(-4)} has been issued and is ready to use.`,
          created_at: new Date().toISOString()
        })
    } catch (notifError) {
      // Notification creation is optional, don't fail the request
      console.warn('Failed to create notification:', notifError)
    }

    return NextResponse.json({
      success: true,
      message: 'Card request processed successfully',
      card: {
        id: newCard.id,
        last4: cardNumber.slice(-4),
        type: cardType,
        status: newCard.card_status,
        expiry: `${String(expiryMonth).padStart(2, '0')}/${String(expiryYear).slice(-2)}`
      }
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate a random card number (last 4 digits visible)
 */
function generateCardNumber(): string {
  // Generate 16-digit card number
  // In production, use a proper card number generator that follows Luhn algorithm
  const digits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10))
  
  // Ensure it starts with 4 (Visa) or 5 (Mastercard)
  digits[0] = Math.random() > 0.5 ? 4 : 5
  
  // Apply Luhn algorithm for valid card number
  let sum = 0
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]
    if ((digits.length - i) % 2 === 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  
  // Adjust last digit to make it valid
  digits[15] = (10 - (sum % 10)) % 10
  
  return digits.join('')
}

