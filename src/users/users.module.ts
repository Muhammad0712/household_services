import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./models/user.model";
import { BotsModule } from "../bots/bots.module";
import { SmsModule } from "../sms/sms.module";

@Module({
  imports: [SequelizeModule.forFeature([User]), BotsModule, SmsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
