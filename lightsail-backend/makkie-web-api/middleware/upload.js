const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { db, UPLOAD_DIR } = require("../db");

function getExtension(file) {
  const originalExt = path.extname(file.originalname || "").toLowerCase();
  if (originalExt) return originalExt;

  if (file.mimetype === "image/png") return ".png";
  if (file.mimetype === "image/webp") return ".webp";
  return ".jpg";
}

function getSafeFileBase(value, fallback) {
  const base = String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);
  return base || fallback;
}

function getProductImageFileName(req, file) {
  const productId = Number(req.params && req.params.id);
  const product = productId
    ? db.prepare("SELECT name FROM products WHERE id = ?").get(productId)
    : null;
  const ext = getExtension(file);
  const base = getSafeFileBase(product && product.name, productId ? `product-${productId}` : "product");
  const uploadPath = path.join(UPLOAD_DIR, "products");
  let fileName = `${base}${ext}`;
  let index = 2;

  while (fs.existsSync(path.join(uploadPath, fileName))) {
    fileName = `${base}-${index}${ext}`;
    index += 1;
  }

  return fileName;
}

function getCollectionImageFileName(req) {
  const fileName = path.basename(String((req.params && req.params.fileName) || ""));
  if (!/^collection-\d+\.jpe?g$/i.test(fileName)) {
    return "";
  }
  return fileName.replace(/\.jpeg$/i, ".jpg");
}

const productImageStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(UPLOAD_DIR, "products"));
  },
  filename(req, file, cb) {
    cb(null, getProductImageFileName(req, file));
  }
});

const productImageUpload = multer({
  storage: productImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const collectionImageUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, path.join(UPLOAD_DIR, "collection"));
    },
    filename(req, file, cb) {
      const fileName = getCollectionImageFileName(req);
      if (!fileName) {
        cb(new Error("Invalid collection image filename"));
        return;
      }
      cb(null, fileName);
    }
  }),
  fileFilter(req, file, cb) {
    if (file.mimetype === "image/jpeg" || /\.(jpe?g)$/i.test(file.originalname || "")) {
      cb(null, true);
      return;
    }
    cb(new Error("Collection images must be JPG"));
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, path.join(UPLOAD_DIR, "avatars"));
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
  }),
  limits: {
    fileSize: 3 * 1024 * 1024
  }
});

module.exports = {
  productImageUpload,
  collectionImageUpload,
  avatarUpload
};
