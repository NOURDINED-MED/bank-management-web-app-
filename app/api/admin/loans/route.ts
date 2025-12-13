import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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

    // Verify user is admin
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get all loans
    const { data: loans, error: loansError } = await supabaseAdmin
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false })

    if (loansError) {
      console.error('Error fetching loans:', loansError)
      return NextResponse.json(
        { error: 'Failed to fetch loans' },
        { status: 500 }
      )
    }

    // Format loans
    const formattedLoans = (loans || []).map((loan: any) => ({
      id: loan.id,
      user_id: loan.user_id,
      loan_type: loan.loan_type,
      loan_amount: parseFloat(loan.loan_amount || 0),
      outstanding_balance: parseFloat(loan.outstanding_balance || loan.loan_amount || 0),
      interest_rate: parseFloat(loan.interest_rate || 0),
      status: loan.status,
      created_at: loan.created_at
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

