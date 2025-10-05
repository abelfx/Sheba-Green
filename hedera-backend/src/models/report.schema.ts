import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

export enum ReportStatus {
  AWAITING_CLEAN = 'AWAITING_CLEAN',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Report {
  @Prop({ required: true, unique: true })
  reportId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  beforeImagePath!: string;

  @Prop()
  afterImagePath?: string;

  @Prop({ type: Object })
  detectionResult!: any;

  @Prop({ type: Object })
  randomPrompt!: any;

  @Prop({ type: Object })
  verificationResult?: any;

  @Prop({ required: true, enum: Object.values(ReportStatus) })
  status!: ReportStatus;

  @Prop()
  tokenTxId?: string;

  @Prop()
  hcsMessageId?: string;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
