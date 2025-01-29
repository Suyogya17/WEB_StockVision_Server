const multer = require("multer");
const maxSize = 2 * 1024 * 1024; // 2MB
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb( Error("File format not supported."), false);
  }
  cb(null, true);
};

const uploadMiddleware = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSize },
});

module.exports = uploadMiddleware;
