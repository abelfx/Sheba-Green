import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  userId!: string;

  @Prop({ required: true })
  displayName!: string;

  @Prop({ required: true })
  hederaAccountId!: string;

  @Prop()
  evmAddress?: string;

  @Prop()
  did?: string;

  @Prop()
  createdAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
