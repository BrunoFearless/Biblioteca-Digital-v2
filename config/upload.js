import multer from "multer";
import path from "path";
import fs from "fs";

export function configureUpload(baseDir) {
  const uploadsDir = path.join(baseDir, "public", "uploads", "capas");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const nameParts = file.originalname.split(".");
      const extension = nameParts[nameParts.length - 1];
      const uniqueName = `capa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const mimetypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (mimetypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Arquivo deve ser uma imagem válida"));
      }
    },
  });
}
