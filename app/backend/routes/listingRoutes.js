import express from 'express';
import { upload } from '../config/uploadConfig.js'; // Ensure upload is correctly exported
import { createListing, fetchListing } from '../controllers/listingController.js';
import { connectDB } from '../config/db.js'; // Import database connection

const router = express.Router();
const db = connectDB(); // Initialize database connection



router.post('/create_listing', upload.array('images', 5), async (req, res) => {
  try {
    await createListing(req, res, db); // Pass the database connection as needed
  } catch (error) {
    console.error('Error handling /create_auction route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/auction-listings', fetchAuctions);


export default router;
