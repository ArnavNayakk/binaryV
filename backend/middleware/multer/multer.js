import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Generate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  MAIN UPLOAD DIRECTORY
const rootUploadDir = path.join(__dirname, "../../uploads");

// Ensure folder exists
if (!fs.existsSync(rootUploadDir)) {
  fs.mkdirSync(rootUploadDir, { recursive: true });
}

//  HELPER: Create folders safely
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

//  MULTER STORAGE ENGINE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
  const baseFolder = req.uploadFolder || "common";

  let typeFolder = "others";

  if (file.mimetype.startsWith("image/")) typeFolder = "images";
  if (file.mimetype.startsWith("video/")) typeFolder = "videos";
  if (file.mimetype === "application/pdf") typeFolder = "e-books";

  const finalPath = path.join(
    rootUploadDir,
    baseFolder,
    typeFolder
  );

  ensureFolderExists(finalPath);
  cb(null, finalPath);
},

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `file_${Date.now()}${ext}`;
    cb(null, safeName);
  },
});


//  FILE FILTER (Strict)
const fileFilter = (req, file, cb) => {
if (
  file.mimetype.startsWith("image/") ||
  file.mimetype.startsWith("video/") ||
  file.mimetype === "application/pdf"
) {
  cb(null, true);
} else {
  cb(new Error("Only image, video, or PDF files are allowed!"), false);
}
};


//  MULTER INSTANCE

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

//  EXPORT HELPERS (PRODUCTION APIs)

//  Upload a single image
const uploadSingleImage = (fieldName = "image") =>
  upload.single(fieldName);

// Upload multiple images
const uploadMultipleImages = (fieldName = "images", maxCount = 10) =>
  upload.array(fieldName, maxCount);

// Upload multiple videos
const uploadMultipleVideos = (fieldName = "videos", maxCount = 5) =>
  upload.array(fieldName, maxCount);

// Upload single video if needed
const uploadSingleVideo = (fieldName = "video") =>
  upload.single(fieldName);

const uploadSinglePDF = (fieldName = "file") =>
  upload.single(fieldName);

const uploadDayNightImages = upload.fields([
  { name: "bannerImg", maxCount: 1 },
  { name: "dayImg", maxCount: 1 },
  { name: "nightImg", maxCount: 1 },
]);

// Export everything
export {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  uploadMultipleVideos,
  uploadSingleVideo,
  uploadSinglePDF,
  uploadDayNightImages
};
