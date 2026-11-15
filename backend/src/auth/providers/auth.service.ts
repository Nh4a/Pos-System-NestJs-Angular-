import {
  forwardRef,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SigninDto } from '../dtos/sigin.dto.js';
import { GenerateTokenProvider } from './generate-token.provider.js';
import { UserService } from '../../users/providers/user.service.js';
import { HashingProvider } from './hashing.provider.js';
import { inject } from 'vitest';

@Injectable()
export class AuthService {
  constructor(
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly userService: UserService,
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async signIn(signInDto: SigninDto) {
    try {
      const user = await this.userService.findUserByEmail(signInDto.gmail);
      if (!user) {
        throw new UnauthorizedException();
      }

      const isCorrectPassword = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );

      if (!isCorrectPassword) {
        throw new UnauthorizedException();
      }

      const token = await this.generateTokenProvider.generateToken(user);
      return { token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials');
      }

      throw new InternalServerErrorException('InternalServerErrorException');
    }
  }
}
