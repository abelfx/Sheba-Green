import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../models/report.schema';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async create(report: Partial<Report>): Promise<Report> {
    const createdReport = new this.reportModel(report);
    return createdReport.save();
  }

  async findById(reportId: string): Promise<Report | null> {
    return this.reportModel.findOne({ reportId }).exec();
  }

  async update(
    reportId: string,
    updates: Partial<Report>,
  ): Promise<Report | null> {
    return this.reportModel
      .findOneAndUpdate({ reportId }, updates, { new: true })
      .exec();
  }

  async findByUserId(userId: string): Promise<Report[]> {
    return this.reportModel.find({ userId }).exec();
  }

  async findMany(
    query: any,
    options?: { skip?: number; limit?: number; sort?: any },
  ): Promise<Report[]> {
    let queryBuilder = this.reportModel.find(query);

    if (options?.sort) {
      queryBuilder = queryBuilder.sort(options.sort);
    }
    if (options?.skip) {
      queryBuilder = queryBuilder.skip(options.skip);
    }
    if (options?.limit) {
      queryBuilder = queryBuilder.limit(options.limit);
    }

    return queryBuilder.exec();
  }

  async count(query: any): Promise<number> {
    return this.reportModel.countDocuments(query).exec();
  }
}
