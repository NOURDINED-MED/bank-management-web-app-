# BAMS Unit Tests

This directory contains unit tests for the Banking Management System (BAMS).

## Overview

Unit tests focus on testing individual functions and utilities in isolation, without external dependencies like databases or APIs.

## Test Structure

```
__tests__/
└── lib/
    ├── validation-schemas.test.ts    # Validation and sanitization functions
    ├── fraud-detection.test.ts       # Fraud detection algorithms
    ├── utils.test.ts                 # Utility functions
    └── ai-insights.test.ts           # AI prediction and anomaly detection
```

## Running Tests

### Run All Unit Tests
```bash
npm run test:unit
```

### Run Tests in Watch Mode
```bash
npm run test:unit:watch
```

### Run Tests with Coverage
```bash
npm run test:unit:coverage
```

## Test Coverage

### Validation Functions (`validation-schemas.test.ts`)
- ✅ `sanitizeString` - XSS prevention
- ✅ `sanitizeAmount` - Amount validation
- ✅ `isValidEmail` - Email validation
- ✅ `isValidSSN` - SSN validation
- ✅ `maskEmail` - Email masking
- ✅ `maskPhone` - Phone masking
- ✅ `maskSSN` - SSN masking
- ✅ `maskCardNumber` - Card number masking

### Fraud Detection (`fraud-detection.test.ts`)
- ✅ `calculateFraudScore` - Fraud risk calculation
- ✅ Unusual amount detection
- ✅ New account large withdrawal detection
- ✅ High transaction velocity detection
- ✅ Unusual time transaction detection
- ✅ Round number transaction detection
- ✅ Balance depletion detection
- ✅ Multiple fraud indicators

### Utility Functions (`utils.test.ts`)
- ✅ `cn` - Class name merging (Tailwind CSS)

### AI Insights (`ai-insights.test.ts`)
- ✅ `predictUserActivity` - User activity prediction
- ✅ `detectVolumeAnomalies` - Transaction volume anomaly detection
- ✅ `forecastTransactionVolume` - Volume forecasting

## Test Results

**Current Status:** ✅ All 53 tests passing

```
Test Suites: 4 passed, 4 total
Tests:       53 passed, 53 total
```

## Writing New Tests

### Test File Structure
```typescript
import { functionToTest } from '@/lib/module'

describe('Module Name', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      const result = functionToTest(input)
      expect(result).toBe(expectedOutput)
    })
  })
})
```

### Best Practices
1. **Test one thing at a time** - Each test should verify a single behavior
2. **Use descriptive names** - Test names should clearly describe what they test
3. **Arrange-Act-Assert** - Structure tests with setup, execution, and verification
4. **Test edge cases** - Include tests for boundary conditions and error cases
5. **Keep tests independent** - Tests should not depend on each other

## Coverage Goals

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

## Integration with CI/CD

These unit tests can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Unit Tests
  run: npm run test:unit:coverage
```

## Notes

- Unit tests run quickly (< 1 second)
- No external dependencies required
- Tests are isolated and can run in any order
- Coverage reports are generated in `coverage/` directory



