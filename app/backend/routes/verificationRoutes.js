import express from 'express';
import {
  getInReviewBoats,
  approveBoat,
  rejectBoat,
  getUserDetailsByBoat,
} from '../controllers/verificationController.js';

const router = express.Router();

// Route: Fetch all boats in 'inReview' status
router.get('/inReview', getInReviewBoats);

// Route: Approve a boat
router.post('/approve', approveBoat);

// Route: Reject a boat
router.post('/reject', rejectBoat);

// Route: Fetch user details via boat -> business -> user chain
router.get('/userDetails', getUserDetailsByBoat);


export default router;
