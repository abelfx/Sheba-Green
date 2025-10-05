# ShebaGreen — API Documentation (v1)

**Updated:** 2025-10-05 — TypeScript backend (Express), Next.js frontend, FastAPI verifier, Cloudinary storage, MongoDB, Hedera (HCS & HTS), Firebase auth.

This document describes the complete API surface, request/response schemas, database models, flows and examples for ShebaGreen. It reflects the requirement that images are sent to your FastAPI verifier as raw files, then — **after verification** — saved to **Cloudinary** and persisted in the database for the community feed and audit trail. Authentication is handled by **Firebase**; the backend accepts a `userId` (Firebase UID) in requests and uses that as the canonical user identifier.

---

## Table of contents

1. Design notes & glossary
2. Authentication & headers (Firebase)
3. Important implementation rules (file handling, privacy, Hedera)
4. Data models (MongoDB) — schemas
5. Endpoint list (grouped)
6. Detailed endpoints (request / response / examples)

   * User (register / profile)
   * Reports / Events (create / verify / fetch)
   * Community feed & leaderboard
   * Hedera (create token, mint, transfer, association helpers)
   * Wallet pairing (HashConnect)
   * Admin endpoints & utilities
7. HCS audit payload structure (canonical)
8. Example end-to-end flows (custodial & non-custodial)
9. Error model & common codes
10. Security, privacy, and operational notes

---

## 1 — Design notes & glossary

* **FastAPI verifier**: runs locally on `http://localhost:8000` and exposes:

  * `POST /predict` — accepts raw image file `file` (multipart) and returns detection + random prompt.
  * `POST /verify` — accepts raw image file `file` plus prompt/report context and returns `verified` and `detection_result` (see examples below).
* **Express backend**: receives images from frontend, forwards to FastAPI, and after verification uploads to Cloudinary and persists records into MongoDB.
* **Cloudinary**: stores verified images (before/after), returns `secure_url`, `public_id` and metadata. We store Cloudinary URL & public_id in DB.
* **Hedera**:

  * **HCS (Topic)** used for audit messages (immutable proof).
  * **HTS (EcoToken)** used for rewards; server may carry out custodial transfer or facilitate non-custodial flows.
* **Firebase auth**: frontend authenticates users with Firebase; sends `userId` (Firebase UID) to backend endpoints. Backend must validate Firebase token to ensure authenticity.
* **HashConnect / HashPack**: wallet pairing on frontend for non-custodial flows. Backend stores `walletAccountId` associated with `userId`.

---

## 2 — Authentication & headers (Firebase)

**Flow:**

* Frontend performs Firebase authentication (email/password, Google, etc.) and obtains an ID token (`firebaseIdToken`).
* Every backend request that requires authentication SHOULD include:

```
Authorization: Bearer <firebaseIdToken>
Content-Type: application/json  (or multipart/form-data for file uploads)
```

**Backend behavior:**

* Validate the Firebase token on each authenticated request using Firebase Admin SDK.
* After successful validation, obtain `firebaseUid` (call it `userId` in DB).
* Use this `userId` as the canonical user identifier across DB, HCS audit messages, and token award records.

**Note:** Do not trust a `userId` passed in request body unless the token validates and the `uid` matches.

---

## 3 — Important implementation rules

* **FastAPI expects the raw image file** (field `file` in multipart). Backend MUST forward the raw file bytes to FastAPI `/predict` or `/verify` as `multipart/form-data` with `file` field.
* **Only after successful verification** (i.e. `verifyResp.verified === true`) should images be uploaded to Cloudinary for permanent storage / community feed. This reduces storing unverified content unnecessarily.
* **HCS messages MUST NOT include PII** (no email addresses or full names). Include `userId` (Firebase UID), content hashes, Cloudinary `public_id` or URL, and verification metadata.
* **Compute and store image content hashes** (e.g., SHA-256) for before/after images. Include these hashes in the HCS audit message so third parties can verify file integrity.
* **Costs**: Hedera transactions require HBAR. Treasury/operator account must be funded for mint/transfer and HCS writes.

---

## 4 — Data models (MongoDB) — canonical schemas

### `users` (collection)

```ts
User {
  _id: ObjectId,
  userId: string,           // Firebase UID
  displayName?: string,
  hederaAccountId?: string, // 0.0.x (optional)
  evmAddress?: string,      // 0x... (optional; for HSCS/EVM interactions)
  walletProvider?: string,  // "hashpack" | "metamask" | null
  walletPairedAt?: Date,
  did?: string,             // e.g., did:hedera:testnet:0.0.123_user123
  createdAt: Date,
  updatedAt: Date
}
```

### `reports` (collection)

```ts
Report {
  _id: ObjectId,
  reportId: string,             // human-friendly
  userId: string,               // Firebase UID
  eventType: "cleanup"|"tree-planting",
  title?: string,
  description?: string,
  location?: { text?: string, lat?: number, lng?: number },
  wasteCollectedKg?: number,

  // before/after images saved to Cloudinary after verify (before maybe stored as temp)
  beforeImage?: {
    publicId: string,
    url: string,
    width?: number,
    height?: number,
    hash: string  // SHA256 of image bytes
  },
  afterImage?: {
    publicId: string,
    url: string,
    width?: number,
    height?: number,
    hash: string
  },

  randomPrompt?: {
    prompt: string,
    trash_type: string,
    action_required: string
  },

  detectionResultBefore?: object, // raw from /predict
  detectionResultAfter?: object,  // raw from /verify

  verified: boolean,
  verifyReason?: string,

  // Hedera audit & reward info
  hedera?: {
    topicId?: string,
    auditTxnId?: string,            // tx id for HCS message
    auditConsensusTs?: string,
    rewardTxnId?: string,           // transfer / mint tx id
    rewardTokenId?: string,
    rewardAmount?: number
  },

  tokensAwarded?: number,

  createdAt: Date,
  updatedAt: Date
}
```

### `tokenTransactions`

```ts
TokenTransaction {
  _id,
  userId,
  type: "mint" | "transfer" | "burn",
  tokenId: string,
  txId: string,
  amount: number,
  createdAt: Date
}
```

### `feed` (optional static cached view)

* The feed can be computed on the fly from `reports`. For scale, an aggregated `feed_items` collection can be used.

---

## 5 — Endpoint list (grouped)

* **Auth & User**

  * `POST /api/v1/users` — register/link user after Firebase auth (see example below).
  * `GET /api/v1/users/me` — profile
  * `PUT /api/v1/users/me` — update profile info
  * `POST /api/v1/users/me/wallet/pair` — store wallet pairing info (HashConnect data)

* **Reports & verification**

  * `POST /api/v1/reports` — upload BEFORE image, run `/predict`, return prompt + reportId
  * `POST /api/v1/reports/:reportId/verify` — upload AFTER image, run `/verify`, if verified → Cloudinary + HCS + HTS transfer
  * `GET /api/v1/reports/:reportId` — fetch report details
  * `GET /api/v1/reports?userId=<uid>` — fetch user reports (or `/users/:userId/reports`)

* **Community feed / leaderboard**

  * `GET /api/v1/feed` — paginated community feed of verified events
  * `GET /api/v1/leaderboard` — ranking by tokens, events, badges

* **Hedera & tokens**

  * `POST /api/v1/hedera/create-token` — admin (creates HTS eco token)
  * `POST /api/v1/hedera/mint` — admin
  * `POST /api/v1/hedera/transfer` — internal (transfer tokens to user)
  * `POST /api/v1/hedera/associate` — helper: returns unsigned tx bytes for user to sign (non-custodial)
  * `POST /api/v1/hedera/hcs-write` — write an arbitrary audit message (admin/worker)

* **Admin / ops**

  * `POST /api/v1/admin/create-topic` — HCS topic
  * `GET /api/v1/admin/reports` — search & moderation
  * `POST /api/v1/admin/reports/:reportId/override` — admin override verify / award

* **Utility**

  * `GET /api/v1/health`
  * `GET /api/v1/config` — frontend-safe config (Cloudinary names, Hedera testnet/mainnet flag)

---

## 6 — Detailed endpoints (request / response / examples)

> For endpoints that accept images: `multipart/form-data` with field name `image` (or `file` when forwarded to FastAPI). `Authorization: Bearer <firebaseIdToken>` required.

---

### `POST /api/v1/users` — create / link user (called after Firebase sign-in)

**Purpose:** Create a user record in our DB after the frontend authenticates with Firebase. This associates application profile metadata and optional Hedera/EVM addresses with the Firebase UID.

**Auth:** `Authorization: Bearer <firebaseIdToken>` (backend validates token and ensures token.uid === request.body.userId)

**Request (JSON):**

```json
POST /api/v1/users
{
  "userId": "user123",
  "displayName": "John Doe",
  "hederaAccountId": "0.0.123456",
  "evmAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Server behavior:**

* Verify Firebase token and ensure `uid` matches `userId`.
* Create or update the `users` document. If `did` is not present, derive `did` as:

  ```
  did:hedera:testnet:{hederaAccountId}_{userId}
  ```

  (for testnet; pattern configurable)
* Return the full user document (public fields only).

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

**Why:** This separates authentication (Firebase) from application identity and allows storing Hedera wallet info, DID, and app profile.

---

### `POST /api/v1/reports` — submit BEFORE image and receive detection + prompt

**Purpose:** User uploads the BEFORE cleanup image to obtain detection results and a random prompt.

**Auth:** Bearer Firebase token or optional anonymous session (but recommended to require auth)

**Request (multipart/form-data):**

* `image` (file) — required
* `eventType` (string) — optional (default: `"cleanup"`)
* `title`, `location`, etc. — optional metadata

**Backend Flow:**

1. Validate token → `userId`.
2. Forward image to FastAPI `POST /predict`:

   * Use `multipart/form-data` where the FastAPI expects `file`.
3. FastAPI returns detection JSON (see example below).
4. Create a `reports` DB record with:

   * `userId`, `randomPrompt` from FastAPI, `detectionResultBefore` (raw), `verified=false` (initial).
   * **Do not yet upload to Cloudinary** (we upload only after verification).
5. Return `reportId` and the `randomPrompt` + detection snippet to the frontend.

**Forwarding to FastAPI — request sample (server):**

```js
// server-side pseudo
form = new FormData();
form.append('file', fileBuffer, 'before.jpg');
res = await fetch('http://localhost:8000/predict', { method: 'POST', body: form });
predictJson = await res.json();
```

**Success response (201):**

```json
{
  "reportId": "64fabc...",
  "randomPrompt": {
    "prompt": "\"Point to the two items labeled 'plastic' and one glass item.\"",
    "trash_type": "plastic, plastic, glass",
    "action_required": "photo_verification"
  },
  "detection_result": {
    "detected": true,
    "count": 3,
    "boxes": [ ... ],
    "image_dimensions": { "width": 500, "height": 334 }
  }
}
```

**Why:** The `predict` step gives the user a targeted micro-task (prompt) to validate the cleanup and provides bounding boxes and counts to help the user complete the action correctly.

---

### `POST /api/v1/reports/:reportId/verify` — submit AFTER image for verification (CRITICAL)

**Purpose:** Verify the cleanup completed per prompt and award tokens if valid.

**Auth:** Bearer Firebase token (server ensures token.uid === report.userId)

**Request (multipart/form-data):**

* `image` (file) — required
* `force` (boolean) — optional admin override

**Server Flow (detailed):**

1. Fetch `report` by `reportId` — ensure `report.userId === authenticated user`.
2. Call FastAPI `POST /verify`:

   * Send the file as multipart field `file`.
   * Optionally include the prompt text or reference (if FastAPI accepts prompt context).
3. FastAPI returns structure like the example in earlier messages:

   ```json
   {
     "verified": true,
     "reason": "The image shows ...",
     "detection_result": { ... },
     "processing_time": 5.9,
     "image_dimensions": { "width": 1024, "height": 1024 }
   }
   ```
4. **If verifyResp.verified === true:**

   * Upload both `before` (if available in temp) and `after` images to Cloudinary (store `secure_url`, `public_id`, width/height).
   * Compute SHA-256 hashes of both image bytes and store in DB.
   * Create **HCS audit message** (see canonical payload, section 7).
   * Submit `TopicMessageSubmitTransaction` to Hedera (uses server operator).
   * Transfer EcoTokens to user's Hedera account:

     * If custodial: call `TransferTransaction` from treasury -> `report.userHederaAccount`.
     * If non-custodial: ensure user has associated the token—if not, return a response instructing user to call association via HashConnect, or provide signed association bytes for wallet to submit.
   * Store Hedera tx receipts (auditTxId and rewardTxId) in `report.hedera`.
   * Set `report.verified = true`, set `report.tokensAwarded = amount`.
   * Insert `tokenTransactions` record.
   * Publish the event to community feed (store feed item or use real-time push).
5. **If verified === false**:

   * Update `report.verified = false`, store `verifyReason`.
   * Optionally allow user to retry once or require admin review.

**Response example (verified true):**

```json
{
  "verified": true,
  "verifyReason": "Foot indicates pointing to cleared area; trash removed",
  "cloudinary": {
    "before": { "url":"https://res.cloudinary.com/.../v1/abc_before.jpg", "publicId":"shebagreen/abc_before" },
    "after":  { "url":"https://res.cloudinary.com/.../v1/abc_after.jpg",  "publicId":"shebagreen/abc_after" }
  },
  "hedera": {
    "topicId": "0.0.112233",
    "auditTxnId": "0.0.112233@16965...:...",
    "rewardTxnId": "0.0.112234@16965...:...",
    "rewardTokenId": "0.0.98765",
    "rewardAmount": 10
  },
  "report": {
    "reportId": "64fabc..."
  }
}
```

**Note about Cloudinary upload timing:**

* Do NOT upload before images to Cloudinary until verification is passed (unless you want an earlier CDN link), because you only want verified content in persistent feed. If you must show a preview before verify, store the pre-verify image temporarily (e.g., local or ephemeral S3) and move to Cloudinary only on verification.

---

### `GET /api/v1/feed` — community feed

**Purpose:** Return paginated list of verified reports for community browsing.

**Auth:** Optional (public), but will show extra actions to authenticated users.

**Query params:**

* `?page=1&limit=20&filter=recent|top|nearby&lat=...&lng=...`

**Response:**

```json
{
  "page": 1,
  "limit": 20,
  "total": 952,
  "items": [
    {
      "type":"report",
      "reportId":"64fabc...",
      "user": { "userId":"user123", "displayName":"John" },
      "title": "Beach cleanup",
      "summary": "Collected 3 plastic + 1 glass",
      "beforeUrl": "https://res.cloudinary.com/...",
      "afterUrl": "https://res.cloudinary.com/...",
      "tokensAwarded": 10,
      "createdAt": "2025-10-05T12:00:00Z"
    }
  ]
}
```

**Why:** Community feed drives social proof and engagement; all items MUST be verified and have Cloudinary images and HCS audit IDs for transparency.

---

### `GET /api/v1/leaderboard` — ranking

**Purpose:** Rank users by tokens awarded, number of verified reports, badges, etc.

**Query params:** `?period=week|month|alltime&limit=50`

**Response (example):**

```json
{
  "period":"week",
  "items":[
    { "rank":1, "userId":"user123", "displayName":"John", "score": 250, "tokens": 120, "events": 15 }
  ]
}
```

**Implementation notes:** Use map-reduce aggregation on `tokenTransactions` and `reports` to compute ranking. Cache results (Redis) for performance.

---

### Hedera endpoints (admin/internal)

> These endpoints are usually protected or used by server-side components only.

#### `POST /api/v1/hedera/create-token` — admin

**Purpose:** Create the HTS EcoToken (one-time setup).

**Auth:** Admin (JWT with role)

**Body:**

```json
{
  "name":"EcoToken",
  "symbol":"ECO",
  "decimals": 0,
  "initialSupply": 0
}
```

**Response:**

```json
{ "tokenId": "0.0.98765" }
```

**Implementation:** Uses `TokenCreateTransaction` from `@hashgraph/sdk`.

---

#### `POST /api/v1/hedera/transfer` — internal transfer (server)

**Purpose:** Transfer tokens from treasury to user (used after verification).

**Auth:** Internal / admin

**Body:**

```json
{
  "tokenId": "0.0.98765",
  "toAccountId": "0.0.123456",
  "amount": 10,
  "memo": "reward for report 64fabc"
}
```

**Response:**

```json
{ "txId":"0.0.98765@16965...:...", "status": "SUCCESS" }
```

**Note:** For non-custodial flows, check token association first; if not associated return `TOKEN_NOT_ASSOCIATED` to the frontend so it can prompt the user to associate.

---

#### `POST /api/v1/hedera/associate` — prepare unsigned association transaction

**Purpose:** Provide unsigned `TokenAssociateTransaction` bytes that the frontend wallet (HashPack via HashConnect) will sign and submit.

**Auth:** User (JWT)

**Body:**

```json
{ "tokenId": "0.0.98765", "accountId": "0.0.123456" }
```

**Response (example):**

```json
{
  "unsignedTxBytes": "<base64-encoded-bytes>",
  "instructions": "Use HashConnect to sign the bytes and submit to Hedera network. After success check /api/v1/users/me to see association status."
}
```

**Why:** Non-custodial pattern where the server helps generate the transaction but user signs via wallet.

---

### Wallet pairing & verification

#### `POST /api/v1/users/me/wallet/pair`

**Purpose:** Store pairing info sent from frontend after HashConnect pairing.

**Auth:** JWT

**Body:**

```json
{ "walletAccountId": "0.0.123456", "walletProvider": "hashpack", "pairingData": {...} }
```

**Server behavior:**

* Optionally ask the frontend to request the wallet sign a nonce to prove account control (recommended). Use `POST /api/v1/users/me/wallet/verify-signature`.

**Response (200):**

```json
{ "status":"paired", "walletAccountId":"0.0.123456" }
```

---

### Admin: `POST /api/v1/admin/create-topic`

**Purpose:** Create an HCS topic for audit messages.

**Auth:** Admin

**Response:**

```json
{ "topicId":"0.0.112233" }
```

**Implementation:** Use `TopicCreateTransaction` in Hedera SDK.

---

## 7 — HCS audit payload (canonical)

**Always include:**

* `type`: `"verification_audit"`
* `reportId`
* `userId` (Firebase UID)
* `before`: `{publicId, url (if allowed), hash}`
* `after`: `{publicId, url (if allowed), hash}`
* `verifyResult`: (the full `verify` JSON from FastAPI)
* `tokenAwarded`: integer
* `tokenId`: HTS token id
* `timestamp` (ISO 8601)
* Optionally `geo` or `location` (but do not include PII)

**Example payload (stringified JSON):**

```json
{
  "type":"verification_audit",
  "reportId":"64fabc",
  "userId":"user123",
  "before":{ "publicId":"shebagreen/bef_64f", "hash":"sha256:abcd..." },
  "after":{ "publicId":"shebagreen/aft_64f", "hash":"sha256:ef01..." },
  "verifyResult": { "verified": true, "reason":"..." },
  "tokenAwarded": 10,
  "tokenId":"0.0.98765",
  "timestamp":"2025-10-05T12:00:00Z"
}
```

**Size considerations:** HCS message size is limited — avoid embedding large objects. Use minimal fields and store full details in MongoDB. Alternatively, include only the DB `reportId` and content hashes plus pointers to DB or Cloudinary.

---

## 8 — Example end-to-end flows

### Flow A — Custodial demo (fastest to demo)

1. User signs in on frontend with Firebase.
2. Frontend POST `/api/v1/reports` with BEFORE image; backend forwards to `FastAPI /predict` and returns `reportId` + prompt.
3. User performs cleanup, then uploads AFTER image to `/api/v1/reports/:reportId/verify`.
4. Backend forwards to `FastAPI /verify`, receives `verified: true`.
5. Backend uploads both images to Cloudinary, computes hashes, writes HCS audit message (`TopicMessageSubmitTransaction`) and calls `TransferTransaction` to transfer `EcoToken` from treasury → `user.hederaAccountId`.
6. Backend stores hedra tx ids in DB and returns success to frontend with `hashscan` link.

**Checkpoints for demo:**

* Use HashScan Testnet to show token transaction and HCS message if the HCS topic is public.
* Frontend shows images & "tokens awarded" and link to HashScan tx.

---

### Flow B — Non-custodial (wallet) flow

1. User pairs wallet on frontend via HashConnect (HashPack). Frontend sends pairing data to `POST /api/v1/users/me/wallet/pair`.
2. When verifying: if backend sees `walletAccountId` but that wallet is not associated with token, backend returns `TOKEN_NOT_ASSOCIATED` error with `associateTx` payload.
3. Frontend asks wallet to sign association transaction bytes (HashConnect).
4. After association success is confirmed (mirror or tx receipt), backend transfers tokens to that wallet account (or instructs wallet to claim them).
5. Otherwise the flow is identical.

---

## 9 — Error model & common codes

Standardized envelope:

```json
{
  "error": {
    "code": "TOKEN_NOT_ASSOCIATED",
    "message": "User wallet is not associated with token. Please associate using your wallet.",
    "details": { ... }
  }
}
```

Common error codes:

* `INVALID_AUTH` (401)
* `FORBIDDEN` (403)
* `NOT_FOUND` (404)
* `INVALID_INPUT` (400)
* `FASTAPI_ERROR` (502)
* `HEDERA_ERROR` (500)
* `TOKEN_NOT_ASSOCIATED` (409)
* `INSUFFICIENT_HBAR` (402)
* `RATE_LIMITED` (429)

---

## 10 — Security & operational notes (practical)

* **Firebase token validation:** use Firebase Admin SDK server-side; treat token `uid` as authoritative userId.
* **Never put PII in HCS messages.** Use `userId` / `did` and content hashes only.
* **Protect operator key:** store `HEDERA_OPERATOR_KEY` in secure vault, not in source control. Use KMS/HSM for production.
* **Rate limiting:** put limits on image submissions per user per time-window to avoid abuse & model spamming.
* **FastAPI defense:** validate image file types and sizes before forwarding. Reject very small or very large files.
* **Cloudinary signed uploads:** prefer server-signed uploads for final image storage to avoid unsigned presets misuse.
* **Monitoring:** log FastAPI responses (confidence), hedra tx IDs, and Cloudinary results for audit and debugging.
* **Moderation / appeals:** provide admin flows to override verification if the AI fails useful verifications.

---

## Appendix — Example cURL sequences

### Create user (after Firebase auth)

```bash
curl -X POST "https://api.shebagreen.test/api/v1/users" \
 -H "Authorization: Bearer <firebaseIdToken>" \
 -H "Content-Type: application/json" \
 -d '{
   "userId":"user123",
   "displayName":"John Doe",
   "hederaAccountId":"0.0.123456",
   "evmAddress":"0x1234567890abcdef1234567890abcdef12345678"
 }'
```

### Submit BEFORE image (predict)

```bash
curl -X POST "https://api.shebagreen.test/api/v1/reports" \
 -H "Authorization: Bearer <firebaseIdToken>" \
 -F "image=@before.jpg" \
 -F "eventType=cleanup" \
 -F "title=Beach Clean"
```

### Submit AFTER image (verify)

```bash
curl -X POST "https://api.shebagreen.test/api/v1/reports/64fabc/verify" \
 -H "Authorization: Bearer <firebaseIdToken>" \
 -F "image=@after.jpg"
```

---

## Final notes & next steps I can help with

I updated the implementation plan to:

* Forward raw files to FastAPI for `/predict` and `/verify`.
* Only upload to Cloudinary and persist final `before/after` images to MongoDB **after** a successful verification.
* Include clear hedra audit payload strategy and token award flows (custodial and non-custodial).
* Use Firebase for authentication; the `POST /api/v1/users` contract you provided is included as the canonical user onboarding endpoint.

If you want I can now:

1. Generate a complete **OpenAPI 3.0 YAML** for this API (ready to paste into Swagger UI).
2. Produce the exact **Express (TypeScript) route implementations** for `/api/v1/reports` and `/api/v1/reports/:id/verify` (including forwarding file to FastAPI, Cloudinary upload, HCS write, HTS transfer, and MongoDB persistence).
3. Provide a **Postman collection** or cURL scripts to exercise every endpoint end-to-end.

Which of these would you like next?
