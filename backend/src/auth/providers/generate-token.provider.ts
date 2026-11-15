import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../configs/jwt.config.js';
import { User } from '../../users/user.entity.js';

@Injectable()
export class GenerateTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private jwtConfIg: ConfigType<typeof jwtConfig>,
  ) {}

  public async signToken<T>(id: number, jwtTtl: number, payload?: T) {
    return await this.jwtService.signAsync(
      { id, ...payload },
      { secret: this.jwtConfIg.secret, expiresIn: this.jwtConfIg.ttl },
    );
  }

  public async generateToken(user: User) {
    const accessToken = await this.signToken(user.id, this.jwtConfIg.ttl);
    return accessToken;
  }
}
