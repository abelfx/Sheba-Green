import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findOne({ userId }).exec();
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    return this.userModel.find({ userId: { $in: userIds } }).exec();
  }

  async update(userId: string, updateData: Partial<User>): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate({ userId }, updateData, { new: true })
      .exec();
  }

  async findOrCreate(userData: Partial<User>): Promise<User> {
    if (!userData.userId) {
      throw new Error('userId is required');
    }
    const existing = await this.findById(userData.userId);
    if (existing) {
      return existing;
    }
    return this.create(userData);
  }

  async findByUserId(userId: string): Promise<User | null> {
    return this.findById(userId);
  }
}
