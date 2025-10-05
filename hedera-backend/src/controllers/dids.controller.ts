import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DidService } from '../services/did.service';
import { CreateDidDto } from '../dtos/requests/create-did.dto';
import { DidResponseDto } from '../dtos/responses/did-response.dto';
import { ErrorResponseDto } from '../dtos/responses/error-response.dto';

@ApiTags('DIDs')
@Controller('api/v1/dids')
export class DidsController {
  constructor(private readonly didService: DidService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a DID for a user',
    description:
      'Generate a decentralized identifier (DID) anchored to Hedera for the specified user',
  })
  @ApiResponse({
    status: 201,
    description: 'DID created successfully',
    type: DidResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User already has a DID',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - Hedera service is down',
    type: ErrorResponseDto,
  })
  async createDid(
    @Body() createDidDto: CreateDidDto,
  ): Promise<DidResponseDto> {
    const result = await this.didService.createDidForUser(createDidDto.userId);

    return {
      did: result.did,
      didDocument: result.didDocument,
    };
  }
}
