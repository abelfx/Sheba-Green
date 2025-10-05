// Token rewards
export const TOKEN_REWARDS = {
  cleanup: {
    small: 10, // < 5kg waste
    medium: 25, // 5-20kg waste
    large: 50, // > 20kg waste
  },
  reforestation: {
    small: 15, // 1-5 trees
    medium: 40, // 6-20 trees
    large: 100, // > 20 trees
  },
} as const

// Level thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, tokensRequired: 0 },
  { level: 2, tokensRequired: 50 },
  { level: 3, tokensRequired: 150 },
  { level: 4, tokensRequired: 300 },
  { level: 5, tokensRequired: 500 },
  { level: 6, tokensRequired: 800 },
  { level: 7, tokensRequired: 1200 },
  { level: 8, tokensRequired: 1700 },
  { level: 9, tokensRequired: 2500 },
  { level: 10, tokensRequired: 5000 },
] as const

// Event status
export const EVENT_STATUS = {
  pending: "Pending Verification",
  verified: "Verified",
  rejected: "Rejected",
} as const
