# Hedera Testnet Backend MVP

A NestJS-based backend service for the Hedera Testnet trash cleanup verification system. This application enables users to report trash cleanup activities, verify them through AI detection, and receive Sheba token rewards on the Hedera network.

## Features

- User management with Hedera account integration
- Trash detection using AI service
- Cleanup verification with image analysis
- Hedera Token Service (HTS) integration for Sheba token rewards
- Hedera Consensus Service (HCS) for immutable verification logging
- Decentralized Identity (DID) creation and management
- MongoDB for application data persistence
- OpenAPI/Swagger documentation

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Hedera testnet account with HBAR balance
- AI Detection service running (see detection-backend)

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd hedera-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration:
- `HEDERA_OPERATOR_ID`: Your Hedera testnet account ID
- `HEDERA_OPERATOR_PRIVATE_KEY`: Your Hedera testnet private key
- `MONGO_URI`: MongoDB connection string
- `DETECTION_API_URL`: URL of the AI detection service

## Running the Application

### Start MongoDB

First, ensure MongoDB is running:

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Manual start:**
```bash
mongod --dbpath /path/to/data/directory
```

### Start the Application

**Development Mode (with hot reload):**
```bash
npm run start:dev
```

**Production Mode:**
```bash
npm run build
npm run start:prod
```

The application will start on `http://localhost:3000`

### Verify Installation

Check that all services are healthy:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "mongodb": true,
  "hedera": true,
  "detectionService": true,
  "version": "1.0.0",
  "uptime": 123.45
}
```

## API Documentation

Once the application is running, access the Swagger UI at:
```
http://localhost:3000/api/docs
```

### API Endpoints

#### Health Check
```bash
# Check system health
curl http://localhost:3000/health
```

#### User Management
```bash
# Create a new user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "displayName": "John Doe",
    "hederaAccountId": "0.0.123456",
    "evmAddress": "0x1234567890abcdef"
  }'

# Get user balance
curl http://localhost:3000/api/v1/users/user123/balance
```

#### DID Management
```bash
# Create DID for user
curl -X POST http://localhost:3000/api/v1/dids \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123"
  }'
```

#### Report Management
```bash
# Create a trash report (with image upload)
curl -X POST http://localhost:3000/api/v1/reports \
  -F "userId=user123" \
  -F "beforeImage=@/path/to/trash-image.jpg"

# Get report by ID
curl http://localhost:3000/api/v1/reports/{reportId}
```

#### Cleanup Verification
```bash
# Verify cleanup (with after image)
curl -X POST http://localhost:3000/api/v1/verifications \
  -F "userId=user123" \
  -F "reportId={reportId}" \
  -F "prompt=Take a photo showing the cleaned area" \
  -F "afterImage=@/path/to/clean-image.jpg"
```

#### HCS Logs
```bash
# Get recent HCS logs
curl "http://localhost:3000/api/v1/hcs/logs?limit=10&offset=0"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Application environment | development |
| PORT | Server port | 3000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/hedera-mvp |
| DETECTION_API_URL | AI detection service URL | http://localhost:8000 |
| HEDERA_NETWORK | Hedera network (testnet/mainnet) | testnet |
| HEDERA_OPERATOR_ID | Hedera operator account ID | - |
| HEDERA_OPERATOR_PRIVATE_KEY | Hedera operator private key | - |
| HCS_TOPIC_ID | HCS topic ID (auto-created if empty) | - |
| SHEBA_TOKEN_TICKER | Token symbol | SHEBA |
| SHEBA_TOKEN_NAME | Token name | Sheba |
| SHEBA_REWARD_AMOUNT | Reward amount per verification | 1 |

## Project Structure

```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
├── config/
│   └── configuration.ts         # Configuration factory
├── controllers/                 # HTTP controllers
├── services/                    # Business logic
├── repositories/                # Data access layer
└── models/                      # Database schemas
```

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Troubleshooting

### MongoDB Connection Issues

**Problem:** Application fails to connect to MongoDB

**Solutions:**
- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check the MONGO_URI in your .env file
- Verify MongoDB is listening on the correct port (default: 27017)
- Test connection: `mongosh mongodb://localhost:27017/hedera-mvp`

### Hedera Transaction Failures

**Problem:** Transactions fail with "INSUFFICIENT_TX_FEE" or "INSUFFICIENT_ACCOUNT_BALANCE"

**Solutions:**
- Verify your operator account has sufficient HBAR balance (check at https://hashscan.io/testnet)
- Get free testnet HBAR from the faucet: https://portal.hedera.com/
- Check that HEDERA_OPERATOR_ID and HEDERA_OPERATOR_PRIVATE_KEY are correct
- Ensure you're using testnet credentials for testnet network

**Problem:** "INVALID_SIGNATURE" error

**Solutions:**
- Verify the private key matches the operator account ID
- Ensure the private key is in DER-encoded hex format
- Check for extra spaces or newlines in the .env file

### Detection Service Unavailable

**Problem:** API returns 503 "AI Detection service is currently unavailable"

**Solutions:**
- Verify the detection-backend service is running on port 8000
- Check DETECTION_API_URL is correct in .env
- Test detection service: `curl http://localhost:8000/health` or `curl http://localhost:8000/`
- Ensure the detection service is accessible from the backend

### File Upload Issues

**Problem:** Image upload fails or returns validation error

**Solutions:**
- Ensure the file is a valid image format (JPEG, PNG)
- Check file size is under the limit (10MB)
- Verify the uploads directory exists and has write permissions
- Check multipart/form-data content type is set correctly

### Environment Variable Issues

**Problem:** Application fails to start with configuration errors

**Solutions:**
- Verify all required environment variables are set in .env
- Check for typos in variable names
- Ensure no extra quotes around values
- Copy from .env.example and fill in your values

### Port Already in Use

**Problem:** "Port 3000 is already in use"

**Solutions:**
- Change PORT in .env to a different value (e.g., 3001)
- Kill the process using port 3000: `lsof -ti:3000 | xargs kill -9`
- Check if another instance of the application is running

### Getting Help

If you encounter issues not covered here:
1. Check the application logs for detailed error messages
2. Verify all prerequisites are installed and running
3. Review the Swagger documentation at http://localhost:3000/api/docs
4. Check the health endpoint for service status

## License

UNLICENSED
