import { Module } from '@nestjs/common';
import { ProductController } from './product.controller.js';
import { ProductService } from './providers/product.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity.js';
import { ConfigModule } from '@nestjs/config';
import cloudinaryConfig from '../config/cloudinary.config.js';
import { ImageUploadsModule } from '../image-uploads/image-uploads.module.js';
import { CategoriesModule } from '../categories/categories.module.js';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [
    TypeOrmModule.forFeature([Product]),
    ConfigModule.forFeature(cloudinaryConfig),
    ImageUploadsModule,
    CategoriesModule
  ],
  exports: [ProductService],
})
export class ProductModule {}
