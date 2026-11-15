import { IsNotEmpty, IsString } from 'class-validator';

export class SigninDto {
  @IsString()
  @IsNotEmpty()
  gmail: string;
  
  @IsString()
  @IsNotEmpty()
  password: string;
}
