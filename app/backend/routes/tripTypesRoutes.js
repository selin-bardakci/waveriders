import express from 'express';
const router = express.Router();

// Define the route for getting trip types
router.get('/', async (req, res) => {
  // Sample trip types, or fetch from the database
  const tripTypes = [
    { id: 1, name: 'Short Trips', type: 'short' },
    { id: 2, name: 'Day Trips', type: 'day' },
    { id: 3, name: 'Sunrise & Sunset Trips', type: 'sunrise' },
    { id: 4, name: 'Overnight Adventures', type: 'overnight' }
  ];
  
  res.json(tripTypes);
});

export default router;
