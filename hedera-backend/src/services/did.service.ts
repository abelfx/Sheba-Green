import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { HederaService } from './hedera.service';

export interface DidResult {
  did: string;
  didDocument: any;
}

@Injectable()
export class DidService {
  private readonly logger = new Logger(DidService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly hederaService: HederaService,
  ) {}

  /**
   * Create a DID for a user
   * @param userId - The user ID to create DID for
   * @returns The DID string and document
   * @throws NotFoundException if user doesn't exist
   * @throws ConflictException if user already has a DID
   */
  async createDidForUser(userId: string): Promise<DidResult> {
    // Get user from repository
    const user = await this.userRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user already has a DID
    if (user.did) {
      this.logger.log(`User ${userId} already has DID: ${user.did}`);
      throw new ConflictException(
        `User ${userId} already has a DID: ${user.did}`,
      );
    }

    // Create DID via Hedera service
    const didResult = await this.hederaService.createDIDForUser(userId);

    // Update user record with DID
    await this.userRepository.update(userId, {
      did: didResult.did,
    });

    this.logger.log(`DID created and saved for user ${userId}`);

    return didResult;
  }
}
