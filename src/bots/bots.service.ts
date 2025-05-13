import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectBot } from 'nestjs-telegraf';
import { Bot } from './models/bot.model';
import { BOT_NAME } from '../app.constants';
import { Context, Markup, Telegraf } from 'telegraf';

@Injectable()
export class BotsService {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  async start(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findByPk(user_id);
      if (!user) {
        await this.botModel.create({
          user_id: user_id!,
          username: ctx.from?.username!,
          first_name: ctx.from?.first_name!,
          last_name: ctx.from?.last_name!,
          lang: ctx.from?.language_code!,
        });

        await ctx.replyWithHTML(
          `Iltimos <b>📞 Telefon raqamni yuborish</b> tugmasini bosing!`,
          {
            ...Markup.keyboard([
              Markup.button.contactRequest("Telefon raqamni yuborish"),
            ])
              .oneTime()
              .resize(),
          }
        );
      } else if (!user?.status || !user.phone_number) {
        await ctx.replyWithHTML(
          `Iltimos <b> Telefon raqamni yuborish</b> tugmasini bosing!`,
          {
            ...Markup.keyboard([
              Markup.button.contactRequest("Telefon raqamni yuborish"),
            ])
              .oneTime()
              .resize(),
          }
        );
      } else if (user.phone_number) {
        await this.bot.telegram.sendChatAction(user_id!, "typing");
        await ctx.replyWithHTML(`Avval royhatdan otgansiz❌`, {
          ...Markup.removeKeyboard,
        });
      } else {
        await ctx.replyWithHTML(
          `Bu bot orqali skidkachi dasturida sotuvchilar faollashtiriladi!`,
          {
            ...Markup.removeKeyboard(),
          }
        );
      }
    } catch (error) {
      console.log(`Error on start: ${error}`);
    }
  }

  async onContact(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findByPk(user_id);
      console.log(user);
      if (!user) {
        await ctx.replyWithHTML(`Iltimos <b> start </b> tugmasini bosing!`, {
          ...Markup.keyboard(["/start"]).oneTime().resize(),
        });
      } else if (
        "contact" in ctx.message! &&
        ctx.message.contact.user_id !== user_id
      ) {
        await ctx.replyWithHTML(
          `Iltimos o'zingizni telefon raqamingizni yuboring!`,
          {
            ...Markup.keyboard(["/start"]).oneTime().resize(),
          }
        );
      } else if ("contact" in ctx.message!) {
        let phone = ctx.message.contact.phone_number;
        if (phone[0] != "+") {
          phone = "+" + phone;
        }
        user.phone_number = phone;
        user.status = true;
        await user.save();
        await ctx.replyWithHTML(`Muvaffaqiyatli ro'yxatdan o'tdingiz!✅`, {
          ...Markup.removeKeyboard(),
        });
      } else if (user.phone_number) {
        await this.bot.telegram.sendChatAction(user_id!, "typing");
        await ctx.replyWithHTML(`Oldin ro'yxatdan o'tgangiz!`, {
          ...Markup.removeKeyboard(),
        });
      }
    } catch (error) {
      console.log(`Error on Contact: ${error}`);
    }
  }

  async onStop(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findByPk(user_id);
      if (!user) {
        await ctx.replyWithHTML(`Iltimos <b> start </b> tugmasini bosing!`, {
          ...Markup.keyboard(["/start"]).oneTime().resize(),
        });
      } else if (user.status) {
        user.status = false;
        user.phone_number = "";
        await user.save();
        await ctx.replyWithHTML(
          `Siz vaqtincha botdan chiqdingiz! Qayta faollashtirish uchun <b>start</b> tugmasini bosing!`,
          {
            ...Markup.keyboard(["/start"]).oneTime().resize(),
          }
        );
      }
    } catch (error) {
      console.log(`Error on stop: ${error}`);
    }
  }
}
