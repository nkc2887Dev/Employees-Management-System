import multer from 'multer';
import { Request } from 'express';

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error('Only image files are allowed!'));
  }
  cb(null, true);
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});
