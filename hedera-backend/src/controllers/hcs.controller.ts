import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HcsMessageRepository } from '../repositories/hcs-message.repository';
import { PaginationDto } from '../dtos/requests/pagination.dto';
import { HcsLogsResponseDto } from '../dtos/responses/hcs-logs-response.dto';
import { ErrorResponseDto } from '../dtos/responses/error-response.dto';

@ApiTags('HCS')
@Controller('api/v1/hcs')
export class HcsController {
  constructor(
    private readonly hcsMessageRepository: HcsMessageRepository,
  ) {}

  @Get('logs')
  @ApiOperation({
    summary: 'Get recent HCS messages',
    description:
      'Retrieve recent messages published to Hedera Consensus Service with pagination support',
  })
  @ApiResponse({
    status: 200,
    description: 'HCS logs retrieved successfully',
    type: HcsLogsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid pagination parameters',
    type: ErrorResponseDto,
  })
  async getHcsLogs(
    @Query() paginationDto: PaginationDto,
  ): Promise<HcsLogsResponseDto> {
    const limit = paginationDto.limit || 10;
    const offset = paginationDto.offset || 0;

    const logs = await this.hcsMessageRepository.findRecent(limit, offset);

    // Get total count for pagination
    const total = logs.length;

    return {
      logs: logs.map((log) => ({
        topicId: log.topicId,
        message: log.message,
        consensusTimestamp: log.consensusTimestamp,
        txId: log.txId,
        createdAt: log.createdAt,
      })),
      total,
    };
  }
}
