// import { Injectable } from "@nestjs/common";
// import { InjectModel } from "@nestjs/sequelize";
// import { InjectBot } from "nestjs-telegraf";
// // import { Client } from "./models/client.model";
// // import { BOT_NAME } from "../app.constants";
// import { Context, Markup, Telegraf } from "telegraf";

// @Injectable()
// export class BotsService {
//   constructor(
//     // @InjectModel(Client) private readonly botModel: typeof Client,
//     // @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
//   ) {}

//   async start(ctx: Context) {
//     try {
//       //   const user_id = ctx.from?.id;
//       //   const user = await this.botModel.findByPk(user_id);
//       //   if (!user) {
//       //     await this.botModel.create({
//       //       user_id: user_id!,
//       //       username: ctx.from?.username!,
//       //       first_name: ctx.from?.first_name!,
//       //       last_name: ctx.from?.last_name!,
//       //       lang: ctx.from?.language_code!,
//       //     });

//       await ctx.replyWithHTML(
//         `Assalomu aleykum Mijoz yoki Ishchi sifatida ro'yxatdan o'tish uchun quyidagilardan birini tanlang!`,
//         {
//           ...Markup.inlineKeyboard([
//             [Markup.button.callback("Mijoz", "CLIENT")],
//             [Markup.button.callback("Ishchi", "WORKER")],
//           ]),
//         }
//       );
//       //   } else if (!user?.status || !user.phone_number) {
//       //     await ctx.replyWithHTML(
//       //       `Iltimos <b> Telefon raqamni yuborish</b> tugmasini bosing!`,
//       //       {
//       //         ...Markup.keyboard([
//       //           Markup.button.contactRequest("Telefon raqamni yuborish"),
//       //         ])
//       //           .oneTime()
//       //           .resize(),
//       //       }
//       //     );
//       //   } else if (user.phone_number) {
//       //     await this.bot.telegram.sendChatAction(user_id!, "typing");
//       //     await ctx.replyWithHTML(`Avval royhatdan otgansiz❌`, {
//       //       ...Markup.removeKeyboard,
//       //     });
//       //   } else {
//       //     await ctx.replyWithHTML(
//       //       `Bu bot orqali skidkachi dasturida sotuvchilar faollashtiriladi!`,
//       //       {
//       //         ...Markup.removeKeyboard(),
//       //       }
//       //     );
//       //   }
//     } catch (error) {
//       console.log(`Error on start: ${error}`);
//     }
//   }

//   async onContact(ctx: Context) {
//     try {
//       const user_id = ctx.from?.id;
//       const user = await this.botModel.findByPk(user_id);
//       console.log(user);
//       if (!user) {
//         await ctx.replyWithHTML(`Iltimos <b> start </b> tugmasini bosing!`, {
//           ...Markup.keyboard(["/start"]).oneTime().resize(),
//         });
//       } else if (
//         "contact" in ctx.message! &&
//         ctx.message.contact.user_id !== user_id
//       ) {
//         await ctx.replyWithHTML(
//           `Iltimos o'zingizni telefon raqamingizni yuboring!`,
//           {
//             ...Markup.keyboard(["/start"]).oneTime().resize(),
//           }
//         );
//       } else if ("contact" in ctx.message!) {
//         let phone = ctx.message.contact.phone_number;
//         if (phone[0] != "+") {
//           phone = "+" + phone;
//         }
//         user.phone_number = phone;
//         user.status = true;
//         await user.save();
//         await ctx.replyWithHTML(`Xush kelibsiz! <b>${user.first_name}</b>`, {
//           ...Markup.removeKeyboard(),
//         });
//         await ctx.replyWithHTML(
//           "Iltimos <b>🛠 Servis xizmatlari</b> tugmasini bosing!",
//           Markup.inlineKeyboard([
//             [Markup.button.callback("🛠 Servis xizmatlari", "SERVICES")],
//           ])
//         );
//       } else if (user.phone_number) {
//         await this.bot.telegram.sendChatAction(user_id!, "typing");
//         await ctx.replyWithHTML(`Oldin ro'yxatdan o'tgangiz!`, {
//           ...Markup.removeKeyboard(),
//         });
//       }
//     } catch (error) {
//       console.log(`Error on Contact: ${error}`);
//     }
//   }

//   async onStop(ctx: Context) {
//     try {
//       const user_id = ctx.from?.id;
//       const user = await this.botModel.findByPk(user_id);
//       if (!user) {
        // await ctx.replyWithHTML(`Iltimos <b> start </b> tugmasini bosing!`, {
        //   ...Markup.keyboard(["/start"]).oneTime().resize(),
        // });
//       } else if (user.status) {
//         user.status = false;
//         user.phone_number = "";
//         await user.save();
//         await ctx.replyWithHTML(
//           `Siz vaqtincha botdan chiqdingiz! Qayta faollashtirish uchun <b>start</b> tugmasini bosing!`,
//           {
//             ...Markup.keyboard(["/start"]).oneTime().resize(),
//           }
//         );
//       }
//     } catch (error) {
//       console.log(`Error on stop: ${error}`);
//     }
//   }

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

//   async sendOtp(phone_number: string, OTP: string) {
//     try {
//       const user = await this.botModel.findOne({ where: { phone_number } });
//       if (!user || !user.status) {
//         return false;
//       }
//       await this.bot.telegram.sendMessage(user.user_id, `Verify ${OTP}`);
//       return true;
//     } catch (error) {
//       console.log("eeeeeeeeee", error);
//     }
//   }
// }
