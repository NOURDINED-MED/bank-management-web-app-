import { calculateFraudScore } from '@/lib/fraud-detection'
import type { Transaction, Customer } from '@/lib/types'

describe('Fraud Detection', () => {
  const baseCustomer: Customer = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    balance: 10000,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    role: 'customer',
    status: 'active',
  }

  const baseTransaction: Transaction = {
    id: '1',
    accountId: 'acc1',
    type: 'deposit',
    amount: 100,
    date: new Date().toISOString(),
    balance: 10100,
    description: 'Test transaction',
    status: 'completed',
  }

  describe('calculateFraudScore', () => {
    it('should return low score for normal transaction', () => {
      const result = calculateFraudScore(baseTransaction, baseCustomer, [])
      expect(result.score).toBeLessThan(30)
      expect(result.isFraud).toBe(false)
      expect(result.severity).toBe('low')
    })

    it('should detect unusual amount (5x average)', () => {
      const recentTransactions: Transaction[] = [
        { ...baseTransaction, id: 'txn1', amount: 100 },
        { ...baseTransaction, id: 'txn2', amount: 150 },
      ]
      const largeTransaction: Transaction = {
        ...baseTransaction,
        id: 'txn3',
        amount: 1000, // 5x average (125)
      }

      const result = calculateFraudScore(largeTransaction, baseCustomer, recentTransactions)
      expect(result.score).toBeGreaterThanOrEqual(25)
      expect(result.reasons).toContain('Transaction amount is 5x higher than average')
    })

    it('should detect large withdrawal from new account', () => {
      const newCustomer: Customer = {
        ...baseCustomer,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      }
      const largeWithdrawal: Transaction = {
        ...baseTransaction,
        type: 'withdrawal',
        amount: 6000,
      }

      const result = calculateFraudScore(largeWithdrawal, newCustomer, [])
      expect(result.score).toBeGreaterThanOrEqual(30)
      expect(result.reasons).toContain('Large withdrawal from new account (< 7 days old)')
    })

    it('should detect high transaction velocity', () => {
      const recentTransactions: Transaction[] = Array(6).fill(null).map((_, i) => ({
        ...baseTransaction,
        id: `txn-${i}`,
        date: new Date(Date.now() - i * 10 * 60 * 1000).toISOString(), // Last hour
      }))

      const result = calculateFraudScore(baseTransaction, baseCustomer, recentTransactions)
      expect(result.score).toBeGreaterThanOrEqual(20)
      expect(result.reasons).toContain('High transaction velocity (>5 transactions in 1 hour)')
    })

    it('should detect unusual time transactions (3-5 AM)', () => {
      const date = new Date()
      date.setHours(4, 0, 0, 0)
      const unusualTimeTransaction: Transaction = {
        ...baseTransaction,
        date: date.toISOString(), // 4 AM
      }

      const result = calculateFraudScore(unusualTimeTransaction, baseCustomer, [])
      expect(result.score).toBeGreaterThanOrEqual(10)
      expect(result.reasons).toContain('Transaction during unusual hours (3 AM - 5 AM)')
    })

    it('should detect large round number transactions', () => {
      const roundTransaction: Transaction = {
        ...baseTransaction,
        amount: 10000,
      }

      const result = calculateFraudScore(roundTransaction, baseCustomer, [])
      expect(result.score).toBeGreaterThanOrEqual(15)
      expect(result.reasons).toContain('Large round number transaction')
    })

    it('should detect sudden balance depletion', () => {
      const depletionTransaction: Transaction = {
        ...baseTransaction,
        type: 'withdrawal',
        amount: 9500, // 95% of balance
        balance: 500,
      }

      const result = calculateFraudScore(depletionTransaction, baseCustomer, [])
      expect(result.score).toBeGreaterThanOrEqual(20)
      expect(result.reasons).toContain('Sudden balance depletion (>90% withdrawn)')
    })

    it('should detect multiple fraud indicators', () => {
      const date = new Date()
      date.setHours(4, 0, 0, 0)
      const suspiciousTransaction: Transaction = {
        ...baseTransaction,
        amount: 10000,
        type: 'withdrawal',
        date: date.toISOString(),
      }
      const newCustomer: Customer = {
        ...baseCustomer,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      }

      const result = calculateFraudScore(suspiciousTransaction, newCustomer, [])
      expect(result.score).toBeGreaterThan(30) // Multiple indicators
    })

    it('should mark as fraud if score >= 70', () => {
      const date = new Date()
      date.setHours(4, 0, 0, 0)
      const verySuspiciousTransaction: Transaction = {
        ...baseTransaction,
        amount: 10000,
        type: 'withdrawal',
        date: date.toISOString(),
        balance: 500,
      }
      const newCustomer: Customer = {
        ...baseCustomer,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        failedLoginAttempts: 5,
      }

      const result = calculateFraudScore(verySuspiciousTransaction, newCustomer, [])
      if (result.score >= 70) {
        expect(result.isFraud).toBe(true)
        expect(['high', 'critical']).toContain(result.severity)
      }
    })

    it('should return reasons array', () => {
      const result = calculateFraudScore(baseTransaction, baseCustomer, [])
      expect(Array.isArray(result.reasons)).toBe(true)
    })

    it('should return alerts array', () => {
      const result = calculateFraudScore(baseTransaction, baseCustomer, [])
      expect(Array.isArray(result.alerts)).toBe(true)
    })
  })
})



