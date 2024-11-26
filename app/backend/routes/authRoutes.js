import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  handleUploadBoatLicense,
  handleUploadCaptainLicense,
  accountSetup,
  registerBusiness,
  registerUser,
  loginUser,
  handleRegisterCaptain,
  registerBoat,
  getBoat,
  getCaptain,
  getBusiness,
  getUser,
  getBusinessID
} from '../controllers/authController.js';
import { connectDB } from '../config/db.js'; // Import database connection
const upload = multer({ dest: 'uploads/' });

const router = express.Router();
const db = connectDB(); 

// Route for registering captain
router.post('/registerCaptain', upload.none(), handleRegisterCaptain);

// Configure multer storage for boat licenses
const boatLicenseStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/boatlicenses'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const boatLicense = multer({ storage: boatLicenseStorage }); // Configure multer instance
const captainLicenseStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/captainlicenses'); // Path for captain licenses
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploadCaptainLicense = multer({ storage: captainLicenseStorage }).single('registration_papers');

// Route for registering captain
router.post('/registerCaptain', handleRegisterCaptain);

// Route for uploading captain license
router.post('/captainLicense', uploadCaptainLicense, handleUploadCaptainLicense);

router.post('/account-setup', accountSetup);

router.get('/boat', getBoat);

router.get('/business', getBusiness);

router.get('/captain', getCaptain);

router.get('/user', getUser);

router.get('/businessID', getBusinessID);

console.log("Initializing authentication routes");
// Account type selection route
router.post('/account-setup', (req, res, next) => {
  console.log("POST /account-setup hit");
  next();
}, accountSetup);

// Check if route is reached
router.post('/registerBusiness', (req, res, next) => {
  console.log("POST /registerBusiness hit");
  next();
}, registerBusiness);

router.post('/registerBoat', upload.array('photos', 10), registerBoat);

// Registration routes
router.post('/signup', (req, res, next) => {
  console.log("POST /signup hit");
  next();
}, registerUser); 

router.post('/register-business', (req, res, next) => {
  console.log("POST /register-business hit");
  next();
});

router.post('/boatLicense', boatLicense.single('license'), handleUploadBoatLicense);



// Register a boat (no file upload)
router.post('/registerBoat', (req, res, next) => {
  console.log("POST /registerBoat hit");
  next();
}, registerBoat);

// Login route
router.post('/login', (req, res, next) => {
  console.log("POST /login hit");
  next();
}, loginUser);

console.log("Authentication routes initialized");

export default router;
