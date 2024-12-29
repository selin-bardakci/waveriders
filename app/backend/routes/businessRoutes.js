import express from 'express';
import { getBusinessListings } from '../controllers/businessController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Business Listings Endpoint
router.get('/listings',authenticateToken, getBusinessListings);

export default router;
