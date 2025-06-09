import multer from 'multer';
import { Request } from 'express';

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error('Only image files are allowed!'));
  }
  cb(null, true);
};

// Create multer instance with memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});
