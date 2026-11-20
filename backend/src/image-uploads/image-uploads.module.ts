import { Module } from '@nestjs/common';
import { ImageUploadeService } from './providers/image-uploade.service.js';

@Module({
  providers: [ImageUploadeService],
  exports: [ImageUploadeService],
})
export class ImageUploadsModule {}
