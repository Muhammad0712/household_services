import { Module } from "@nestjs/common";
import { BotsService } from "./bots.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Client } from "./models/client.model";
import { BotsUpdate } from "./bots.update";
import { Worker } from "./models/worker.model";

@Module({
  imports: [SequelizeModule.forFeature([Client, Worker])],
  controllers: [],
  providers: [BotsService, BotsUpdate],
  exports: [BotsService],
})
export class BotsModule {}
