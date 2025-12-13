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

    // Get active loans
    const { data: loans, error: loansError } = await supabaseAdmin
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['approved', 'active'])
      .order('created_at', { ascending: false })

    if (loansError) {
      console.error('Error fetching loans:', loansError)
      return NextResponse.json(
        { error: 'Failed to fetch loans' },
        { status: 500 }
      )
    }

    // Format loans to match expected structure
    const formattedLoans = (loans || []).map((loan: any) => ({
      id: loan.id,
      type: loan.loan_type === 'personal' ? 'Personal Loan' : 
            loan.loan_type === 'auto' ? 'Auto Loan' :
            loan.loan_type === 'home' ? 'Home Loan' :
            loan.loan_type === 'business' ? 'Business Loan' : loan.loan_type,
      principal: parseFloat(loan.loan_amount || 0),
      remainingBalance: parseFloat(loan.outstanding_balance || 0),
      interestRate: parseFloat(loan.interest_rate || 0),
      nextPayment: loan.next_payment_date || null,
      nextPaymentAmount: parseFloat(loan.monthly_payment || 0),
      status: loan.status === 'approved' || loan.status === 'active' ? 'active' : loan.status
    }))

    return NextResponse.json({
      loans: formattedLoans
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

