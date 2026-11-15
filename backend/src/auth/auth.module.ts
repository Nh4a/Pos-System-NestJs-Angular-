import { Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service.js';
import { BycryptProvider } from './providers/bycrypt.provider.js';
import { HashingProvider } from './providers/hashing.provider.js';
import { GenerateTokenProvider } from './providers/generate-token.provider.js';
import { AuthController } from './auth.controller.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, BycryptProvider, HashingProvider, GenerateTokenProvider]
})
export class AuthModule {}
