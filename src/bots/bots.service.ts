import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Client } from "./models/client.model";
import { BOT_NAME } from "../app.constants";
import { Context, Markup, Telegraf } from "telegraf";
import { Worker } from "./models/worker.model";

@Injectable()
export class BotsService {
  constructor(
    @InjectModel(Client) private readonly clientModel: typeof Client,
    @InjectModel(Worker) private readonly workerModel: typeof Worker,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  async start(ctx: Context) {
    try {
      await ctx.replyWithHTML(
        `Assalomu aleykum! Mijoz yoki Ishchi sifatida ro'yxatdan o'tish uchun quyidagilardan birini tanlang!`,
        {
          ...Markup.inlineKeyboard([
            [Markup.button.callback("Mijoz", "CLIENT")],
            [Markup.button.callback("Ishchi", "WORKER")],
          ]),
        }
      );
    } catch (error) {
      console.log(`Error on start: ${error}`);
    }
  }

  async onStop(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.clientModel.findByPk(user_id);
      if (user) {
        if (user.phone_number && user.status) {
          await this.clientModel.update(
            { status: false, phone_number: "" },
            { where: { user_id: user_id } }
          );
          await ctx.replyWithHTML(
            `Siz vaqtincha botdan chiqdingiz! Qayta faollashtirish uchun <b> start </b> tugmasini bosing!`,
            {
              ...Markup.keyboard(["/start"]).oneTime().resize(),
            }
          );
        } else {
          await ctx.replyWithHTML(
            `Stopni bosishiz shartmas baribir aktivlashtirilmagansiz. Aktivlashtirishni xohlasangiz 1tasini bosing👇!`,
            {
              ...Markup.inlineKeyboard([
                [Markup.button.callback("Mijoz", "CLIENT")],
                [Markup.button.callback("Ishchi", "WORKER")],
              ]),
            }
          );
        }
      } else {
        const worker = await this.workerModel.findByPk(user_id);
        if (worker) {
          if (worker.phone_number && worker.status != false) {
            await this.workerModel.update(
              { status: false, phone_number: "" },
              { where: { user_id: user_id } }
            );
            await ctx.replyWithHTML(
              `Siz vaqtincha botdan chiqdingiz! Qayta faollashtirish uchun <b> start </b> tugmasini bosing!`,
              {
                ...Markup.keyboard(["/start"]).oneTime().resize(),
              }
            );
          } else {
            await ctx.replyWithHTML(
              `Stopni bosishiz shartmas baribir aktivlashtirilmagansiz. Aktivlashtirishni xohlasangiz 1tasini bosing👇!`,
              {
                ...Markup.inlineKeyboard([
                  [Markup.button.callback("Mijoz", "CLIENT")],
                  [Markup.button.callback("Ishchi", "WORKER")],
                ]),
              }
            );
          }
        } else {
          await ctx.replyWithHTML(
            `Stopni bosishiz shartmas baribir aktivlashtirilmagansiz. Aktivlashtirishni xohlasangiz startni bosing👇!`,
            {
              ...Markup.keyboard(["/start"]).oneTime().resize(),
            }
          );
        }
      }
    } catch (error) {
      console.log(`Error on stop: ${error}`);
    }
  }

  // ------------------------------CLIENT------------------------------
  async onClient(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.clientModel.findByPk(user_id);
      if (user) {
        if (!user?.phone_number || !user?.status) {
          await ctx.replyWithHTML(
            `Iltimos o'zingizni telefon raqamingizni yuboring!`,
            Markup.keyboard([
              Markup.button.contactRequest("📞 Raqamni yuborish"),
            ])
              .oneTime()
              .resize()
          );
        } else {

        }
      } else {
        await this.clientModel.create({
          user_id: user_id!,
          username: ctx.from?.username!,
          first_name: ctx.from?.first_name!,
          last_name: ctx.from?.last_name!,
          lang: ctx.from?.language_code!,
        });
      }
      
      
    } catch (error) {
      console.log(error);
    }
  }

  async onContact(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.clientModel.findByPk(user_id);
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
          `Iltimos o'zingizni raqamingizni yuboring!`,
          Markup.keyboard([Markup.button.contactRequest("📞 Raqamni yuborish")]).oneTime().resize()
        );
      } else if ("contact" in ctx.message!) {
        let phone = ctx.message.contact.phone_number;
        if (phone[0] != "+") {
          phone = "+" + phone;
        }
        user.phone_number = phone;
        user.status = true;
        await user.save();

        await ctx.replyWithHTML(`Ro'yxatdan muvaffaqiyatli o'tdingiz!✅`, {
          ...Markup.removeKeyboard(),
        });
        console.log(ctx.message.message_id);
        
        await ctx.replyWithHTML(
          `O'zingizga kerakli xizmat turini tanlang! Ortga qaytish uchun <b>Ortga qaytish tugmasini bosing!</b>`,
          Markup.inlineKeyboard([
            [Markup.button.callback(" Santexnik xizmati", "SANTEXNIK")],
            [Markup.button.callback(" Elektrik xizmati", "ELEKTRIK")],
            [Markup.button.callback(" Gaz xizmati", "GAZ")],
            [Markup.button.callback(" Tamirlash xizmati", "TAMIRLASH")],
            [
              Markup.button.callback(
                " Uskunalarni tuzatish xizmati",
                "USKUNALAR"
              ),
            ],
            [Markup.button.callback("Ortga qaytish", "BACK_TO_MAIN_MENU")],
          ])
        );
      } else if (user.phone_number) {
        await ctx.replyWithHTML(`Oldin ro'yxatdan o'tgangiz!`, {
          ...Markup.removeKeyboard(),
        });
      }
    } catch (error) {
      console.log(`Error on Contact: ${error}`);
    }
  }

  async onBackToMainMenu(ctx: Context) {
    try {
      ctx.deleteMessage();
      await ctx.replyWithHTML(
        ` Mijoz yoki Ishchi sifatida ro'yxatdan o'tish uchun quyidagilardan birini tanlang!`,
        {
          ...Markup.inlineKeyboard([
            [Markup.button.callback("Mijoz", "CLIENT")],
            [Markup.button.callback("Ishchi", "WORKER")],
          ]),
        }
      );
    } catch (error) {
      console.log(error);
    }
  } //------------------------------CLIENT------------------------------

  // ------------------------------WORKER------------------------------

  async onWorker(ctx: Context) {
    try {
      await ctx.replyWithHTML(
        `Agar ushbu kasblar orasida o'zingizni yo'nalishingiz bo'lsa ushbu kasblardan birini tanlang talang!</b>`,
        Markup.inlineKeyboard([
          [Markup.button.callback(" Santexnik", "SANTEXNIK")],
          [Markup.button.callback(" Elektrik", "ELEKTRIK")],
          [Markup.button.callback(" Gaz xodimi", "GAZ")],
          [Markup.button.callback(" Uy tamirlash", "TAMIRLASH")],
          [Markup.button.callback(" Uskunalarni tuzatish", "USKUNALAR")],
          [Markup.button.callback("Ortga qaytish", "BACK_TO_MAIN_MENU")],
        ])
      );
    } catch (error) {
      console.log(error);
    }
  }
  //   async admin_menu(ctx: Context, menu_text = `<b>Admin menusi</b>`) {
  //     try {
  //       await ctx.reply(menu_text, {
  //         parse_mode: "HTML",
  //         ...Markup.keyboard([["Mening manzillarim", "Yangi manzil qo'shish"]])
  //           .oneTime()
  //           .resize(),
  //       });
  //     } catch (error) {
  //       console.log(`Admin menusida xatolik: ${error}`);
  //     }
  //   }

  async sendOtp(phone_number: string, OTP: string) {
    try {
      const user = await this.clientModel.findOne({ where: { phone_number } });
      if (!user || !user.status) {
        return false;
      }
      await this.bot.telegram.sendMessage(user.user_id, `Verify ${OTP}`);
      return true;
    } catch (error) {
      console.log("eeeeeeeeee", error);
    }
  }
}
