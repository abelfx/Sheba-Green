import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report } from '../models/report.schema';
import { User } from '../models/user.schema';

export interface GlobalStatistics {
  totalUsers: number;
  totalReports: number;
  totalVerifiedReports: number;
  totalTokensAwarded: number;
  totalWasteCollectedKg: number;
  recentActivity: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
}

export interface UserStatistics {
  userId: string;
  totalReports: number;
  verifiedReports: number;
  tokensEarned: number;
  rank: number;
  wasteCollectedKg: number;
  joinedAt: Date;
  recentReports: Array<{
    reportId: string;
    createdAt: Date;
    verified: boolean;
  }>;
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Get global platform statistics
   */
  async getGlobalStatistics(): Promise<GlobalStatistics> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalReports,
      totalVerifiedReports,
      tokensAwarded,
      activity24h,
      activity7d,
      activity30d,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.reportModel.countDocuments(),
      this.reportModel.countDocuments({ status: 'VERIFIED' }),
      this.reportModel.countDocuments({ tokenTxId: { $ne: null } }),
      this.reportModel.countDocuments({ createdAt: { $gte: last24h } }),
      this.reportModel.countDocuments({ createdAt: { $gte: last7d } }),
      this.reportModel.countDocuments({ createdAt: { $gte: last30d } }),
    ]);

    // Calculate total waste collected (if tracked)
    const wasteAgg = await this.reportModel.aggregate([
      { $match: { status: 'VERIFIED', wasteCollectedKg: { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$wasteCollectedKg' } } },
    ]);

    return {
      totalUsers,
      totalReports,
      totalVerifiedReports,
      totalTokensAwarded: tokensAwarded,
      totalWasteCollectedKg: wasteAgg[0]?.total || 0,
      recentActivity: {
        last24h: activity24h,
        last7d: activity7d,
        last30d: activity30d,
      },
    };
  }

  /**
   * Get statistics for a specific user
   * @param userId - The user ID to get stats for
   */
  async getUserStatistics(userId: string): Promise<UserStatistics> {
    const user = await this.userModel.findOne({ userId });
    if (!user) {
      throw new Error('User not found');
    }

    const [totalReports, verifiedReports, tokensEarned, recentReports] =
      await Promise.all([
        this.reportModel.countDocuments({ userId }),
        this.reportModel.countDocuments({ userId, status: 'VERIFIED' }),
        this.reportModel.countDocuments({
          userId,
          tokenTxId: { $ne: null },
        }),
        this.reportModel
          .find({ userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('reportId createdAt status')
          .lean(),
      ]);

    // Calculate waste collected
    const wasteAgg = await this.reportModel.aggregate([
      {
        $match: {
          userId,
          status: 'VERIFIED',
          wasteCollectedKg: { $exists: true },
        },
      },
      { $group: { _id: null, total: { $sum: '$wasteCollectedKg' } } },
    ]);

    // Calculate rank (simplified - count users with more tokens)
    const usersWithMoreTokens = await this.reportModel.aggregate([
      { $match: { tokenTxId: { $ne: null } } },
      { $group: { _id: '$userId', tokens: { $sum: 1 } } },
      { $match: { tokens: { $gt: tokensEarned } } },
      { $count: 'count' },
    ]);

    const rank = (usersWithMoreTokens[0]?.count || 0) + 1;

    return {
      userId,
      totalReports,
      verifiedReports,
      tokensEarned,
      rank,
      wasteCollectedKg: wasteAgg[0]?.total || 0,
      joinedAt: user.createdAt,
      recentReports: recentReports.map((r) => ({
        reportId: r.reportId,
        createdAt: r.createdAt,
        verified: r.status === 'VERIFIED',
      })),
    };
  }
}
