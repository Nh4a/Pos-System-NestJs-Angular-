import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto.js';
import { UserService } from './providers/user.service.js';

@Controller('api/users')
export class UserController {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  @Post()
  public createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  public getAllUsers() {
    return this.userService.findAllUsers();
  }
}
