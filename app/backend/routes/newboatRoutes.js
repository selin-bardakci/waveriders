import express from 'express';
import multer from 'multer';
import { 
  registerBoat,
  getBoat,
  getCaptain,
  getBusiness,
  getUser,
  getBusinessID
} from '../controllers/newBoatController.js';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on fieldname
    const dest = file.fieldname === 'license' ? 'uploads/boatlicenses' : 'uploads/photos';
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Configure multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Validate file types
    if (file.fieldname === 'license') {
      // Allow only specific file types for license
      if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/)) {
        return cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed for license!'), false);
      }
    } else if (file.fieldname === 'photos') {
      // Allow only image files for photos
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

// Register boat route with proper error handling
router.post('/registerBoat', (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        status: 'error',
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({
        status: 'error',
        message: `Server error: ${err.message}`
      });
    }
    // If everything went fine, pass control to the controller
    next();
  });
}, registerBoat);

// Other routes
router.get('/getBoat', getBoat);
router.get('/getCaptain', getCaptain);
router.get('/getBusiness', getBusiness);
router.get('/getUser', getUser);
router.get('/:userId', getBusinessID);


// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

export default router;
