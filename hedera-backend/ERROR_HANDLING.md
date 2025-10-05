# Error Handling Documentation

## Overview

The Hedera Testnet Backend implements comprehensive global error handling through a custom `HttpExceptionFilter` that catches all exceptions and formats them consistently.

## Features

### 1. Consistent Error Response Format

All errors return a standardized `ErrorResponseDto` structure:

```json
{
  "statusCode": 404,
  "message": "Report not found",
  "error": "Not Found",
  "timestamp": "2025-10-04T12:00:00.000Z",
  "path": "/api/v1/reports/550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. HTTP Status Code Mapping

The filter automatically maps exception types to appropriate HTTP status codes:

- **ValidationException** → 422 (Unprocessable Entity)
- **NotFoundException** → 404 (Not Found)
- **ServiceUnavailableException** → 503 (Service Unavailable)
- **BadRequestException** → 400 (Bad Request)
- **InternalServerErrorException** → 500 (Internal Server Error)

### 3. Sensitive Information Protection

The filter automatically sanitizes error messages to prevent exposure of:

- **Private Keys**: Hex strings 64+ characters are replaced with `[REDACTED_SENSITIVE_DATA]`
- **Connection Strings**: MongoDB URIs are replaced with `mongodb://[REDACTED]`
- **API Keys/Tokens**: Patterns like `api_key`, `token`, `secret`, `password` are replaced with `[REDACTED_CREDENTIALS]`

### 4. Logging

The filter logs errors with appropriate severity levels:

- **5xx errors**: Logged as ERROR with full details
- **4xx errors**: Logged as WARN with request details
- **Unexpected errors**: Logged as ERROR with stack traces

## Usage Examples

### Throwing Exceptions in Services

```typescript
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

// Not Found (404)
throw new NotFoundException('Report not found');

// Unprocessable Entity (422)
throw new UnprocessableEntityException('Please set your Hedera account ID');

// Service Unavailable (503)
throw new ServiceUnavailableException('AI Detection service is currently unavailable');

// Bad Request (400)
throw new BadRequestException('Invalid image file');

// Internal Server Error (500)
throw new InternalServerErrorException('Failed to process blockchain transaction');
```

### Validation Errors

The global `ValidationPipe` automatically throws `BadRequestException` for invalid DTOs:

```typescript
// If userId is missing or invalid, returns:
{
  "statusCode": 400,
  "message": "userId must be a string, userId should not be empty",
  "error": "Bad Request",
  "timestamp": "2025-10-04T12:00:00.000Z",
  "path": "/api/v1/reports"
}
```

## Testing

The filter includes comprehensive unit tests covering:

- All HTTP exception types
- Error response structure validation
- Sensitive information sanitization
- Non-HTTP exception handling
- Validation error handling

Run tests with:

```bash
npm test -- http-exception.filter.spec.ts
```

## Security Considerations

1. **Never expose sensitive data**: The filter automatically sanitizes error messages
2. **Stack traces**: Only logged server-side, never sent to clients
3. **Generic 500 errors**: Unexpected errors return generic "Internal server error" message
4. **Detailed logging**: Full error details are logged for debugging while keeping client responses safe

## Configuration

The filter is applied globally in `main.ts`:

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

No additional configuration is required.
