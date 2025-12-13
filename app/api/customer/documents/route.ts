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

    // Get documents for user
    const { data: documents, error: documentsError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (documentsError) {
      console.error('Error fetching documents:', documentsError)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    // Format documents to match expected structure
    const formattedDocuments = (documents || []).map((doc: any) => {
      // Map document_type to friendly name
      let name = doc.file_name
      let type = 'other'
      
      if (doc.document_type === 'id_front' || doc.document_type === 'id_back') {
        name = `Government ID (${doc.document_type === 'id_front' ? 'Front' : 'Back'})`
        type = 'id'
      } else if (doc.document_type === 'proof_of_address') {
        name = 'Proof of Address'
        type = 'address'
      } else if (doc.document_type === 'statement') {
        name = 'Account Statement'
        type = 'financial'
      } else if (doc.document_type === 'tax_form') {
        name = 'Tax Document'
        type = 'financial'
      }
      
      return {
        id: doc.id,
        name: name,
        type: type,
        uploadDate: doc.created_at,
        expirationDate: null, // Would need to add expiration_date field to schema
        status: doc.verification_status
      }
    })

    return NextResponse.json({
      documents: formattedDocuments
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

