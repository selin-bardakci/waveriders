import express from 'express';
const router = express.Router();

// Route to fetch reviews for a specific boat
router.get('/:id/reviews', async (req, res) => {
    console.log(`Fetching reviews for boat_id: ${req.params.id}`);
    const { id } = req.params;
  
    try {
      const [rows] = await req.dbb.query(
        `
        SELECT review_text, cleanliness_rating, overall_rating, driver_rating, created_at
        FROM boat_reviews
        WHERE boat_id = ?
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
