import express from 'express';
import { getBusinessListings } from '../controllers/businessController.js';
import { getBusinessOrUserName } from "../controllers/businessController.js";
import { getMonthlyRentals } from '../controllers/businessController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getBusinessDashboardListings } from '../controllers/businessController.js';
const router = express.Router();

// Business Listings Endpoint
router.get('/listings', authenticateToken, getBusinessListings);
router.get("/dashboard", authenticateToken, getBusinessOrUserName);
router.get('/dashboard/monthly-rentals', authenticateToken, getMonthlyRentals);
router.get('/dashboard/listings', authenticateToken, getBusinessDashboardListings);


export default router;
