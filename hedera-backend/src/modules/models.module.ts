import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models/user.schema';
import { Report, ReportSchema } from '../models/report.schema';
import { Token, TokenSchema } from '../models/token.schema';
import { HcsMessage, HcsMessageSchema } from '../models/hcs-message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Report.name, schema: ReportSchema },
      { name: Token.name, schema: TokenSchema },
      { name: HcsMessage.name, schema: HcsMessageSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ModelsModule {}
