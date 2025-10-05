# Frontend Integration Guide - ShebaGreen Backend

## Quick Start

### 1. Backend Setup
```bash
# Start MongoDB
mongod

# Start Detection Service (Python)
cd detection-backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start Backend (Node.js)
cd hedera-backend
npm run start:dev
```

Backend will be available at: `http://localhost:3000`
Swagger docs at: `http://localhost:3000/api/docs`

### 2. Test Endpoints
```bash
cd hedera-backend
./test-new-endpoints.sh
```

## New Endpoints for Frontend

### Community Feed
```typescript
// Get paginated feed
GET /api/v1/feed?page=1&limit=20&filter=recent

Response:
{
  page: 1,
  limit: 20,
  total: 100,
  items: [{
    type: "report",
    reportId: "abc123",
    user: { userId: "user123", displayName: "John" },
    title: "Cleanup Report",
    summary: "Collected 3 items: plastic, plastic, glass",
    beforeUrl: "https://res.cloudinary.com/.../before.jpg",
    afterUrl: "https://res.cloudinary.com/.../after.jpg",
    tokensAwarded: 10,
    createdAt: "2025-10-05T12:00:00Z"
  }]
}
```

### Leaderboard
```typescript
// Get rankings
GET /api/v1/leaderboard?period=week&limit=50

Response:
{
  period: "week",
  items: [{
    rank: 1,
    userId: "user123",
    displayName: "John",
    score: 250,
    tokens: 120,
    events: 15
  }]
}
```

### Statistics
```typescript
// Global stats
GET /api/v1/statistics/global

Response:
{
  totalUsers: 1523,
  totalReports: 4892,
  totalVerifiedReports: 3456,
  totalTokensAwarded: 3200,
  totalWasteCollectedKg: 1250.5,
  recentActivity: {
    last24h: 45,
    last7d: 312,
    last30d: 1234
  }
}

// User stats
GET /api/v1/statistics/user/:userId

Response:
{
  userId: "user123",
  totalReports: 25,
  verifiedReports: 22,
  tokensEarned: 22,
  rank: 15,
  wasteCollectedKg: 45.5,
  joinedAt: "2025-09-01T10:00:00Z",
  recentReports: [...]
}
```

## Next.js Integration Example

### 1. Create API Client (`lib/api.ts`)

```typescript
import { getAuth } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper to get Firebase auth token
async function getAuthToken(): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

// Feed API
export async function getFeed(page = 1, limit = 20, filter: 'recent' | 'top' | 'nearby' = 'recent') {
  const response = await fetch(
    `${API_URL}/api/v1/feed?page=${page}&limit=${limit}&filter=${filter}`
  );
  if (!response.ok) throw new Error('Failed to fetch feed');
  return response.json();
}

// Leaderboard API
export async function getLeaderboard(period: 'week' | 'month' | 'alltime' = 'alltime', limit = 50) {
  const response = await fetch(
    `${API_URL}/api/v1/leaderboard?period=${period}&limit=${limit}`
  );
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json();
}

// Statistics API
export async function getGlobalStats() {
  const response = await fetch(`${API_URL}/api/v1/statistics/global`);
  if (!response.ok) throw new Error('Failed to fetch global stats');
  return response.json();
}

export async function getUserStats(userId: string) {
  const response = await fetch(`${API_URL}/api/v1/statistics/user/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user stats');
  return response.json();
}

// Report API (with auth)
export async function createReport(formData: FormData) {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/api/v1/reports`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to create report');
  return response.json();
}

export async function verifyReport(reportId: string, formData: FormData) {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/api/v1/verifications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to verify report');
  return response.json();
}
```

### 2. Feed Page (`app/feed/page.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getFeed } from '@/lib/api';

export default function FeedPage() {
  const [feed, setFeed] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, [page]);

  async function loadFeed() {
    setLoading(true);
    try {
      const data = await getFeed(page, 20, 'recent');
      setFeed(data);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!feed) return <div>No data</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Community Feed</h1>
      
      <div className="grid gap-4">
        {feed.items.map((item) => (
          <div key={item.reportId} className="border rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{item.user.displayName}</span>
              <span className="text-sm text-gray-500">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <p className="text-gray-700 mb-3">{item.summary}</p>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              {item.beforeUrl && (
                <img 
                  src={item.beforeUrl} 
                  alt="Before" 
                  className="w-full h-48 object-cover rounded"
                />
              )}
              {item.afterUrl && (
                <img 
                  src={item.afterUrl} 
                  alt="After" 
                  className="w-full h-48 object-cover rounded"
                />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                🪙 {item.tokensAwarded} tokens
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page} of {Math.ceil(feed.total / 20)}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= Math.ceil(feed.total / 20)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### 3. Leaderboard Page (`app/leaderboard/page.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/api';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'alltime'>('alltime');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const data = await getLeaderboard(period, 50);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!leaderboard) return <div>No data</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      
      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {['week', 'month', 'alltime'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            className={`px-4 py-2 rounded ${
              period === p 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-right">Score</th>
              <th className="px-4 py-3 text-right">Tokens</th>
              <th className="px-4 py-3 text-right">Events</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.items.map((entry) => (
              <tr key={entry.userId} className="border-t">
                <td className="px-4 py-3">
                  <span className={`font-bold ${
                    entry.rank === 1 ? 'text-yellow-500' :
                    entry.rank === 2 ? 'text-gray-400' :
                    entry.rank === 3 ? 'text-orange-600' :
                    ''
                  }`}>
                    #{entry.rank}
                  </span>
                </td>
                <td className="px-4 py-3">{entry.displayName}</td>
                <td className="px-4 py-3 text-right font-semibold">{entry.score}</td>
                <td className="px-4 py-3 text-right">{entry.tokens}</td>
                <td className="px-4 py-3 text-right">{entry.events}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 4. Profile Page (`app/profile/[userId]/page.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getUserStats } from '@/lib/api';

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [params.userId]);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await getUserStats(params.userId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>User not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Rank</div>
          <div className="text-3xl font-bold">#{stats.rank}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Tokens Earned</div>
          <div className="text-3xl font-bold text-green-600">{stats.tokensEarned}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Total Reports</div>
          <div className="text-3xl font-bold">{stats.totalReports}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Waste Collected</div>
          <div className="text-3xl font-bold">{stats.wasteCollectedKg} kg</div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Reports</h2>
        <div className="space-y-2">
          {stats.recentReports.map((report) => (
            <div key={report.reportId} className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-600">
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                report.verified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {report.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 5. Dashboard Page (`app/dashboard/page.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getGlobalStats } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await getGlobalStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>No data</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Platform Statistics</h1>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Total Users</div>
          <div className="text-4xl font-bold">{stats.totalUsers.toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Verified Reports</div>
          <div className="text-4xl font-bold text-green-600">
            {stats.totalVerifiedReports.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Tokens Awarded</div>
          <div className="text-4xl font-bold text-blue-600">
            {stats.totalTokensAwarded.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-gray-500 text-sm">Last 24 Hours</div>
            <div className="text-2xl font-bold">{stats.recentActivity.last24h}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Last 7 Days</div>
            <div className="text-2xl font-bold">{stats.recentActivity.last7d}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Last 30 Days</div>
            <div className="text-2xl font-bold">{stats.recentActivity.last30d}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Environment Variables for Next.js

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
```

## Testing Checklist

- [ ] Feed page loads and displays reports
- [ ] Leaderboard shows rankings correctly
- [ ] User profile displays statistics
- [ ] Dashboard shows global stats
- [ ] Image uploads work with Cloudinary
- [ ] Firebase authentication works
- [ ] Pagination works on feed
- [ ] Period filter works on leaderboard
- [ ] Error handling displays properly

## Common Issues & Solutions

### CORS Errors
Add to backend `main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:3001', // Your Next.js URL
  credentials: true,
});
```

### Image Not Loading
- Check Cloudinary URLs are public
- Verify CORS settings on Cloudinary
- Check network tab for 403/404 errors

### Authentication Fails
- Verify Firebase token is being sent
- Check token expiration
- Ensure backend validates Firebase tokens

## Next Steps

1. Add React Query for better data fetching
2. Implement real-time updates with WebSockets
3. Add image optimization with Next.js Image component
4. Implement infinite scroll on feed
5. Add search and filter functionality
6. Create mobile-responsive design
7. Add loading skeletons
8. Implement error boundaries

## Support

For API documentation, see:
- `API_ENDPOINTS.md` - Complete endpoint reference
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- Swagger UI - `http://localhost:3000/api/docs`
