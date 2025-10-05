import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  AccountBalanceQuery,
  TokenId,
  TopicId,
} from '@hashgraph/sdk';
import { TokenRepository } from '../repositories/token.repository';
import { HcsMessageRepository } from '../repositories/hcs-message.repository';

interface TokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface MintAndTransferResult {
  tokenId: string;
  txId: string;
}

interface HcsMessageResult {
  consensusTimestamp: string;
  txId: string;
}

interface DidResult {
  did: string;
  didDocument: any;
}

@Injectable()
export class HederaService implements OnModuleInit {
  private readonly logger = new Logger(HederaService.name);
  private client: Client | null = null;
  private operatorId: AccountId | null = null;
  private operatorKey: PrivateKey | null = null;
  private shebaTokenId: TokenId | null = null;
  private hcsTopicId: TopicId | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenRepository: TokenRepository,
    private readonly hcsMessageRepository: HcsMessageRepository,
  ) {}

  async onModuleInit() {
    this.initializeClient();
  }

  private initializeClient(): void {
    const network = this.configService.get<string>('hedera.network');
    const operatorIdStr = this.configService.get<string>('hedera.operatorId');
    const operatorKeyStr = this.configService.get<string>(
      'hedera.operatorPrivateKey',
    );

    // Check if credentials are placeholder values or missing
    if (
      !operatorIdStr ||
      !operatorKeyStr ||
      operatorIdStr.includes('XXXX') ||
      operatorKeyStr.includes('XXXX')
    ) {
      this.logger.warn(
        'Hedera credentials not configured. Hedera functionality will be unavailable. ' +
          'Please set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_PRIVATE_KEY in .env file.',
      );
      return;
    }

    try {
      this.operatorId = AccountId.fromString(operatorIdStr);
      this.operatorKey = PrivateKey.fromString(operatorKeyStr);

      if (network === 'testnet') {
        this.client = Client.forTestnet();
      } else {
        throw new Error(`Unsupported Hedera network: ${network}`);
      }

      this.client.setOperator(this.operatorId, this.operatorKey);

      this.logger.log(
        `Hedera client initialized for ${network} with operator ${operatorIdStr}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to initialize Hedera client: ${errorMessage}. Hedera functionality will be unavailable.`,
      );
    }
  }

  async ensureShebaToken(): Promise<TokenInfo> {
    if (!this.client || !this.operatorId || !this.operatorKey) {
      throw new Error('Hedera client not initialized. Please configure Hedera credentials.');
    }

    const symbol =
      this.configService.get<string>('sheba.tokenTicker') || 'SHEBA';
    const name = this.configService.get<string>('sheba.tokenName') || 'Sheba';

    // Check if token exists in database
    const existingToken = await this.tokenRepository.findBySymbol(symbol);

    if (existingToken) {
      this.shebaTokenId = TokenId.fromString(existingToken.tokenId);
      this.logger.log(`Using existing Sheba token: ${existingToken.tokenId}`);
      return {
        tokenId: existingToken.tokenId,
        name: existingToken.name,
        symbol: existingToken.symbol,
        decimals: existingToken.decimals,
      };
    }

    // Create new token
    this.logger.log('Creating new Sheba token...');

    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTreasuryAccountId(this.operatorId)
      .setAdminKey(this.operatorKey)
      .setSupplyKey(this.operatorKey)
      .freezeWith(this.client);

    const tokenCreateSign = await tokenCreateTx.sign(this.operatorKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(this.client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(this.client);

    const tokenId = tokenCreateReceipt.tokenId;

    if (!tokenId) {
      throw new Error('Failed to create token: tokenId is null');
    }

    this.shebaTokenId = tokenId;

    // Save token metadata to database
    const tokenData = {
      tokenId: tokenId.toString(),
      name,
      symbol,
      decimals: 0,
      totalSupply: 0,
    };

    await this.tokenRepository.create(tokenData);

    this.logger.log(`Sheba token created: ${tokenId.toString()}`);

    return {
      tokenId: tokenId.toString(),
      name,
      symbol,
      decimals: 0,
    };
  }

  async mintAndTransferSheba(
    toAccountId: string,
    amount: number,
  ): Promise<MintAndTransferResult> {
    if (!this.client || !this.operatorId || !this.operatorKey) {
      throw new Error('Hedera client not initialized. Please configure Hedera credentials.');
    }

    try {
      // Ensure token exists
      const tokenInfo = await this.ensureShebaToken();
      const tokenId = TokenId.fromString(tokenInfo.tokenId);

      this.logger.log(
        `Minting ${amount} SHEBA tokens to account ${toAccountId}`,
      );

      // Mint tokens
      const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(amount)
        .freezeWith(this.client);

      const mintSign = await mintTx.sign(this.operatorKey);
      const mintSubmit = await mintSign.execute(this.client);
      await mintSubmit.getReceipt(this.client);

      // Transfer tokens to user
      const transferTx = new TransferTransaction()
        .addTokenTransfer(tokenId, this.operatorId, -amount)
        .addTokenTransfer(tokenId, AccountId.fromString(toAccountId), amount)
        .freezeWith(this.client);

      const transferSign = await transferTx.sign(this.operatorKey);
      const transferSubmit = await transferSign.execute(this.client);
      await transferSubmit.getReceipt(this.client);

      const txId = transferSubmit.transactionId.toString();

      this.logger.log(
        `Successfully transferred ${amount} SHEBA tokens. TxId: ${txId}`,
      );

      return {
        tokenId: tokenId.toString(),
        txId,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to mint and transfer tokens: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async ensureHcsTopic(): Promise<string> {
    if (!this.client || !this.operatorKey) {
      throw new Error('Hedera client not initialized. Please configure Hedera credentials.');
    }

    // Check if topic ID is set in environment
    const envTopicId = this.configService.get<string>('hedera.hcsTopicId');

    if (envTopicId) {
      this.hcsTopicId = TopicId.fromString(envTopicId);
      this.logger.log(`Using HCS topic from environment: ${envTopicId}`);
      return envTopicId;
    }

    // Check if we already have a topic in memory
    if (this.hcsTopicId) {
      return this.hcsTopicId.toString();
    }

    // Create new topic
    this.logger.log('Creating new HCS topic...');

    const topicCreateTx = new TopicCreateTransaction()
      .setSubmitKey(this.operatorKey)
      .freezeWith(this.client);

    const topicCreateSign = await topicCreateTx.sign(this.operatorKey);
    const topicCreateSubmit = await topicCreateSign.execute(this.client);
    const topicCreateReceipt = await topicCreateSubmit.getReceipt(this.client);

    const topicId = topicCreateReceipt.topicId;

    if (!topicId) {
      throw new Error('Failed to create topic: topicId is null');
    }

    this.hcsTopicId = topicId;

    this.logger.log(
      `HCS topic created: ${topicId.toString()}. Add HCS_TOPIC_ID=${topicId.toString()} to your .env file`,
    );

    return topicId.toString();
  }

  async publishHcsMessage(payload: any): Promise<HcsMessageResult> {
    if (!this.client || !this.operatorKey) {
      throw new Error('Hedera client not initialized. Please configure Hedera credentials.');
    }

    try {
      // Ensure topic exists
      const topicIdStr = await this.ensureHcsTopic();
      const topicId = TopicId.fromString(topicIdStr);

      // Serialize payload to JSON
      const message = JSON.stringify(payload);

      this.logger.log(`Publishing HCS message to topic ${topicIdStr}`);

      // Submit message
      const messageTx = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message)
        .freezeWith(this.client);

      const messageSign = await messageTx.sign(this.operatorKey);
      const messageSubmit = await messageSign.execute(this.client);
      await messageSubmit.getReceipt(this.client);

      // Get the transaction record for consensus timestamp
      const messageRecord = await messageSubmit.getRecord(this.client);
      const consensusTimestamp = messageRecord.consensusTimestamp.toString();
      const txId = messageSubmit.transactionId.toString();

      // Save message record to database
      await this.hcsMessageRepository.create({
        topicId: topicIdStr,
        message: payload as Record<string, unknown>,
        consensusTimestamp,
        txId,
      });

      this.logger.log(`HCS message published. TxId: ${txId}`);

      return {
        consensusTimestamp,
        txId,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to publish HCS message: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async getAccountBalance(accountId: string): Promise<number> {
    if (!this.client) {
      throw new Error('Hedera client not initialized. Please configure Hedera credentials.');
    }

    try {
      const account = AccountId.fromString(accountId);

      const balanceQuery = new AccountBalanceQuery().setAccountId(account);

      const balance = await balanceQuery.execute(this.client);

      // Ensure token exists to get tokenId
      const tokenInfo = await this.ensureShebaToken();
      const tokenId = TokenId.fromString(tokenInfo.tokenId);

      // Extract Sheba token balance from tokens map
      const shebaBalance = balance.tokens?.get(tokenId) || 0;

      return Number(shebaBalance);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get account balance for ${accountId}: ${errorMessage}`,
      );
      // Return 0 if account doesn't exist or has no tokens
      return 0;
    }
  }

  async createDIDForUser(userId: string): Promise<DidResult> {
    if (!this.client || !this.operatorId || !this.operatorKey) {
      throw new Error('Hedera client not initialized. Please configure Hedera credentials.');
    }

    try {
      // Generate DID string
      const did = `did:hedera:testnet:${this.operatorId.toString()}_${userId}`;

      this.logger.log(`Creating DID for user ${userId}: ${did}`);

      // Create DID document
      const didDocument = {
        '@context': 'https://www.w3.org/ns/did/v1',
        id: did,
        publicKey: [
          {
            id: `${did}#key-1`,
            type: 'Ed25519VerificationKey2018',
            controller: did,
            publicKeyBase58: this.operatorKey.publicKey.toStringRaw(),
          },
        ],
        authentication: [`${did}#key-1`],
      };

      // Sign DID document (simplified - just add signature field)
      const signatureBytes = this.operatorKey.sign(
        Buffer.from(JSON.stringify(didDocument)),
      );
      const signature = Buffer.from(signatureBytes).toString('hex');

      const signedDidDocument = {
        ...didDocument,
        proof: {
          type: 'Ed25519Signature2018',
          created: new Date().toISOString(),
          proofPurpose: 'authentication',
          verificationMethod: `${did}#key-1`,
          signature,
        },
      };

      // Anchor DID to HCS
      await this.publishHcsMessage({
        type: 'DID_CREATION',
        did,
        userId,
        timestamp: new Date().toISOString(),
        didDocument: signedDidDocument,
      });

      this.logger.log(`DID created and anchored for user ${userId}`);

      return {
        did,
        didDocument: signedDidDocument,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create DID for user ${userId}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    if (!this.client || !this.operatorId) {
      this.logger.warn('Hedera client not initialized');
      return false;
    }

    try {
      // Execute lightweight query to check connectivity
      const balanceQuery = new AccountBalanceQuery().setAccountId(
        this.operatorId,
      );

      await balanceQuery.execute(this.client);

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Hedera health check failed: ${errorMessage}`,
        errorStack,
      );
      return false;
    }
  }
}
