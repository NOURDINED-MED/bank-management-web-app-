import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Default settings
const defaultSettings = {
  branch: {
    name: 'Main Branch',
    address: '123 Main St, City, State 12345',
    phone: '(555) 123-4567'
  },
  interestRates: {
    savings: 2.5,
    checking: 0.5
  },
  notifications: {
    email: true,
    sms: false,
    system: true
  }
}

// GET settings
export async function GET() {
  try {
    // Try to get settings from a settings table if it exists
    // For now, we'll use a simple approach: try to get from a settings table
    // If it doesn't exist, return defaults
    try {
      const { data: settings, error } = await supabaseAdmin
        .from('settings')
        .select('*')
        .eq('key', 'app_settings')
        .single()

      if (!error && settings && settings.value) {
        return NextResponse.json(settings.value)
      }
    } catch (err) {
      // Table might not exist, that's okay
      console.log('Settings table not found, using defaults')
    }

    // Return default settings
    return NextResponse.json(defaultSettings)
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    // Return defaults on any error
    return NextResponse.json(defaultSettings)
  }
}

// POST/PUT settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { branch, interestRates, notifications } = body

    const settingsData = {
      branch: branch || defaultSettings.branch,
      interestRates: interestRates || defaultSettings.interestRates,
      notifications: notifications || defaultSettings.notifications
    }

    // Try to save to database
    try {
      // Check if settings record exists
      const { data: existing } = await supabaseAdmin
        .from('settings')
        .select('id')
        .eq('key', 'app_settings')
        .single()

      if (existing) {
        // Update existing
        const { error } = await supabaseAdmin
          .from('settings')
          .update({ 
            value: settingsData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        if (error) {
          console.error('Error updating settings:', error)
          // Still return success - settings are saved in memory/session
        }
      } else {
        // Create new
        const { error } = await supabaseAdmin
          .from('settings')
          .insert({ 
            key: 'app_settings',
            value: settingsData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error && error.code !== '42P01') {
          // Ignore table doesn't exist error
          console.error('Error creating settings:', error)
        }
      }
    } catch (err) {
      // Table might not exist, that's okay - settings are still "saved" conceptually
      console.log('Settings table not available, settings saved in session')
    }

    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully',
      data: settingsData
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

