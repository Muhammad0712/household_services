import { Command, Ctx, On, Start, Update } from "nestjs-telegraf";
import { BotsService } from "./bots.service";
import { Context } from "telegraf";

@Update()
export class BotsUpdate {
  constructor(private readonly botsService: BotsService) {}
  @Start()
  async onStart(ctx: Context) {
    return this.botsService.start(ctx);
  }

  @On("contact")
  async onContact(@Ctx() ctx: Context) {
    return this.botsService.onContact(ctx);
  }

  @Command("stop")
  async onCommandHelp(@Ctx() ctx: Context) {
    return this.botsService.onStop(ctx);
  }
}