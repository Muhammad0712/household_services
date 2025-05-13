import { Module } from '@nestjs/common';
import { BotsModule } from './bots/bots.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './bots/models/bot.model';
import { TelegrafModule } from 'nestjs-telegraf';
import { BOT_NAME } from './app.constants';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),

    TelegrafModule.forRootAsync({
      botName: BOT_NAME,
      useFactory: () => ({
        token: process.env.BOT_TOKEN!,
        middlewares: [],
        include: [BotsModule],
      }),
    }),

    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      models: [Bot],
      autoLoadModels: true,
      sync: { alter: true },
      logging: false,
    }),
    BotsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
