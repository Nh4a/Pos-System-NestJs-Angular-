import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './providers/user.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity.js';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
