import { Module } from "@nestjs/common";
import { BotsModule } from "./bots/bots.module";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { Client } from "./bots/models/client.model";
import { TelegrafModule } from "nestjs-telegraf";
import { BOT_NAME } from "./app.constants";
import { SmsModule } from "./sms/sms.module";
import { Worker } from "./bots/models/worker.model";

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
      models: [Client, Worker],
      autoLoadModels: true,
      sync: { alter: true },
      logging: false,
    }),
    BotsModule,
    SmsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
