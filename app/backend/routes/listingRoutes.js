import express from 'express';
import { createListing, fetchListings, fetchListingById, deleteListing, uploadPhotos, getRandomListings, getPaginatedListings } from '../controllers/listingController.js';
import { getListingByBoatId, getListings } from '../controllers/listingController.js';
const router = express.Router();
router.get('/', getListings);

router.get('/random', getRandomListings);
router.get('/paginated', getPaginatedListings); // Yeni route
router.post('/create_listing', uploadPhotos, createListing); // Ensure Multer middleware is included
router.get('/:boat_id', (req, res, next) => {
    console.log('Route hit: /api/listings/:boat_id'); // Log the route is hit
    next();
  }, getListingByBoatId);
  
router.get('/listings', fetchListings);
router.get('/listing/:id', fetchListingById);
router.delete('/listing/:id', deleteListing);


export default router;
