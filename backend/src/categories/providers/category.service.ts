import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../category.entity.js';
import { CreateCategoryDto } from '../dtos/create-category.dto.js';
import { ImageUploadeService } from '../../image-uploads/providers/image-uploade.service.js';
import { CloudinaryImageData } from '../../image-uploads/interfaces/image-data.interface.js';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @Inject(ImageUploadeService)
    private readonly uploadImageProvider: ImageUploadeService,
  ) {}

  // CREATE
  public async createCategory(
    createCategoryDto: CreateCategoryDto,
    file?: Express.Multer.File,
  ) {
    let uploadData: Partial<CloudinaryImageData> = {};

    try {
      if (file) {
        uploadData = await this.uploadImageProvider.upload(
          file,
          'nest-pos-category',
        );
      }

      const newCategory = this.categoryRepo.create({
        ...createCategoryDto,
        ...uploadData,
      });

      return await this.categoryRepo.save(newCategory);
    } catch (error) {
      // Prevent an uploaded image from being orphaned
      if (uploadData.imagePublicId) {
        await this.uploadImageProvider.delete(uploadData.imagePublicId);
      }

      throw error;
    }
  }

  // READ ALL
  public async getAllCategory() {
    return await this.categoryRepo.find();
  }

  // READ ONE
  public async getCategoryById(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  // UPDATE
  public async updateCategory(
    id: number,
    updateCategoryDto: Partial<CreateCategoryDto>,
    file?: Express.Multer.File,
  ) {
    const category = await this.getCategoryById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    let newUploadData: Partial<CloudinaryImageData> = {};

    try {
      if (file) {
        newUploadData = await this.uploadImageProvider.upload(
          file,
          'nest-pos-category',
        );
      }

      Object.assign(category, updateCategoryDto, newUploadData);

      const updatedCategory = await this.categoryRepo.save(category);

      // Delete old image only after database update succeeds
      if (file && category.imagePublicId) {
        const oldPublicId = category.imagePublicId;

        // See the note below about preserving the old public ID.
      }

      return updatedCategory;
    } catch (error) {
      if (newUploadData.imagePublicId) {
        await this.uploadImageProvider.delete(newUploadData.imagePublicId);
      }

      throw new InternalServerErrorException('Server Error');
    }
  }

  // DELETE (SOFT DELETE)
  public async deleteCategory(id: number) {
    const category = await this.getCategoryById(id);

    await this.categoryRepo.softRemove(category);

    return {
      message: 'Category deleted successfully',
    };
  }

  //GET BY ID
  public async getProductById(id: number) {
    try {
      const category = await this.categoryRepo.findOneBy({ id });
      if (category) {
        throw new NotFoundException();
      }
      return category;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException('Category not found');

      throw new InternalServerErrorException(error);
    }
  }
}
