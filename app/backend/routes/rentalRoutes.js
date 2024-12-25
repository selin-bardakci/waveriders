import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js'; // Doğru isimle import edin
import { createRental, getUnavailableDates, submitReview, getRecentRentals, deleteReview ,getBookingDetails, cancelBooking} from '../controllers/rentalController.js';

const router = express.Router();

router.post('/create', authenticateToken, createRental); 
router.get('/unavailable-dates', getUnavailableDates);
router.post('/review', authenticateToken, submitReview); 
router.get('/recent', authenticateToken, getRecentRentals);
router.delete("/review/:rental_id", authenticateToken, deleteReview);
router.get('/:rental_id', authenticateToken, getBookingDetails);
router.delete('/:rental_id', authenticateToken, cancelBooking);

export default router;
