import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FeedService, FeedResponse } from '../services/feed.service';

@ApiTags('Feed')
@Controller('api/v1/feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @ApiOperation({
    summary: 'Get community feed',
    description:
      'Returns paginated list of verified reports for community browsing',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['recent', 'top', 'nearby'],
    description: 'Filter type (default: recent)',
  })
  @ApiResponse({
    status: 200,
    description: 'Feed retrieved successfully',
  })
  async getFeed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filter') filter?: 'recent' | 'top' | 'nearby',
  ): Promise<FeedResponse> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.feedService.getFeed(pageNum, limitNum, filter || 'recent');
  }
}
