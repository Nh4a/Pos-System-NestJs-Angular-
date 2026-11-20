
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { CreateCategoryDto } from './dtos/create-category.dto.js';
import { CategoryService } from './providers/category.service.js';
import { multerOption } from '../common/configs/multer.config.js';

@Controller('api/category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  // CREATE
  @Post()
  @UseInterceptors(FileInterceptor('file', multerOption))
  public createCategory(
    @Body() createCategory: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoryService.createCategory(
      createCategory,
      file,
    );
  }

  // READ ALL
  @Get()
  public getAll() {
    return this.categoryService.getAllCategory();
  }

  // READ ONE
  @Get(':id')
  public getById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoryService.getCategoryById(id);
  }

  // UPDATE
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', multerOption))
  public updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategory: Partial<CreateCategoryDto>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoryService.updateCategory(
      id,
      updateCategory,
      file,
    );
  }

  // DELETE
  @Delete(':id')
  public deleteCategory(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoryService.deleteCategory(id);
  }
}
