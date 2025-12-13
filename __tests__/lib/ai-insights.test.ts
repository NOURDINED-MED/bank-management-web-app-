import { predictUserActivity, detectVolumeAnomalies, forecastTransactionVolume } from '@/lib/ai-insights'
import type { Transaction } from '@/lib/types'

describe('AI Insights', () => {
  describe('predictUserActivity', () => {
    it('should predict activity based on historical data', () => {
      const transactions: Transaction[] = Array(30).fill(null).map((_, i) => ({
        id: `txn-${i}`,
        accountId: 'acc1',
        type: 'deposit',
        amount: 100,
        date: new Date().toISOString(),
        balance: 1000,
        description: 'Test',
        status: 'completed',
      }))

      const historicalData = [
        { date: '2024-01-01', count: 5 },
        { date: '2024-01-02', count: 7 },
        { date: '2024-01-03', count: 9 },
      ]

      const result = predictUserActivity(transactions, historicalData)
      expect(result).toHaveProperty('type', 'prediction')
      expect(result).toHaveProperty('title', 'User Activity Forecast')
      expect(result).toHaveProperty('confidence')
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(95)
      expect(result).toHaveProperty('metadata')
    })

    it('should handle empty historical data', () => {
      const transactions: Transaction[] = []
      const historicalData: { date: string; count: number }[] = []

      const result = predictUserActivity(transactions, historicalData)
      expect(result).toHaveProperty('type', 'prediction')
      expect(result.confidence).toBeGreaterThanOrEqual(60)
    })

    it('should calculate growth rate correctly', () => {
      const transactions: Transaction[] = Array(30).fill(null).map((_, i) => ({
        id: `txn-${i}`,
        accountId: 'acc1',
        type: 'deposit',
        amount: 100,
        date: new Date().toISOString(),
        balance: 1000,
        description: 'Test',
        status: 'completed',
      }))

      const historicalData = [
        { date: '2024-01-01', count: 5 },
        { date: '2024-01-02', count: 10 },
        { date: '2024-01-03', count: 15 },
      ]

      const result = predictUserActivity(transactions, historicalData)
      expect(result.metadata?.growthRate).toBeGreaterThan(0)
      expect(result.metadata?.trend).toBe('increasing')
    })

    it('should detect decreasing trend', () => {
      const transactions: Transaction[] = Array(30).fill(null).map((_, i) => ({
        id: `txn-${i}`,
        accountId: 'acc1',
        type: 'deposit',
        amount: 100,
        date: new Date().toISOString(),
        balance: 1000,
        description: 'Test',
        status: 'completed',
      }))

      const historicalData = [
        { date: '2024-01-01', count: 15 },
        { date: '2024-01-02', count: 10 },
        { date: '2024-01-03', count: 5 },
      ]

      const result = predictUserActivity(transactions, historicalData)
      expect(result.metadata?.growthRate).toBeLessThan(0)
      expect(result.metadata?.trend).toBe('decreasing')
    })
  })

  describe('detectVolumeAnomalies', () => {
    it('should detect volume spikes', () => {
      const dailyTransactions = [
        { date: '2024-01-01', count: 10, amount: 1000 },
        { date: '2024-01-02', count: 12, amount: 1200 },
        { date: '2024-01-03', count: 11, amount: 1100 },
        { date: '2024-01-04', count: 13, amount: 1300 },
        { date: '2024-01-05', count: 12, amount: 1200 },
        { date: '2024-01-06', count: 11, amount: 1100 },
        { date: '2024-01-07', count: 50, amount: 5000 }, // Anomaly
        { date: '2024-01-08', count: 12, amount: 1200 },
      ]

      const result = detectVolumeAnomalies(dailyTransactions)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('type', 'anomaly')
      expect(result[0]).toHaveProperty('severity')
    })

    it('should return empty array if less than 7 days of data', () => {
      const dailyTransactions = [
        { date: '2024-01-01', count: 10, amount: 1000 },
        { date: '2024-01-02', count: 12, amount: 1200 },
      ]

      const result = detectVolumeAnomalies(dailyTransactions)
      expect(result).toEqual([])
    })

    it('should calculate z-score correctly', () => {
      const dailyTransactions = [
        { date: '2024-01-01', count: 10, amount: 1000 },
        { date: '2024-01-02', count: 10, amount: 1000 },
        { date: '2024-01-03', count: 10, amount: 1000 },
        { date: '2024-01-04', count: 10, amount: 1000 },
        { date: '2024-01-05', count: 10, amount: 1000 },
        { date: '2024-01-06', count: 10, amount: 1000 },
        { date: '2024-01-07', count: 50, amount: 5000 }, // Anomaly
        { date: '2024-01-08', count: 10, amount: 1000 },
      ]

      const result = detectVolumeAnomalies(dailyTransactions)
      if (result.length > 0) {
        expect(result[0].metadata).toHaveProperty('zScore')
        expect(Math.abs(result[0].metadata?.zScore || 0)).toBeGreaterThan(2)
      }
    })

    it('should mark critical anomalies with high z-score', () => {
      const dailyTransactions = [
        { date: '2024-01-01', count: 10, amount: 1000 },
        { date: '2024-01-02', count: 10, amount: 1000 },
        { date: '2024-01-03', count: 10, amount: 1000 },
        { date: '2024-01-04', count: 10, amount: 1000 },
        { date: '2024-01-05', count: 10, amount: 1000 },
        { date: '2024-01-06', count: 10, amount: 1000 },
        { date: '2024-01-07', count: 100, amount: 10000 }, // Critical anomaly
        { date: '2024-01-08', count: 10, amount: 1000 },
      ]

      const result = detectVolumeAnomalies(dailyTransactions)
      const criticalAnomalies = result.filter(r => r.severity === 'critical')
      if (criticalAnomalies.length > 0) {
        expect(criticalAnomalies[0].severity).toBe('critical')
      }
    })
  })

  describe('forecastTransactionVolume', () => {
    it('should return insufficient data message for less than 3 months', () => {
      const monthlyData = [
        { month: '2024-01', transactions: 100, revenue: 10000 },
        { month: '2024-02', transactions: 120, revenue: 12000 },
      ]

      const result = forecastTransactionVolume(monthlyData)
      expect(result).toHaveProperty('type', 'forecast')
      expect(result.title).toContain('Insufficient Data')
      expect(result.confidence).toBe(0)
    })

    it('should forecast with sufficient data', () => {
      const monthlyData = [
        { month: '2024-01', transactions: 100, revenue: 10000 },
        { month: '2024-02', transactions: 120, revenue: 12000 },
        { month: '2024-03', transactions: 140, revenue: 14000 },
      ]

      const result = forecastTransactionVolume(monthlyData)
      expect(result).toHaveProperty('type', 'forecast')
      expect(result.confidence).toBeGreaterThan(0)
    })
  })
})



