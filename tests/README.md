# BAMS Test Suite

This directory contains comprehensive test files for the Banking Management System (BAMS).

## Prerequisites

Before running the tests, make sure:
1. Next.js development server is running: `npm run dev`
2. Server should be accessible on `http://localhost:3000`
3. Supabase is configured and accessible

## Test Files

### 1. `test_1_server.cjs` - Server Connection
Tests if the Next.js server is running and accessible.

**Run:** `npm run test:server`

### 2. `test_2_users.cjs` - User Data Retrieval
Tests API endpoints for retrieving user, customer, and transaction data.

**Run:** `npm run test:users`

### 3. `test_3_crud.cjs` - CRUD Operations
Tests Create, Read, Update, Delete operations on transactions, customers, and users.

**Run:** `npm run test:crud`

### 4. `test_4_integration.cjs` - Integration Testing
Tests integration between different API endpoints and data flow.

**Run:** `npm run test:integration`

### 5. `test_5_performance.cjs` - Performance Testing
Measures response times for API endpoints (target: <500ms average).

**Run:** `npm run test:performance`

### 6. `test_6_load.cjs` - Load Testing
Tests system under concurrent load (100 concurrent users by default).

**Run:** `npm run test:load`

**Note:** You can modify `CONCURRENT_USERS` variable in the file to change load.

### 7. `test_7_data.cjs` - Data Volume Testing
Tests system with high data volume requests.

**Run:** `npm run test:data`

**Note:** You can modify `ITEMS_TO_TEST` variable in the file to change volume.

### 8. `test_8_system.cjs` - System Testing
Tests overall system functionality including data persistence and transaction flows.

**Run:** `npm run test:system`

### 9. `test_9_maintainability.cjs` - Maintainability Testing
Checks project structure, code metrics, dependencies, and configuration files.

**Run:** `npm run test:maintainability`

### 10. `test_10_security.cjs` - Security Testing
Tests role-based access control, input validation, and API authentication requirements.

**Run:** `npm run test:security`

### 11. `test_11_regression.cjs` - Regression Testing
Verifies project files existence, configuration integrity, and key API routes.

**Run:** `npm run test:regression`

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Individual Tests
```bash
npm run test:server
npm run test:users
npm run test:crud
# ... etc
```

## Test Results

Each test will output:
- `[PASS]` - Test passed
- `[FAIL]` - Test failed
- `[INFO]` - Informational message
- `[WARN]` - Warning message
- `[ERROR]` - Error occurred

At the end of each test, you'll see a summary:
```
========================================
  RESULT: X passed, Y failed
========================================
```

## Notes

- Most API tests require authentication. Tests will show `[PASS]` if endpoints correctly require auth (status 400/403).
- Some tests may show `[INFO]` if the server is not running - this is expected if you haven't started the dev server.
- Performance and load tests can be adjusted by modifying variables in the test files.
- Maintainability and regression tests check file structure and don't require the server to be running.

## Troubleshooting

### Tests fail with "Connection refused"
- Make sure `npm run dev` is running
- Check that the server is on port 3000

### Tests show authentication errors
- This is expected! Tests verify that endpoints require authentication
- Status codes 400/403 indicate proper security

### Load tests are slow
- Reduce `CONCURRENT_USERS` in `test_6_load.cjs`
- Reduce `ITEMS_TO_TEST` in `test_7_data.cjs`



