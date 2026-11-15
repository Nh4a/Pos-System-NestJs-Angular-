import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import jwtConfig from '../configs/jwt.config.js';
import { request } from 'http';
import { REQUEST_USER_KEY } from '../constands/auth.constand.js';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfIg: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.getTokenFromRequestHeader(request);

    if (!token) {
      throw new UnauthorizedException('Unauthorize');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, this.jwtConfIg);
      request[REQUEST_USER_KEY] = payload;
    } catch (error) {
      throw new UnauthorizedException('Unauthorize');
    }

    return true;
  }

  private getTokenFromRequestHeader(request: Request): string | undefined {
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return undefined;
    }
    return token;
  }
}
