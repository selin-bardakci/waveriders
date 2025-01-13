import multer from 'multer';

export const configureMulter = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dest = file.fieldname === 'license' ? 'uploads/boatlicenses' : 'uploads/photos';
      cb(null, dest);
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });

  return multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
      if (file.fieldname === 'license') {
        if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/)) {
          return cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed for license!'), false);
        }
      } else if (file.fieldname === 'photos') {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Only JPG, JPEG, and PNG files are allowed for photos!'), false);
        }
      }
      cb(null, true);
    }
  }).fields([
    { name: 'photos', maxCount: 10 },
    { name: 'license', maxCount: 1 }
  ]);
};
