/**
 * Keyboard Shortcuts System
 * Provides fast keyboard navigation for teller operations
 */

export interface ShortcutHandler {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  description: string
  handler: () => void
  category: string
}

const shortcuts: ShortcutHandler[] = []

/**
 * Register a keyboard shortcut
 */
export function registerShortcut(shortcut: ShortcutHandler): void {
  shortcuts.push(shortcut)
}

/**
 * Unregister a keyboard shortcut
 */
export function unregisterShortcut(key: string): void {
  const index = shortcuts.findIndex(s => s.key === key)
  if (index > -1) {
    shortcuts.splice(index, 1)
  }
}

/**
 * Get all registered shortcuts
 */
export function getAllShortcuts(): ShortcutHandler[] {
  return shortcuts
}

/**
 * Check if event matches a shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutHandler): boolean {
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
  const ctrlMatch = event.ctrlKey === (shortcut.ctrlKey || false)
  const shiftMatch = event.shiftKey === (shortcut.shiftKey || false)
  const altMatch = event.altKey === (shortcut.altKey || false)
  
  return keyMatch && ctrlMatch && shiftMatch && altMatch
}

/**
 * Initialize keyboard shortcuts listener
 */
export function initializeShortcuts(): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault()
        shortcut.handler()
        break
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)

  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: ShortcutHandler): string {
  const parts: string[] = []
  
  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.shiftKey) parts.push('Shift')
  if (shortcut.altKey) parts.push('Alt')
  parts.push(shortcut.key.toUpperCase())
  
  return parts.join(' + ')
}

/**
 * Default teller shortcuts configuration
 */
export const DEFAULT_TELLER_SHORTCUTS = [
  {
    key: 'd',
    ctrlKey: true,
    description: 'Quick Deposit',
    category: 'Transaction'
  },
  {
    key: 'w',
    ctrlKey: true,
    description: 'Quick Withdrawal',
    category: 'Transaction'
  },
  {
    key: 't',
    ctrlKey: true,
    description: 'Quick Transfer',
    category: 'Transaction'
  },
  {
    key: 'f',
    ctrlKey: true,
    description: 'Search Customer',
    category: 'Search'
  },
  {
    key: 'q',
    ctrlKey: true,
    description: 'View Queue',
    category: 'Navigation'
  },
  {
    key: 'c',
    ctrlKey: true,
    shiftKey: true,
    description: 'Cash Drawer',
    category: 'Navigation'
  },
  {
    key: 'm',
    ctrlKey: true,
    description: 'Messages',
    category: 'Navigation'
  },
  {
    key: 'h',
    ctrlKey: true,
    description: 'Show Help',
    category: 'Other'
  },
  {
    key: 'Escape',
    description: 'Close Dialog',
    category: 'Navigation'
  }
]

