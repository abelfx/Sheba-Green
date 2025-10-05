# ShebaGreen Backend API Endpoints

Base URL: `http://localhost:3000`

## Authentication
Most endpoints require Firebase authentication. Include the Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebaseIdToken>
```

---

## Feed Endpoints

### GET /api/v1/feed
Get community feed of verified reports

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20
- `filter` (optional): Filter type - `recent`, `top`, or `nearby`, default `recent`

**Response:**
```json
{
  "page": 1,
  "limit": 20,
  "total": 952,
  "items": [
    {
      "type": "report",
      "reportId": "64fabc...",
      "user": {
        "userId": "user123",
        "displayName": "John"
      },
      "title": "Cleanup Report",
      "summary": "Collected 3 items: plastic, plastic, glass",
      "beforeUrl": "https://res.cloudinary.com/.../before.jpg",
      "afterUrl": "https://res.cloudinary.com/.../after.jpg",
      "tokensAwarded": 10,
      "createdAt": "2025-10-05T12:00:00Z"
    }
  ]
}
```

---

## Leaderboard Endpoints

### GET /api/v1/leaderboard
Get user rankings

**Query Parameters:**
- `period` (optional): Time period - `week`, `month`, or `alltime`, default `alltime`
- `limit` (optional): Number of top users, default 50

**Response:**
```json
{
  "period": "week",
  "items": [
    {
      "rank": 1,
      "userId": "user123",
      "displayName": "John",
      "score": 250,
      "tokens": 120,
      "events": 15
    }
  ]
}
```

---

## Statistics Endpoints

### GET /api/v1/statistics/global
Get global platform statistics

**Response:**
```json
{
  "totalUsers": 1523,
  "totalReports": 4892,
  "totalVerifiedReports": 3456,
  "totalTokensAwarded": 3200,
  "totalWasteCollectedKg": 1250.5,
  "recentActivity": {
    "last24h": 45,
    "last7d": 312,
    "last30d": 1234
  }
}
```

### GET /api/v1/statistics/user/:userId
Get statistics for a specific user

**Parameters:**
- `userId`: User ID (Firebase UID)

**Response:**
```json
{
  "userId": "user123",
  "totalReports": 25,
  "verifiedReports": 22,
  "tokensEarned": 22,
  "rank": 15,
  "wasteCollectedKg": 45.5,
  "joinedAt": "2025-09-01T10:00:00Z",
  "recentReports": [
    {
      "reportId": "64fabc...",
      "createdAt": "2025-10-05T12:00:00Z",
      "verified": true
    }
  ]
}
```

---

## User Endpoints

### POST /api/v1/users
Create or link user after Firebase authentication

**Headers:**
```
Authorization: Bearer <firebaseIdToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user123",
  "displayName": "John Doe",
  "hederaAccountId": "0.0.123456",
  "evmAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Response (201):**
```json
{
  "userId": "user123",
  "displayName": "John Doe",
  "hederaAccountId": "0.0.123456",
  "evmAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "did": "did:hedera:testnet:0.0.123456_user123",
  "createdAt": "2025-10-04T12:00:00.000Z"
}
```

### GET /api/v1/users/:userId/balance
Get user's token balance

**Response:**
```json
{
  "userId": "user123",
  "balance": 150,
  "tokenId": "0.0.98765"
}
```

---

## Report Endpoints

### POST /api/v1/reports
Submit BEFORE image and receive detection + prompt

**Headers:**
```
Authorization: Bearer <firebaseIdToken>
Content-Type: multipart/form-data
```

**Form Data:**
- `beforeImage` (file): Image file (required)
- `userId` (string): User ID (required)

**Response (201):**
```json
{
  "reportId": "64fabc...",
  "randomPrompt": {
    "prompt": "Point to the two items labeled 'plastic' and one glass item.",
    "trash_type": "plastic, plastic, glass",
    "action_required": "photo_verification"
  },
  "detection_result": {
    "detected": true,
    "count": 3,
    "boxes": [
      {
        "class_name": "plastic",
        "confidence": 0.95,
        "bbox": [100, 150, 200, 250]
      }
    ],
    "image_dimensions": { "width": 500, "height": 334 }
  }
}
```

### GET /api/v1/reports/:id
Get report details

**Response:**
```json
{
  "reportId": "64fabc...",
  "userId": "user123",
  "beforeImagePath": "https://res.cloudinary.com/.../before.jpg",
  "afterImagePath": "https://res.cloudinary.com/.../after.jpg",
  "detectionResult": { ... },
  "randomPrompt": { ... },
  "verificationResult": { ... },
  "status": "verified",
  "tokenTxId": "0.0.98765@16965...",
  "hcsMessageId": "0.0.112233@16965...",
  "createdAt": "2025-10-05T12:00:00Z",
  "updatedAt": "2025-10-05T12:05:00Z"
}
```

---

## Verification Endpoints

### POST /api/v1/verifications
Submit AFTER image for verification

**Headers:**
```
Authorization: Bearer <firebaseIdToken>
Content-Type: multipart/form-data
```

**Form Data:**
- `afterImage` (file): Image file (required)
- `reportId` (string): Report ID from previous step (required)

**Response (200):**
```json
{
  "verified": true,
  "verifyReason": "Foot indicates pointing to cleared area; trash removed",
  "cloudinary": {
    "before": {
      "url": "https://res.cloudinary.com/.../before.jpg",
      "publicId": "shebagreen/abc_before"
    },
    "after": {
      "url": "https://res.cloudinary.com/.../after.jpg",
      "publicId": "shebagreen/abc_after"
    }
  },
  "hedera": {
    "topicId": "0.0.112233",
    "auditTxnId": "0.0.112233@16965...",
    "rewardTxnId": "0.0.112234@16965...",
    "rewardTokenId": "0.0.98765",
    "rewardAmount": 10
  },
  "report": {
    "reportId": "64fabc..."
  }
}
```

---

## DID Endpoints

### POST /api/v1/dids
Create DID for user

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "did": "did:hedera:testnet:0.0.123456_user123",
  "userId": "user123",
  "hederaAccountId": "0.0.123456"
}
```

---

## HCS Endpoints

### GET /api/v1/hcs/logs
Get HCS audit logs

**Query Parameters:**
- `limit` (optional): Number of messages to retrieve, default 10

**Response:**
```json
{
  "topicId": "0.0.112233",
  "messages": [
    {
      "consensusTimestamp": "2025-10-05T12:00:00.123456Z",
      "message": "{\"type\":\"verification_audit\",\"reportId\":\"64fabc\"}",
      "sequenceNumber": 1
    }
  ]
}
```

---

## Health Endpoint

### GET /health
Check API health status

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-05T12:00:00Z",
  "services": {
    "database": "connected",
    "hedera": "connected",
    "detection": "connected"
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "2025-10-05T12:00:00Z",
  "path": "/api/v1/reports"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Integration Notes for Next.js Frontend

### 1. Environment Variables
Add to your `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
```

### 2. API Client Example
```typescript
// lib/api.ts
import { getAuth } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAuthToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

export async function getFeed(page = 1, limit = 20) {
  const response = await fetch(
    `${API_URL}/api/v1/feed?page=${page}&limit=${limit}`
  );
  return response.json();
}

export async function createReport(formData: FormData) {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/api/v1/reports`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return response.json();
}

export async function getLeaderboard(period = 'alltime') {
  const response = await fetch(
    `${API_URL}/api/v1/leaderboard?period=${period}`
  );
  return response.json();
}

export async function getUserStats(userId: string) {
  const response = await fetch(
    `${API_URL}/api/v1/statistics/user/${userId}`
  );
  return response.json();
}
```

### 3. Image Upload Example
```typescript
// components/ReportForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('beforeImage', beforeImageFile);
  formData.append('userId', user.uid);
  
  const result = await createReport(formData);
  console.log('Report created:', result);
};
```

---

## Cloudinary Integration

Images are automatically uploaded to Cloudinary after verification. The response includes:
- `url`: Full HTTPS URL to the image
- `publicId`: Cloudinary public ID for the image
- `width` and `height`: Image dimensions
- `hash`: SHA-256 hash for integrity verification

All images are stored in the `shebagreen` folder with organized subfolders by user and report ID.
