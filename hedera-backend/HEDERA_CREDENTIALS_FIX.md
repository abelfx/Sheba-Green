# Hedera Credentials Graceful Handling

## Problem
The application was crashing on startup with the error:
```
Error: failed to parse entity id: 0.0.XXXXXX
```

This occurred because the HederaService was trying to initialize with placeholder credentials from the `.env` file during application startup.

## Root Cause
The `HederaService.initializeClient()` method was:
1. Throwing an error if credentials were missing
2. Not validating if credentials were placeholder values (containing "XXXX")
3. Not handling parsing errors gracefully

This prevented the application from starting, even though Hedera functionality is optional for viewing Swagger documentation.

## Solution
Updated `HederaService` to handle missing/invalid credentials gracefully:

### 1. Enhanced Credential Validation
```typescript
if (
  !operatorIdStr ||
  !operatorKeyStr ||
  operatorIdStr.includes('XXXX') ||
  operatorKeyStr.includes('XXXX')
) {
  this.logger.warn(
    'Hedera credentials not configured. Hedera functionality will be unavailable. ' +
      'Please set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_PRIVATE_KEY in .env file.',
  );
  return;
}
```

### 2. Try-Catch for Initialization
Wrapped the client initialization in a try-catch block to handle parsing errors gracefully.

### 3. Client Availability Checks
Added checks in all methods that use the Hedera client:
- `ensureShebaToken()`
- `ensureHcsTopic()`
- `getAccountBalance()`
- `createDIDForUser()`
- `checkHealth()`

Each method now throws a clear error message if the client is not initialized, rather than causing a null reference error.

## Benefits

### For Development
- Application starts successfully even without Hedera credentials
- Swagger documentation is accessible for API exploration
- Frontend developers can view API contracts without backend setup
- Clear warning messages indicate what's missing

### For Production
- Proper error messages when Hedera operations are attempted without credentials
- Health check endpoint correctly reports Hedera service as unavailable
- No silent failures or confusing error messages

## Testing

### Without Hedera Credentials
```bash
# Application starts successfully
npm run start:dev

# Swagger UI accessible
open http://localhost:3000/api/docs

# Health check shows Hedera as unavailable
curl http://localhost:3000/health
# Returns: {"status":"unhealthy","hedera":false,...}
```

### With Valid Hedera Credentials
```bash
# Update .env with real credentials
HEDERA_OPERATOR_ID=0.0.123456
HEDERA_OPERATOR_PRIVATE_KEY=302e020100300506032b657004220420...

# Application starts and initializes Hedera client
npm run start:dev
# Logs: "Hedera client initialized for testnet with operator 0.0.123456"

# All Hedera operations work normally
```

## Verified Endpoints
All 8 API endpoints are now accessible in Swagger:
- ✅ POST /api/v1/reports
- ✅ GET /api/v1/reports/:id
- ✅ POST /api/v1/verifications
- ✅ POST /api/v1/users
- ✅ GET /api/v1/users/:userId/balance
- ✅ POST /api/v1/dids
- ✅ GET /api/v1/hcs/logs
- ✅ GET /health

## Next Steps

To enable full Hedera functionality:
1. Create a Hedera testnet account at https://portal.hedera.com
2. Get your Account ID and Private Key
3. Update `.env` file with real credentials
4. Restart the application
