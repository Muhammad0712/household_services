import { Action, Command, Ctx, On, Start, Update } from "nestjs-telegraf";
import { BotsService } from "./bots.service";
import { Context } from "telegraf";
import { UseFilters, UseGuards } from "@nestjs/common";
import { TelegrafExceptionFilter } from "../common/filters/telegraf-exception.filter";
import { AdminGuard } from "../common/guards/admin.guard";

@Update()
export class BotsUpdate {
  constructor(private readonly botsService: BotsService) {}

  //   @UseFilters(TelegrafExceptionFilter)
  //   @UseGuards(AdminGuard)
  //   @Command("admin")
  //   async onAdminCommand(@Ctx() ctx: Context) {
  //     this.botsService.admin_menu(ctx, `Xush kelibsiz, Admin👨‍✈️`);
  //   }

  @Start()
  async onStart(ctx: Context) {
    return this.botsService.start(ctx);
  }

  @Command("stop")
  async onStop(@Ctx() ctx: Context) {
    return this.botsService.onStop(ctx);
  }

  @Action("CLIENT")
  async onClient(@Ctx() ctx: Context) {
    return this.botsService.onClient(ctx);
  }

  @Action("WORKER")
  async onWorker(@Ctx() ctx: Context) {
    return this.botsService.onWorker(ctx)
  }

  @On("contact")
  async onContact(@Ctx() ctx: Context) {
    return this.botsService.onContact(ctx);
  }

  @Action("BACK_TO_MAIN_MENU")
  async onBackToMainMenu(@Ctx() ctx: Context) {
    return this.botsService.onBackToMainMenu(ctx);
  }
  //   @Action("WORKER")
  //   async onWorker(@Ctx() ctx: Context) {
  //     return this.botsService.onWorker(ctx);
  //   }

  @On("message")
  async onMessage(@Ctx() ctx: Context) {
    console.log(ctx.botInfo);
    console.log(ctx.chat);
    console.log(ctx.chat?.id);
    console.log(ctx.from);
    console.log(ctx.from?.id);
  }
}
