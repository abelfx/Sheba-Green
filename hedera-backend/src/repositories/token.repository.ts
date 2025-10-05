import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from '../models/token.schema';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async create(token: Partial<Token>): Promise<Token> {
    const createdToken = new this.tokenModel(token);
    return createdToken.save();
  }

  async findBySymbol(symbol: string): Promise<Token | null> {
    return this.tokenModel.findOne({ symbol }).exec();
  }
}
