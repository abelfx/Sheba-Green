import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  StatisticsService,
  GlobalStatistics,
  UserStatistics,
} from '../services/statistics.service';

@ApiTags('Statistics')
@Controller('api/v1/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('global')
  @ApiOperation({
    summary: 'Get global platform statistics',
    description:
      'Returns overall platform metrics including total users, reports, tokens, and recent activity',
  })
  @ApiResponse({
    status: 200,
    description: 'Global statistics retrieved successfully',
  })
  async getGlobalStatistics(): Promise<GlobalStatistics> {
    return this.statisticsService.getGlobalStatistics();
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user statistics',
    description:
      'Returns detailed statistics for a specific user including reports, tokens, rank, and recent activity',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (Firebase UID)',
    example: 'user123',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserStatistics(
    @Param('userId') userId: string,
  ): Promise<UserStatistics> {
    return this.statisticsService.getUserStatistics(userId);
  }
}
