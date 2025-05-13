import { Module } from '@nestjs/common';
import { BotsService } from './bots.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { BotsUpdate } from './bots.update';

@Module({ 
  imports: [SequelizeModule.forFeature([Bot])],
  controllers: [],
  providers: [BotsService, BotsUpdate],
  exports: [BotsService]
})
export class BotsModule {}
