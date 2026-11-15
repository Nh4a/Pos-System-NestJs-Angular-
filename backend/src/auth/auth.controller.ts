import { Body, Controller, Post } from '@nestjs/common';
import { SigninDto } from './dtos/sigin.dto.js';
import { AuthService } from './providers/auth.service.js';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sing-in')
  public signIn(@Body() signDto: SigninDto) {
    return this.authService.signIn(signDto);
  }
}
