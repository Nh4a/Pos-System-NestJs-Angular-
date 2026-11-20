import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { memoryStorage } from 'multer';

export const multerOption: MulterOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    const allowFile = ['image/png', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowFile.includes(file.mimetype)) {
      console.log('file.mimetype', file.mimetype);
      throw cb(new Error('Only JPG, PNG and WEBP images are allowed'), false);
    }
    return cb(null, true);
  },
};
