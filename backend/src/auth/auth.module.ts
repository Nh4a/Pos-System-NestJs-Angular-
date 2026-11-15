import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service.js';
import { BycryptProvider } from './providers/bycrypt.provider.js';
import { HashingProvider } from './providers/hashing.provider.js';
import { GenerateTokenProvider } from './providers/generate-token.provider.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './configs/jwt.config.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: BycryptProvider,
    },
    GenerateTokenProvider,
  ],
  exports: [
    {
      provide: HashingProvider,
      useClass: BycryptProvider,
    },
  ],
  imports: [
    JwtModule,
    ConfigModule.forFeature(jwtConfig),
    forwardRef(() => UsersModule),
  ],
})
export class AuthModule {}
