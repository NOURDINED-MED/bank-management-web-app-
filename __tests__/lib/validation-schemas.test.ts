import {
  sanitizeString,
  sanitizeAmount,
  isValidEmail,
  isValidSSN,
  maskEmail,
  maskPhone,
  maskSSN,
  maskCardNumber,
} from '@/lib/validation-schemas'

describe('Validation Schemas - Utility Functions', () => {
  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)')
    })

    it('should remove event handlers', () => {
      const result = sanitizeString('onclick=evil()')
      expect(result).not.toContain('onclick')
      expect(result).toContain('evil()')
    })

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello')
    })

    it('should handle normal strings', () => {
      expect(sanitizeString('normal text')).toBe('normal text')
    })

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('')
    })
  })

  describe('sanitizeAmount', () => {
    it('should return absolute value', () => {
      expect(sanitizeAmount(-100)).toBe(100)
      expect(sanitizeAmount(100)).toBe(100)
    })

    it('should round to 2 decimal places', () => {
      expect(sanitizeAmount(100.999)).toBe(101)
      expect(sanitizeAmount(100.123)).toBe(100.12)
      expect(sanitizeAmount(100.125)).toBe(100.13)
    })

    it('should handle zero', () => {
      expect(sanitizeAmount(0)).toBe(0)
    })

    it('should handle very small amounts', () => {
      expect(sanitizeAmount(0.001)).toBe(0)
      expect(sanitizeAmount(0.005)).toBe(0.01)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.com')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('test @example.com')).toBe(false)
    })
  })

  describe('isValidSSN', () => {
    it('should validate full SSN format', () => {
      expect(isValidSSN('123-45-6789')).toBe(true)
      expect(isValidSSN('123456789')).toBe(true)
    })

    it('should validate last 4 digits', () => {
      expect(isValidSSN('6789')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(isValidSSN('123-45-67')).toBe(false)
      expect(isValidSSN('abc-45-6789')).toBe(false)
      expect(isValidSSN('12345678')).toBe(false)
    })
  })

  describe('maskEmail', () => {
    it('should mask email addresses', () => {
      expect(maskEmail('test@example.com')).toBe('te***@example.com')
      expect(maskEmail('user@example.com')).toBe('us***@example.com')
    })

    it('should handle short usernames', () => {
      expect(maskEmail('ab@example.com')).toBe('**@example.com')
      expect(maskEmail('a@example.com')).toBe('**@example.com')
    })

    it('should preserve domain', () => {
      const result = maskEmail('test@example.com')
      expect(result).toContain('@example.com')
    })
  })

  describe('maskPhone', () => {
    it('should mask phone numbers', () => {
      expect(maskPhone('1234567890')).toBe('******7890')
      expect(maskPhone('1234567890123')).toBe('*********0123')
    })

    it('should show last 4 digits', () => {
      const result = maskPhone('1234567890')
      expect(result).toContain('7890')
    })
  })

  describe('maskSSN', () => {
    it('should mask SSN', () => {
      expect(maskSSN('123-45-6789')).toBe('***-**-6789')
      expect(maskSSN('123456789')).toBe('***-**-6789')
    })

    it('should show last 4 digits', () => {
      const result = maskSSN('123-45-6789')
      expect(result).toContain('6789')
    })
  })

  describe('maskCardNumber', () => {
    it('should mask card numbers', () => {
      expect(maskCardNumber('1234567890123456')).toBe('1234 **** **** 3456')
      expect(maskCardNumber('123456789012345')).toBe('1234 **** **** 2345')
    })

    it('should handle card numbers with spaces', () => {
      expect(maskCardNumber('1234 5678 9012 3456')).toBe('1234 **** **** 3456')
    })

    it('should show first 4 and last 4 digits', () => {
      const result = maskCardNumber('1234567890123456')
      expect(result).toContain('1234')
      expect(result).toContain('3456')
    })
  })
})

