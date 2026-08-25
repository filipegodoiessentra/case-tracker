import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { config } from './index';

const uploadsPath = path.resolve(process.cwd(), config.uploadsDir);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsPath),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

export const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
export const uploadsDirAbsolute = uploadsPath;
