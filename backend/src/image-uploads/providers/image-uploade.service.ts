import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryImageData } from '../interfaces/image-data.interface.js';
import cloudinaryConfig from '../../config/cloudinary.config.js';
import {
  MulterLimits,
  MulterOptions,
} from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { memoryStorage } from 'multer';

@Injectable()
export class ImageUploadeService {

  constructor(
    /**
     *inject config service
     */
    private readonly configService: ConfigService,
    /**
     * inject cloudinary config
     */
    @Inject(cloudinaryConfig.KEY)
    private readonly cloudConfig: ConfigType<typeof cloudinaryConfig>,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.name'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  public upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<CloudinaryImageData> {
    return new Promise((resovle, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (result) {
            return resovle({
              imageUrl: result.secure_url,
              imagePublicId: result.public_id,
            });
          }
          console.log(error);
          return reject(error || new Error('Image upload failed'));
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  public async delete(imagePublicId: string) {
    return await cloudinary.uploader.destroy(imagePublicId);
  }
}
