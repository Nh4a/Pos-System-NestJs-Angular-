import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { EntityManager, In, Repository } from 'typeorm';
import { Product } from '../product.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from '../dtos/create-product.dto.js';
import { UpdateProductDto } from '../dtos/update-product.dto.js';
import { ImageUploadeService } from '../../image-uploads/providers/image-uploade.service.js';
import { CloudinaryImageData } from '../../image-uploads/interfaces/image-data.interface.js';

@Injectable()
export class ProductService {
  constructor(
    /**
     *inject product repository
     */
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    /**
     * inject upload provider
     */

    private readonly uploadService: ImageUploadeService,
  ) {}

  public async createOneProduct(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ) {
    let imageUploaded: undefined | Partial<CloudinaryImageData> = undefined;
    if (file) {
      try {
        imageUploaded = await this.uploadService.upload(file, 'nest-pos');
      } catch (error) {
        console.log(error);
        throw new ConflictException('Upload image failed');
      }
    }

    try {
      const newProduct = this.productRepo.create({
        ...createProductDto,
        imageUrl: imageUploaded?.imageUrl,
        imagePublicId: imageUploaded?.imagePublicId,
      });
      return await this.productRepo.save(newProduct);
    } catch (error) {
      console.log(error);
      throw new ConflictException('Create product faild');
    }
  }

  public async getAllProduct() {
    try {
      const products = await this.productRepo.find({
        order: {
          id: 'desc',
        },
      });

      return products;
    } catch (error) {
      throw new RequestTimeoutException(
        "Can't fetch product now please try latter",
      );
    }
  }

  public async deleteProduct(id: number) {
    let deleteProduct: Product | null = null;
    try {
      deleteProduct = await this.productRepo.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(
        'Could not find the product please try later',
      );
    }

    if (!deleteProduct) {
      throw new NotFoundException('Product not found');
    }

    if (deleteProduct.imagePublicId) {
      try {
        await this.uploadService.delete(deleteProduct.imagePublicId);
      } catch (error) {
        throw new RequestTimeoutException(
          "can't proccess the request right now",
        );
      }
    }

    try {
      await this.productRepo.remove(deleteProduct);
      console.log('delete');
      return deleteProduct;
    } catch (error) {
      throw new RequestTimeoutException("Can't delete product now");
    }
  }

  public async updateProduct(
    updateProductDto: UpdateProductDto,
    id: number,
    file?: Express.Multer.File,
  ) {
    let productToUpdate: Product | null = null;
    try {
      productToUpdate = await this.productRepo.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(
        "Can't process the request please try later",
      );
    }

    if (!productToUpdate) {
      throw new NotFoundException('Product not found!');
    }

    let imageData: CloudinaryImageData | null = null;
    if (file) {
      try {
        imageData = await this.uploadService.upload(file, 'nest-pos');
      } catch (error) {
        throw new RequestTimeoutException(
          "Can't process the request please try later",
        );
      }
    }

    if (productToUpdate.imageUrl && productToUpdate.imagePublicId) {
      try {
        await this.uploadService.delete(productToUpdate.imagePublicId);
      } catch (error) {
        throw new RequestTimeoutException(
          "Can't process the request please try later",
        );
      }
    }

    // update product information

    productToUpdate.productName = updateProductDto.productName;
    productToUpdate.stockQty = updateProductDto.stockQty;
    productToUpdate.unitPrice = updateProductDto.unitPrice;
    productToUpdate.description = updateProductDto.description
      ? updateProductDto.description
      : undefined;
    productToUpdate.imageUrl = imageData?.imageUrl
      ? imageData.imageUrl
      : undefined;
    productToUpdate.imagePublicId = imageData?.imagePublicId
      ? imageData.imagePublicId
      : undefined;

    return await this.productRepo.save(productToUpdate);
  }

  public async findManyProductById(id: number[]) {
    const products = await this.productRepo.find({
      where: { id: In([...id]) },
    });

    return products;
  }

  public async findAndLockProducts(
    manager: EntityManager,
    productIds: number[],
  ) {
    return manager
      .getRepository(Product)
      .createQueryBuilder('product')
      .where('product.id IN(:...productIds)', { productIds })
      .setLock('pessimistic_write')
      .getMany();
  }

  public async deductStockQuantity(
    manager: EntityManager,
    products: Product[],
    requestItemMap: Map<number, number>,
  ) {
    for (const product of products) {
      const reqestQuantity = requestItemMap.get(product.id)!;
      if (product.stockQty < reqestQuantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.productName}. Available: ${product.stockQty}, Requested: ${reqestQuantity}`,
        );
      }
    }

    for (const product of products) {
      const requestedQuantity = requestItemMap.get(product.id)!;

      product.stockQty -= requestedQuantity;
    }

    return manager.getRepository(Product).save(products);
  }
}
