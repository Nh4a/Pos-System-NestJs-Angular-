import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './providers/user.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity.js';
import { HashingProvider } from '../auth/providers/hashing.provider.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User]), forwardRef(()=>AuthModule)],
  exports: [UserService]
})
export class UsersModule {}
