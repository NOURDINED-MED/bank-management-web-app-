/**
 * Export Utilities for CSV, Excel, and PDF generation
 */

export interface ExportData {
  headers: string[]
  rows: any[][]
  title?: string
  metadata?: Record<string, any>
}

/**
 * Generate CSV content from data
 */
export function generateCSV(data: ExportData): string {
  const csvRows: string[] = []

  // Add title if provided
  if (data.title) {
    csvRows.push(`"${data.title}"`)
    csvRows.push("") // Empty row
  }

  // Add metadata if provided
  if (data.metadata) {
    Object.entries(data.metadata).forEach(([key, value]) => {
      csvRows.push(`"${key}","${value}"`)
    })
    csvRows.push("") // Empty row
  }

  // Add headers
  csvRows.push(data.headers.map(h => `"${h}"`).join(","))

  // Add data rows
  data.rows.forEach(row => {
    const csvRow = row.map(cell => {
      // Handle different data types
      if (cell === null || cell === undefined) return '""'
      if (typeof cell === "object") return `"${JSON.stringify(cell)}"`
      return `"${String(cell).replace(/"/g, '""')}"` // Escape quotes
    })
    csvRows.push(csvRow.join(","))
  })

  return csvRows.join("\n")
}

/**
 * Download CSV file
 */
export function downloadCSV(data: ExportData, filename: string): void {
  const csv = generateCSV(data)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Generate Excel-compatible HTML (can be opened in Excel)
 */
export function generateExcelHTML(data: ExportData): string {
  let html = `
    <html xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="utf-8">
      <style>
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #4F46E5; color: white; padding: 8px; border: 1px solid #ddd; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .metadata { font-size: 12px; color: #666; margin-bottom: 20px; }
      </style>
    </head>
    <body>
  `

  if (data.title) {
    html += `<div class="title">${data.title}</div>`
  }

  if (data.metadata) {
    html += '<div class="metadata">'
    Object.entries(data.metadata).forEach(([key, value]) => {
      html += `<div><strong>${key}:</strong> ${value}</div>`
    })
    html += '</div>'
  }

  html += '<table>'
  
  // Headers
  html += '<thead><tr>'
  data.headers.forEach(header => {
    html += `<th>${header}</th>`
  })
  html += '</tr></thead>'

  // Rows
  html += '<tbody>'
  data.rows.forEach(row => {
    html += '<tr>'
    row.forEach(cell => {
      html += `<td>${cell !== null && cell !== undefined ? cell : ""}</td>`
    })
    html += '</tr>'
  })
  html += '</tbody></table></body></html>'

  return html
}

/**
 * Download Excel file
 */
export function downloadExcel(data: ExportData, filename: string): void {
  const html = generateExcelHTML(data)
  const blob = new Blob([html], { type: "application/vnd.ms-excel" })
  const link = document.createElement("a")
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Generate PDF using HTML and browser print
 */
export function generatePDF(data: ExportData, filename: string): void {
  const html = generateExcelHTML(data)
  
  // Create a new window with the content
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}

/**
 * Format transaction data for export
 */
export function formatTransactionsForExport(transactions: any[]): ExportData {
  return {
    title: "Transaction Report",
    metadata: {
      "Generated": new Date().toLocaleString(),
      "Total Transactions": transactions.length,
      "Total Amount": `$${transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`
    },
    headers: [
      "Transaction ID",
      "Date",
      "Customer",
      "Type",
      "Amount",
      "Status",
      "Description"
    ],
    rows: transactions.map(t => [
      t.id,
      new Date(t.date).toLocaleString(),
      t.customerName,
      t.type,
      `$${t.amount.toLocaleString()}`,
      t.status,
      t.description
    ])
  }
}

/**
 * Format customer data for export
 */
export function formatCustomersForExport(customers: any[]): ExportData {
  return {
    title: "Customer Report",
    metadata: {
      "Generated": new Date().toLocaleString(),
      "Total Customers": customers.length,
      "Active Customers": customers.filter(c => c.status === "active").length
    },
    headers: [
      "Account Number",
      "Name",
      "Email",
      "Phone",
      "Account Type",
      "Balance",
      "Status",
      "Created Date"
    ],
    rows: customers.map(c => [
      c.accountNumber,
      c.name,
      c.email,
      c.phone,
      c.accountType,
      `$${c.balance.toLocaleString()}`,
      c.status,
      new Date(c.createdAt).toLocaleDateString()
    ])
  }
}

/**
 * Format audit logs for export
 */
export function formatAuditLogsForExport(logs: any[]): ExportData {
  return {
    title: "Audit Log Report",
    metadata: {
      "Generated": new Date().toLocaleString(),
      "Total Entries": logs.length,
      "Date Range": logs.length > 0 
        ? `${new Date(logs[logs.length - 1].timestamp).toLocaleDateString()} - ${new Date(logs[0].timestamp).toLocaleDateString()}`
        : "N/A"
    },
    headers: [
      "Timestamp",
      "User",
      "Role",
      "Action",
      "Category",
      "IP Address",
      "Status"
    ],
    rows: logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.userName,
      log.userRole,
      log.action,
      log.category,
      log.ipAddress,
      log.success ? "Success" : "Failed"
    ])
  }
}

