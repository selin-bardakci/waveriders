import express from 'express';
import multer from 'multer';
import { removeBoatListing, updateBoat, getBoatDetails } from '../controllers/boatController.js';
import { getBoatReviews } from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { configureMulter } from '../config/multerConfig.js';

const router = express.Router();
const upload = configureMulter();

router.get('/:id', authenticateToken, (req, res, next) => {
  console.log('GET /api/boats/:id route hit');
  next();
}, getBoatDetails);

router.get('/:id', authenticateToken, getBoatDetails);
router.put('/:id', authenticateToken, upload, updateBoat);
router.delete('/:boat_id', authenticateToken, removeBoatListing);

router.get('/:id/reviews', async (req, res) => {
  const { id } = req.params;

  if (!req.dbb) {
      return res.status(500).json({ message: 'Database connection not available.' });
  }

  console.log(`Fetching reviews for boat_id: ${id}`);

  try {
      const [rows] = await req.dbb.query(
          `
SELECT 
    r.review_text, 
    r.cleanliness_rating, 
    r.overall_rating, 
    r.driver_rating, 
    r.created_at, 
    CASE
        WHEN u.first_name IS NULL AND u.last_name IS NULL THEN b.business_name
        ELSE CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))
    END AS author
FROM 
    boat_reviews r
LEFT JOIN 
    users u ON r.user_id = u.user_id
LEFT JOIN 
    businesses b ON r.user_id = b.user_id
WHERE 
    r.boat_id = ?
ORDER BY 
    r.created_at DESC;



          `,
          [id]
      );

      res.status(200).json({ reviews: rows });
  } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
});

export default router;
