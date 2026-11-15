import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { CreateUserDto } from '../dtos/create-user.dto.js';
import { UpdateUserDto } from '../dtos/update-user.dto.js';
import { User } from '../user.entity.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // CREATE USER
  public async createUser(dto: CreateUserDto) {
    try {
      let n = 1;
      const existUser = await this.userRepo.findOneBy({
        gmail: dto.gmail,
      });
      console.log(++n);
      if (existUser) {
        throw new ConflictException('Gmail already exists');
      }
      console.log(++n);
      
      const newUser = this.userRepo.create(dto);
      console.log(++n);
      console.log(dto);
      console.log(newUser);
      
      const savedUser = await this.userRepo.save(newUser);
      console.log(++n);
      
      const { password, ...result } = savedUser;
      console.log(++n);

      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException(error);
      console.log(error);
    }
  }

  // GET ALL USERS
  public async findAllUsers() {
    try {
      return await this.userRepo.find({
        select: {
          id: true,
          userName: true,
          gmail: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  // GET USER BY ID
  public async findUserById(id: number) {
    try {
      const user = await this.userRepo.findOne({
        where: { id },
        select: {
          id: true,
          userName: true,
          gmail: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  // UPDATE USER
  public async updateUser(id: number, dto: UpdateUserDto) {
    try {
      const user = await this.userRepo.findOneBy({ id });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Check if Gmail already belongs to another user
      if (dto.gmail && dto.gmail !== user.gmail) {
        const existUser = await this.userRepo.findOneBy({
          gmail: dto.gmail,
          id: Not(id),
        });

        if (existUser) {
          throw new ConflictException('Gmail already exists');
        }
      }

      Object.assign(user, dto);

      const updatedUser = await this.userRepo.save(user);

      const { password, ...result } = updatedUser;

      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update user');
    }
  }

  // DELETE USER
  public async deleteUser(id: number) {
    try {
      const user = await this.userRepo.findOneBy({ id });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.userRepo.remove(user);

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
