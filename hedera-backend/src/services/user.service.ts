import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { HederaService } from './hedera.service';
import { User } from '../models/user.schema';
import { CreateUserDto } from '../dtos/requests/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hederaService: HederaService,
  ) {}

  /**
   * Create a new user
   * @param createUserDto - User creation data
   * @returns The created user
   * @throws ConflictException if user already exists
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByUserId(
      createUserDto.userId,
    );

    if (existingUser) {
      throw new ConflictException(
        `User with ID ${createUserDto.userId} already exists`,
      );
    }

    // Create user
    const userData: Partial<User> = {
      userId: createUserDto.userId,
      displayName: createUserDto.displayName,
      hederaAccountId: createUserDto.hederaAccountId,
      evmAddress: createUserDto.evmAddress,
    };

    const user = await this.userRepository.create(userData);

    return user;
  }

  /**
   * Get a user's Sheba token balance
   * @param userId - The user ID to query
   * @returns The user's token balance with metadata
   * @throws NotFoundException if user doesn't exist
   */
  async getUserBalance(
    userId: string,
  ): Promise<{ userId: string; balance: number; tokenSymbol: string }> {
    // Get user from repository
    const user = await this.userRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.hederaAccountId) {
      throw new NotFoundException(
        `User ${userId} does not have a Hedera account ID set`,
      );
    }

    // Query Hedera for token balance
    const balance = await this.hederaService.getAccountBalance(
      user.hederaAccountId,
    );

    return {
      userId,
      balance,
      tokenSymbol: 'SHEBA',
    };
  }
}
