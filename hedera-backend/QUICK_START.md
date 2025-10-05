# Quick Start Guide

## View Swagger Documentation (No Setup Required)

The easiest way to explore the API:

```bash
# Start the application
npm run start:dev

# Open Swagger UI in your browser
open http://localhost:3000/api/docs
```

The application will start successfully even without MongoDB or Hedera credentials. You'll see warnings in the logs, but the Swagger documentation will be fully accessible.

## What You'll See in Swagger

### Reports
- **POST /api/v1/reports** - Create a trash cleanup report with before image
- **GET /api/v1/reports/:id** - Retrieve a specific report

### Verifications
- **POST /api/v1/verifications** - Verify cleanup with after image and receive rewards

### Users
- **POST /api/v1/users** - Register a new user
- **GET /api/v1/users/:userId/balance** - Get user's Sheba token balance

### DIDs
- **POST /api/v1/dids** - Create a decentralized identifier for a user

### HCS
- **GET /api/v1/hcs/logs** - Get recent Hedera Consensus Service messages

### Health
- **GET /health** - Check system health status

## Full Setup (For Testing Endpoints)

If you want to actually test the endpoints (not just view documentation):

### 1. MongoDB
```bash
# Install MongoDB (if not already installed)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

### 2. Detection Service (Optional)
The AI detection service is optional. If not running, detection-related endpoints will return errors.

See `../detection-backend/README.md` for setup instructions.

### 3. Hedera Credentials (Optional)
Hedera functionality is optional. If not configured, Hedera-related operations will fail gracefully.

To enable Hedera:
1. Create account at https://portal.hedera.com
2. Update `.env`:
   ```
   HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
   HEDERA_OPERATOR_PRIVATE_KEY=YOUR_PRIVATE_KEY
   ```

### 4. Start the Application
```bash
npm run start:dev
```

## Testing Individual Endpoints

### Create a User
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "displayName": "John Doe",
    "hederaAccountId": "0.0.123456"
  }'
```

### Create a Report (with file upload)
```bash
curl -X POST http://localhost:3000/api/v1/reports \
  -F "userId=user123" \
  -F "beforeImage=@/path/to/image.jpg"
```

### Check Health
```bash
curl http://localhost:3000/health
```

## Development Tips

### Watch Mode
```bash
npm run start:dev
```
Auto-reloads on file changes.

### Build
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Check connection string in .env
MONGO_URI=mongodb://localhost:27017/hedera-mvp
```

### Hedera Errors
If you see Hedera-related errors but don't need Hedera functionality:
- Ignore the warnings - the app will work fine
- Hedera endpoints will return appropriate error messages
- Health check will show `hedera: false`

## Next Steps

1. **Frontend Integration**: Use the Swagger documentation to understand request/response formats
2. **API Testing**: Use the "Try it out" feature in Swagger UI
3. **Generate Client**: Export OpenAPI spec from `/api/docs-json` to generate client SDKs
4. **Production Setup**: Configure all services (MongoDB, Hedera, Detection) for full functionality
