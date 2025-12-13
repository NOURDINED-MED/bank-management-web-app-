import type { Receipt } from "./types"

/**
 * Receipt Generation Utilities
 * Generate receipts in multiple formats: Print, PDF, SMS, Email
 */

/**
 * Generate receipt HTML content
 */
export function generateReceiptHTML(receipt: Receipt): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Transaction Receipt - ${receipt.receiptNumber}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      color: black;
    }
    .receipt {
      border: 2px solid #000;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #000;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .branch {
      font-size: 12px;
    }
    .section {
      margin: 15px 0;
      border-bottom: 1px dashed #ccc;
      padding-bottom: 10px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
      font-size: 14px;
    }
    .label {
      font-weight: bold;
    }
    .amount {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 15px 0;
      padding: 10px;
      border: 2px solid #000;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 2px dashed #000;
    }
    @media print {
      body { margin: 0; padding: 10px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="logo">🏦 BANK</div>
      <div class="branch">${receipt.branchName}</div>
      <div style="font-size: 10px; margin-top: 5px;">TRANSACTION RECEIPT</div>
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Receipt #:</span>
        <span>${receipt.receiptNumber}</span>
      </div>
      <div class="row">
        <span class="label">Date & Time:</span>
        <span>${new Date(receipt.date).toLocaleString()}</span>
      </div>
      <div class="row">
        <span class="label">Transaction ID:</span>
        <span>${receipt.transactionId}</span>
      </div>
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Account Name:</span>
        <span>${receipt.customerName}</span>
      </div>
      <div class="row">
        <span class="label">Account Number:</span>
        <span>${receipt.accountNumber}</span>
      </div>
      <div class="row">
        <span class="label">Transaction Type:</span>
        <span style="text-transform: uppercase;">${receipt.type}</span>
      </div>
    </div>

    ${receipt.recipientInfo ? `
    <div class="section">
      <div style="font-weight: bold; margin-bottom: 5px;">RECIPIENT DETAILS:</div>
      <div class="row">
        <span class="label">Name:</span>
        <span>${receipt.recipientInfo.name}</span>
      </div>
      <div class="row">
        <span class="label">Account:</span>
        <span>${receipt.recipientInfo.accountNumber}</span>
      </div>
    </div>
    ` : ''}

    <div class="section">
      <div class="row">
        <span class="label">Amount:</span>
        <span style="font-weight: bold;">${receipt.currency} ${receipt.amount.toLocaleString()}</span>
      </div>
      <div class="row">
        <span class="label">Previous Balance:</span>
        <span>${receipt.currency} ${receipt.balanceBefore.toLocaleString()}</span>
      </div>
      <div class="row">
        <span class="label">New Balance:</span>
        <span style="font-weight: bold;">${receipt.currency} ${receipt.balanceAfter.toLocaleString()}</span>
      </div>
    </div>

    <div class="amount">
      ${receipt.type === 'withdrawal' ? '-' : '+'}${receipt.currency} ${receipt.amount.toLocaleString()}
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Description:</span>
      </div>
      <div style="margin-top: 5px; font-size: 12px;">${receipt.description}</div>
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Teller:</span>
        <span>${receipt.tellerName}</span>
      </div>
      <div class="row">
        <span class="label">Teller ID:</span>
        <span>${receipt.tellerId}</span>
      </div>
    </div>

    <div class="footer">
      <div>Thank you for banking with us!</div>
      <div style="margin-top: 5px;">This is a computer-generated receipt</div>
      <div style="margin-top: 5px;">For inquiries: support@bank.com | 1-800-BANKING</div>
    </div>
  </div>

  <div class="no-print" style="text-align: center; margin-top: 20px;">
    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
      Print Receipt
    </button>
  </div>
</body>
</html>
  `
}

/**
 * Print receipt
 */
export function printReceipt(receipt: Receipt): void {
  const html = generateReceiptHTML(receipt)
  const printWindow = window.open('', '_blank')
  
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    
    // Auto-print after load
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}

/**
 * Download receipt as PDF (using browser print to PDF)
 */
export function downloadReceiptPDF(receipt: Receipt): void {
  const html = generateReceiptHTML(receipt)
  const printWindow = window.open('', '_blank')
  
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    
    // Instruct user to save as PDF
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

/**
 * Generate SMS receipt text
 */
export function generateSMSReceipt(receipt: Receipt): string {
  return `BANK RECEIPT
${receipt.type.toUpperCase()}
Amount: ${receipt.currency}${receipt.amount.toLocaleString()}
Account: ${receipt.accountNumber}
New Balance: ${receipt.currency}${receipt.balanceAfter.toLocaleString()}
Date: ${new Date(receipt.date).toLocaleDateString()}
Receipt#: ${receipt.receiptNumber}
Thank you for banking with us!`
}

/**
 * Generate email receipt HTML
 */
export function generateEmailReceipt(receipt: Receipt): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .email-body {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 10px 10px;
    }
    .receipt-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .amount-box {
      background: #667eea;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
      font-size: 24px;
      font-weight: bold;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-label {
      font-weight: 600;
      color: #6b7280;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-header">
    <h1 style="margin: 0;">🏦 Transaction Receipt</h1>
    <p style="margin: 10px 0 0 0;">Receipt #${receipt.receiptNumber}</p>
  </div>
  
  <div class="email-body">
    <h2>Dear ${receipt.customerName},</h2>
    <p>Your transaction has been processed successfully. Here are the details:</p>
    
    <div class="amount-box">
      ${receipt.type === 'withdrawal' ? '-' : '+'}${receipt.currency} ${receipt.amount.toLocaleString()}
    </div>
    
    <div class="receipt-card">
      <div class="detail-row">
        <span class="detail-label">Transaction Type</span>
        <span style="text-transform: uppercase; font-weight: bold;">${receipt.type}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date & Time</span>
        <span>${new Date(receipt.date).toLocaleString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Transaction ID</span>
        <span>${receipt.transactionId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Account Number</span>
        <span>${receipt.accountNumber}</span>
      </div>
      ${receipt.recipientInfo ? `
      <div class="detail-row">
        <span class="detail-label">Recipient</span>
        <span>${receipt.recipientInfo.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Recipient Account</span>
        <span>${receipt.recipientInfo.accountNumber}</span>
      </div>
      ` : ''}
      <div class="detail-row">
        <span class="detail-label">Previous Balance</span>
        <span>${receipt.currency} ${receipt.balanceBefore.toLocaleString()}</span>
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">New Balance</span>
        <span style="font-weight: bold; color: #667eea;">${receipt.currency} ${receipt.balanceAfter.toLocaleString()}</span>
      </div>
    </div>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <strong>Description:</strong><br>
      ${receipt.description}
    </div>
    
    <div class="footer">
      <p>Processed by: ${receipt.tellerName}<br>
      Branch: ${receipt.branchName}</p>
      <p style="margin-top: 20px;">This is an automated email. Please do not reply.<br>
      For support, contact us at support@bank.com or call 1-800-BANKING</p>
      <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
        © 2024 Bank. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Send receipt via SMS (mock implementation)
 */
export async function sendReceiptSMS(receipt: Receipt, phoneNumber: string): Promise<boolean> {
  // In production, integrate with SMS API (Twilio, AWS SNS, etc.)
  const smsText = generateSMSReceipt(receipt)
  console.log(`Sending SMS to ${phoneNumber}:`, smsText)
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

/**
 * Send receipt via Email (mock implementation)
 */
export async function sendReceiptEmail(receipt: Receipt, email: string): Promise<boolean> {
  // In production, integrate with Email API (SendGrid, AWS SES, etc.)
  const emailHTML = generateEmailReceipt(receipt)
  console.log(`Sending email to ${email}`)
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}

/**
 * Generate receipt number
 */
export function generateReceiptNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  
  return `RCT-${year}${month}${day}-${random}`
}

