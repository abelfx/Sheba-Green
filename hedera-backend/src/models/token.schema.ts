import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema({ timestamps: true })
export class Token {
  @Prop({ required: true, unique: true })
  tokenId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  symbol!: string;

  @Prop({ required: true })
  decimals!: number;

  @Prop({ required: true })
  totalSupply!: number;

  @Prop()
  createdAt!: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
