import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HcsMessageDocument = HcsMessage & Document;

@Schema({ timestamps: true })
export class HcsMessage {
  @Prop({ required: true })
  topicId!: string;

  @Prop({ required: true, type: Object })
  message!: any;

  @Prop({ required: true })
  consensusTimestamp!: string;

  @Prop({ required: true })
  txId!: string;

  @Prop()
  createdAt!: Date;
}

export const HcsMessageSchema = SchemaFactory.createForClass(HcsMessage);
