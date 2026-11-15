import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { CreateUserDto } from '../dtos/create-user.dto.js';
import { UpdateUserDto } from '../dtos/update-user.dto.js';
import { User } from '../user.entity.js';
import { HashingProvider } from '../../auth/providers/hashing.provider.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @Inject(HashingProvider)
    private readonly hashingProvider: HashingProvider,
  ) {}

  // CREATE USER
  public async createUser(dto: CreateUserDto) {
    try {
      let n = 1;
      const existUser = await this.userRepo.findOneBy({
        gmail: dto.gmail,
      });
      if (existUser) {
        throw new ConflictException('Gmail already exists');
      }

      const createUser = {};

      const password = await this.hashingProvider.hashPassword(dto.password);

      const newUser = this.userRepo.create({ ...dto, password });

      return this.userRepo.save(newUser);
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

  // GET USER BY ID
  public async findUserByEmail(gmail: string) {
    const user = await this.userRepo.findOne({
      where: { gmail },
      select: {
        id: true,
        userName: true,
        gmail: true,
        password: true,
      },
    });

    return user;
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
