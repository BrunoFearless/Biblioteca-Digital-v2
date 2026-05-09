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
      const folder = file.fieldname === 'pdf' ? 'livros' : 'capas';
      const target = path.join(baseDir, "public", "uploads", folder);
      if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
      cb(null, target);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const prefix = file.fieldname === 'pdf' ? 'book' : 'capa';
      const uniqueName = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}${ext}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Aumentar limite para 20MB para PDFs
    fileFilter: (req, file, cb) => {
      const imageTypes = ["image/jpeg", "image/png", "image/webp"];
      if (file.fieldname === 'pdf') {
        if (file.mimetype === "application/pdf") cb(null, true);
        else cb(new Error("Arquivo deve ser um PDF válido"));
      } else {
        if (imageTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Arquivo deve ser uma imagem válida"));
      }
    },
  });
}
