import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  gmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
