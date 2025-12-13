import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET security data
export async function GET() {
  try {
    // Get 2FA statistics
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, two_factor_enabled, role')

    if (usersError) {
      console.error('Error fetching users:', usersError)
    }

    const totalUsers = users?.length || 0
    const usersWith2FA = users?.filter(u => u.two_factor_enabled === true).length || 0
    const twoFactorAdoption = totalUsers > 0 ? Math.round((usersWith2FA / totalUsers) * 100) : 0
    const adminUsers = users?.filter(u => u.role === 'admin').length || 0
    const adminWith2FA = users?.filter(u => u.role === 'admin' && u.two_factor_enabled === true).length || 0
    const allAdminsHave2FA = adminUsers > 0 && adminWith2FA === adminUsers

    // Get user counts by role
    const { data: roleCounts } = await supabaseAdmin
      .from('users')
      .select('role')

    const adminCount = roleCounts?.filter(u => u.role === 'admin').length || 0
    const tellerCount = roleCounts?.filter(u => u.role === 'teller').length || 0
    const customerCount = roleCounts?.filter(u => u.role === 'customer').length || 0

    // Get recent access logs from audit_logs
    const { data: accessLogs, error: logsError } = await supabaseAdmin
      .from('audit_logs')
      .select(`
        id,
        user_id,
        action,
        description,
        ip_address,
        created_at
      `)
      .in('action', ['user.login', 'user.logout', 'admin.settings_change', 'admin.role_change', 'account.update', 'transaction.create', 'account.create', 'account.freeze', 'card.freeze', 'card.unfreeze'])
      .order('created_at', { ascending: false })
      .limit(20)

    if (logsError) {
      console.error('Error fetching access logs:', logsError)
    }

    // Get user details for logs
    const userIds = [...new Set((accessLogs || []).map((log: any) => log.user_id).filter(Boolean))]
    const { data: usersData } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, role')
      .in('id', userIds)

    const usersMap = new Map((usersData || []).map((u: any) => [u.id, u]))

    // Format access logs
    const formattedLogs = (accessLogs || []).map((log: any) => {
      const user = usersMap.get(log.user_id) || {}
      const userName = user.full_name || user.email || 'Unknown User'
      const actionMap: Record<string, string> = {
        'user.login': 'Login',
        'user.logout': 'Logout',
        'admin.settings_change': 'Edit Settings',
        'admin.role_change': 'Change Role',
        'account.update': 'Update Account',
        'transaction.create': 'Create Transaction',
        'account.create': 'Create Account',
        'account.freeze': 'Freeze Account',
        'card.freeze': 'Freeze Card',
        'card.unfreeze': 'Unfreeze Card'
      }
      
      const actionName = actionMap[log.action] || log.action
      const timeAgo = getTimeAgo(new Date(log.created_at))
      
      return {
        id: log.id,
        user: userName,
        action: actionName,
        time: timeAgo,
        status: 'success',
        ip: log.ip_address || 'Unknown'
      }
    })

    // Get suspicious accounts (users with failed login attempts or locked accounts)
    const { data: failedLogins } = await supabaseAdmin
      .from('failed_login_attempts')
      .select('email, attempt_count, last_attempt_at')
      .gte('attempt_count', 3)
      .order('last_attempt_at', { ascending: false })
      .limit(10)

    const { data: lockedAccounts } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, account_locked, locked_until')
      .eq('account_locked', true)
      .limit(10)

    // Get user accounts for suspicious accounts
    const suspiciousAccounts: any[] = []
    
    if (failedLogins && failedLogins.length > 0) {
      for (const failedLogin of failedLogins) {
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, full_name, email')
          .eq('email', failedLogin.email)
          .single()

        if (user) {
          const { data: accounts } = await supabaseAdmin
            .from('accounts')
            .select('account_number')
            .eq('user_id', user.id)
            .limit(1)

          suspiciousAccounts.push({
            id: user.id,
            name: user.full_name || user.email,
            accountNumber: accounts?.[0]?.account_number || 'N/A',
            reason: `Multiple failed login attempts (${failedLogin.attempt_count})`,
            status: 'flagged'
          })
        }
      }
    }

    if (lockedAccounts && lockedAccounts.length > 0) {
      for (const locked of lockedAccounts) {
        const { data: accounts } = await supabaseAdmin
          .from('accounts')
          .select('account_number')
          .eq('user_id', locked.id)
          .limit(1)

        suspiciousAccounts.push({
          id: locked.id,
          name: locked.full_name || locked.email,
          accountNumber: accounts?.[0]?.account_number || 'N/A',
          reason: 'Account locked due to security concerns',
          status: 'locked'
        })
      }
    }

    return NextResponse.json({
      twoFactor: {
        enabled: allAdminsHave2FA,
        adoptionRate: twoFactorAdoption,
        totalUsers,
        usersWith2FA
      },
      userCounts: {
        admin: adminCount,
        teller: tellerCount,
        customer: customerCount
      },
      accessLogs: formattedLogs,
      suspiciousAccounts: suspiciousAccounts.slice(0, 10) // Limit to 10
    })
  } catch (error: any) {
    console.error('Error fetching security data:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

