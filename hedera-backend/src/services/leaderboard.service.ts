import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report } from '../models/report.schema';
import { User } from '../models/user.schema';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  tokens: number;
  events: number;
}

export interface LeaderboardResponse {
  period: 'week' | 'month' | 'alltime';
  items: LeaderboardEntry[];
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Get leaderboard rankings
   * @param period - Time period for ranking
   * @param limit - Number of top users to return
   * @returns Ranked list of users
   */
  async getLeaderboard(
    period: 'week' | 'month' | 'alltime' = 'alltime',
    limit: number = 50,
  ): Promise<LeaderboardResponse> {
    // Calculate date filter based on period
    const now = new Date();
    let dateFilter: Date | undefined;

    if (period === 'week') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Aggregate reports by user
    const matchStage: any = { status: 'VERIFIED' };
    if (dateFilter) {
      matchStage.createdAt = { $gte: dateFilter };
    }

    const aggregation = await this.reportModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          events: { $sum: 1 },
          tokens: {
            $sum: {
              $cond: [{ $ne: ['$tokenTxId', null] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          userId: '$_id',
          events: 1,
          tokens: 1,
          score: { $add: ['$tokens', { $multiply: ['$events', 0.5] }] },
        },
      },
      { $sort: { score: -1, events: -1 } },
      { $limit: limit },
    ]);

    // Get user details
    const userIds = aggregation.map((a) => a.userId);
    const users = await this.userModel.find({ userId: { $in: userIds } });
    const userMap = new Map(users.map((u) => [u.userId, u]));

    // Build leaderboard entries
    const items: LeaderboardEntry[] = aggregation.map((entry, index) => {
      const user = userMap.get(entry.userId);
      return {
        rank: index + 1,
        userId: entry.userId,
        displayName: user?.displayName || 'Anonymous',
        score: Math.round(entry.score),
        tokens: entry.tokens,
        events: entry.events,
      };
    });

    return {
      period,
      items,
    };
  }
}
