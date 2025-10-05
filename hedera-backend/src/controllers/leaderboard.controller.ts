import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import {
  LeaderboardService,
  LeaderboardResponse,
} from '../services/leaderboard.service';

@ApiTags('Leaderboard')
@Controller('api/v1/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get leaderboard rankings',
    description:
      'Returns ranked list of users by tokens awarded, events, and badges',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month', 'alltime'],
    description: 'Time period for ranking (default: alltime)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top users to return (default: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
  })
  async getLeaderboard(
    @Query('period') period?: 'week' | 'month' | 'alltime',
    @Query('limit') limit?: string,
  ): Promise<LeaderboardResponse> {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.leaderboardService.getLeaderboard(
      period || 'alltime',
      limitNum,
    );
  }
}
