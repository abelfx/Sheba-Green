import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/requests/create-user.dto';
import { UserResponseDto } from '../dtos/responses/user-response.dto';
import { BalanceResponseDto } from '../dtos/responses/balance-response.dto';
import { ErrorResponseDto } from '../dtos/responses/error-response.dto';

@ApiTags('Users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Register a new user with their Hedera account information to participate in the cleanup verification system',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User already exists',
    type: ErrorResponseDto,
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.createUser(createUserDto);

    return {
      userId: user.userId,
      displayName: user.displayName,
      hederaAccountId: user.hederaAccountId,
      evmAddress: user.evmAddress,
      did: user.did,
      createdAt: user.createdAt,
    };
  }

  @Get(':userId/balance')
  @ApiOperation({
    summary: 'Get user token balance',
    description:
      "Retrieve the user's Sheba token balance from their Hedera account",
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier for the user',
    example: 'user123',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance retrieved successfully',
    type: BalanceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - Hedera service is down',
    type: ErrorResponseDto,
  })
  async getUserBalance(
    @Param('userId') userId: string,
  ): Promise<BalanceResponseDto> {
    const result = await this.userService.getUserBalance(userId);

    return {
      userId: result.userId,
      balance: result.balance,
      tokenSymbol: result.tokenSymbol,
    };
  }
}
