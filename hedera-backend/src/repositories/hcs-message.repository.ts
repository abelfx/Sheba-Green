import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HcsMessage, HcsMessageDocument } from '../models/hcs-message.schema';

@Injectable()
export class HcsMessageRepository {
  constructor(
    @InjectModel(HcsMessage.name)
    private hcsMessageModel: Model<HcsMessageDocument>,
  ) {}

  async create(message: Partial<HcsMessage>): Promise<HcsMessage> {
    const createdMessage = new this.hcsMessageModel(message);
    return createdMessage.save();
  }

  async findRecent(limit: number, offset: number): Promise<HcsMessage[]> {
    return this.hcsMessageModel
      .find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }
}
