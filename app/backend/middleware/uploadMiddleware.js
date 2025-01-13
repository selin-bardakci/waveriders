import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = file.fieldname === 'license' ? 'uploads/boatlicenses' : 'uploads/photos';
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'license') {
    // Allow PDF and images for license
    if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/)) {
      return cb(new Error('Only PDF and image files are allowed for license!'), false);
    }
  } else if (file.fieldname === 'photos') {
    // Allow only images for photos
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only JPG, JPEG, and PNG files are allowed for photos!'), false);
    }
  }
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 11 // 10 photos + 1 license
  }
}).fields([
  { name: 'photos', maxCount: 10 },
  { name: 'license', maxCount: 1 }
]);
