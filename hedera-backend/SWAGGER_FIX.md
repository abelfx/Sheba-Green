# Swagger Endpoints Fix

## Problem
The Swagger UI was showing tags (Reports, Verifications, Users, DIDs, HCS, Health) but no actual endpoints were visible. Only the default "App" controller was showing.

## Root Cause
The `AppModule` was not properly configured with all the feature controllers, services, repositories, and schemas. It only had the default `AppController` registered.

## Solution
Updated `src/app.module.ts` to include:

### 1. Controllers
All feature controllers are now registered:
- `ReportsController` - Trash cleanup report endpoints
- `VerificationsController` - Cleanup verification endpoints
- `UsersController` - User management endpoints
- `DidsController` - DID management endpoints
- `HcsController` - HCS message log endpoints
- `HealthController` - Health check endpoint

### 2. Services
All business logic services are now registered:
- `FileStorageService` - File upload handling
- `DetectionService` - AI detection integration
- `HederaService` - Hedera blockchain integration
- `ReportService` - Report business logic
- `VerificationService` - Verification business logic
- `UserService` - User business logic
- `DidService` - DID business logic

### 3. Repositories
All data access repositories are now registered:
- `UserRepository`
- `ReportRepository`
- `TokenRepository`
- `HcsMessageRepository`

### 4. Mongoose Schemas
All MongoDB schemas are now registered with MongooseModule.forFeature:
- `User` schema
- `Report` schema
- `Token` schema
- `HcsMessage` schema

### 5. Additional Modules
- `HttpModule` - For HTTP client (axios) used by DetectionService
- `MulterModule` - For file upload handling

## Verification
1. Build succeeds: ✅ `npm run build`
2. All controllers properly imported: ✅
3. All dependencies properly wired: ✅
4. Swagger decorators in place: ✅

## Additional Fix: Hedera Credentials Handling

The application was also crashing due to placeholder Hedera credentials in `.env`. Updated `HederaService` to:
- Detect placeholder credentials (containing "XXXX")
- Log a warning instead of crashing
- Allow the application to start without Hedera credentials
- Provide clear error messages when Hedera operations are attempted

This allows developers to:
- View Swagger documentation without Hedera setup
- Test non-Hedera endpoints
- Explore the API structure

See `HEDERA_CREDENTIALS_FIX.md` for details.

## Testing
To verify the fix:

1. Start the application (MongoDB and Hedera credentials are optional for viewing Swagger):
   ```bash
   npm run start:dev
   ```
2. Open Swagger UI:
   ```
   http://localhost:3000/api/docs
   ```
3. You should now see all endpoints under their respective tags:
   - **Reports**: POST /api/v1/reports, GET /api/v1/reports/:id
   - **Verifications**: POST /api/v1/verifications
   - **Users**: POST /api/v1/users, GET /api/v1/users/:userId/balance
   - **DIDs**: POST /api/v1/dids
   - **HCS**: GET /api/v1/hcs/logs
   - **Health**: GET /health

## Expected Result
All 8 endpoints should now be visible and documented in the Swagger UI with:
- Request/response schemas
- Example values
- Multipart/form-data support for file uploads
- Proper error responses
- Interactive "Try it out" functionality
