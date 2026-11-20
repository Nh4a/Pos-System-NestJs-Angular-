import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './providers/category.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity.js';
import { ImageUploadsModule } from '../image-uploads/image-uploads.module.js';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  imports: [TypeOrmModule.forFeature([Category]), ImageUploadsModule]
})
export class CategoriesModule {}
