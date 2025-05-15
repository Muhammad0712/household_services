import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class VeryfyOtpDto {
  @IsPhoneNumber("UZ")
  phone: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  verification_key: string;
}
