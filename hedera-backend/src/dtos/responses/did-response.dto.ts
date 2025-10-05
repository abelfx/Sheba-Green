import { ApiProperty } from '@nestjs/swagger';

export class DidResponseDto {
  @ApiProperty({
    description: 'Decentralized identifier string',
    example: 'did:hedera:testnet:0.0.123456_user123',
  })
  did!: string;

  @ApiProperty({
    description: 'Complete DID document',
    example: {
      id: 'did:hedera:testnet:0.0.123456_user123',
      publicKey: [
        {
          id: 'did:hedera:testnet:0.0.123456_user123#key-1',
          type: 'Ed25519VerificationKey2018',
          controller: 'did:hedera:testnet:0.0.123456_user123',
          publicKeyBase58: '...',
        },
      ],
      authentication: ['did:hedera:testnet:0.0.123456_user123#key-1'],
    },
  })
  didDocument!: any;
}
