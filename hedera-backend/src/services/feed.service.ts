import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';
import { UserRepository } from '../repositories/user.repository';

export interface FeedItem {
  type: 'report';
  reportId: string;
  user: {
    userId: string;
    displayName?: string;
  };
  title?: string;
  summary: string;
  beforeUrl?: string;
  afterUrl?: string;
  tokensAwarded: number;
  createdAt: Date;
}

export interface FeedResponse {
  page: number;
  limit: number;
  total: number;
  items: FeedItem[];
}

@Injectable()
export class FeedService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Get community feed with verified reports
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @param filter - Filter type (recent, top, nearby)
   * @returns Paginated feed items
   */
  async getFeed(
    page: number = 1,
    limit: number = 20,
    filter: 'recent' | 'top' | 'nearby' = 'recent',
  ): Promise<FeedResponse> {
    const skip = (page - 1) * limit;

    // Build query for verified reports only
    const query = { status: 'VERIFIED' };

    // Determine sort order
    let sort: any = { createdAt: -1 }; // Default: most recent
    if (filter === 'top') {
      sort = { tokensAwarded: -1, createdAt: -1 };
    }

    // Get reports
    const reports = await this.reportRepository.findMany(query, {
      skip,
      limit,
      sort,
    });

    const total = await this.reportRepository.count(query);

    // Get user info for each report
    const userIds = [...new Set(reports.map((r) => r.userId))];
    const users = await this.userRepository.findByIds(userIds);
    const userMap = new Map(users.map((u) => [u.userId, u]));

    // Transform to feed items
    const items: FeedItem[] = reports.map((report) => {
      const user = userMap.get(report.userId);
      const detectedClasses = report.detectionResult?.boxes
        ?.map((b: any) => b.class_name)
        .join(', ');

      return {
        type: 'report',
        reportId: report.reportId,
        user: {
          userId: report.userId,
          displayName: user?.displayName || 'Anonymous',
        },
        title: `Cleanup Report`,
        summary: detectedClasses
          ? `Collected ${report.detectionResult?.count || 0} items: ${detectedClasses}`
          : 'Cleanup completed',
        beforeUrl: report.beforeImagePath,
        afterUrl: report.afterImagePath,
        tokensAwarded: report.tokenTxId ? 1 : 0, // Simplified - should track actual amount
        createdAt: report.createdAt,
      };
    });

    return {
      page,
      limit,
      total,
      items,
    };
  }
}
