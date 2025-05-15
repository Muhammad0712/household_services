import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./models/user.model";
import * as bcrypt from "bcrypt";
import { PhoneUserDto } from "./dto/phone-user.dto";
import * as otpGenerator from "otp-generator";
import * as uuid from "uuid";
import { BotsService } from "../bots/bots.service";
import { Otp } from "./models/otp.model";
import { AddMinutesToDate } from "../common/helpers/addMinutes";
import { decode, encode } from "../common/helpers/crypto";
import { SmsService } from "../sms/sms.service";
import { VeryfyOtpDto } from "./dto/verify-otp.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Otp) private readonly otpModel: typeof Otp,
    private readonly botService: BotsService,
    private readonly smsService: SmsService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, confirm_password } = createUserDto;
    if (password !== confirm_password) {
      throw new BadRequestException("Parollar mos emas");
    }

    const hashed_password = await bcrypt.hash(password, 7);

    const newUser = await this.userModel.create({
      ...createUserDto,
      hashed_password,
    });

    return newUser;
  }

  findAll() {
    return this.userModel.findAll();
  }

  findUserByEmail(email: string) {
    return this.userModel.findOne({ where: { email } });
  }

  findOne(id: number) {
    return this.userModel.findOne({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async ativateUser(link: string) {
    if (!link) {
      throw new BadRequestException("Activation link not found");
    }

    const updatedUser = await this.userModel.update(
      { is_active: true },
      {
        where: {
          activation_link: link,
          is_active: false,
        },
        returning: true, //effected
      }
    );

    if (!updatedUser[1][0]) {
      throw new BadRequestException("User already activated");
    }

    return {
      message: "User activated successfully",
      is_active: updatedUser[1][0].is_active,
    };
  }

  async newOtp(phoneUserDto: PhoneUserDto) {
    const phone_number = phoneUserDto.phone;

    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    //----------------bot---------------

    const isSend = await this.botService.sendOtp(phone_number, otp);

    if (!isSend) {
      throw new BadRequestException("avval royhatdan oting");
    }

    // return {
    //   message: "OTP botga yuborildi",
    // };

    //----------------sms---------------
    const response = await this.smsService.sendSms(phone_number, otp);

    if (response?.status !== 200) {
      throw new ServiceUnavailableException("otp yuborishda hatolik");
    }

    const message =
      `Otp code has been sent to ****` +
      phone_number.slice(phone_number.length - 4);
    //----------------email---------------
    const now = new Date();
    const expiration_date = AddMinutesToDate(now, 5);
    await this.otpModel.destroy({ where: { phone_number } });
    const newOtpData = await this.otpModel.create({
      id: uuid.v4(),
      otp,
      phone_number,
      expiration_time: expiration_date,
    });

    const details = {
      timestamp: now,
      phone_number,
      otp_id: newOtpData.id,
    };

    const encodedData = await encode(JSON.stringify(details));
    return {
      message: "Otp bot ga yuborildi",
      verification_key: encodedData,
      messageSMS: message,
    };
  }

  async verifyOtp(verifyOtpDto: VeryfyOtpDto) {
    const { verification_key, phone: phone_number, otp } = verifyOtpDto;

    const currentDate = new Date();
    const decodedData = await decode(verification_key);
    const details = JSON.parse(decodedData);

    if (details.phone_number != phone_number) {
      throw new BadRequestException("OTP bu telefon raqamga yuborilmagan");
    }

    const resultOTP = await this.otpModel.findByPk(details.otp_id);

    if (resultOTP == null) {
      throw new BadRequestException("Bunday OTP yo'q");
    }

    if (resultOTP.verified) {
      throw new BadRequestException("Bu OTP avval tekshirilgan");
    }

    if (resultOTP.expiration_time <= currentDate) {
      throw new BadRequestException("OTP vaqti o'tgan");
    }

    if (resultOTP.otp !== otp) {
      throw new BadRequestException("OTP notogri");
    }

    const user = await this.userModel.update(
      { is_owner: true },
      {
        where: {
          phone: phone_number,
        },
        returning: true,
      }
    );

    await this.otpModel.update(
      { verified: true },
      { where: { id: details.otp_id } }
    );

    resultOTP.verified = true;
    await resultOTP.save();

    return { message: "OTP tasdiqlandi" };
  }
}
