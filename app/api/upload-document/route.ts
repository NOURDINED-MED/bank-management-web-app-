import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const documentType = formData.get('documentType') as string

    if (!file || !userId || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, userId, documentType' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and PDF are allowed' },
        { status: 400 }
      )
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${documentType}-${Date.now()}.${fileExt}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('kyc-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload document' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('kyc-documents')
      .getPublicUrl(fileName)

    // Map document type to database enum
    const documentTypeMap: Record<string, string> = {
      'idFront': 'id_card',
      'idBack': 'id_card',
      'proofOfAddress': 'proof_of_address'
    }

    // Insert document record
    const { data: docData, error: docError } = await supabaseAdmin
      .from('kyc_documents')
      .insert({
        user_id: userId,
        document_type: documentTypeMap[documentType] || 'other',
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        status: 'pending'
      })
      .select()
      .single()

    if (docError) {
      console.error('Document record error:', docError)
      // Try to delete uploaded file
      await supabaseAdmin.storage
        .from('kyc-documents')
        .remove([fileName])
      
      return NextResponse.json(
        { error: docError.message || 'Failed to save document record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document: docData,
      message: 'Document uploaded successfully'
    })
  } catch (error: any) {
    console.error('Upload document error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

