import { getReviewsByBoatId } from '../models/reviewModel.js';

export const getBoatReviews = async (req, res) => {
  const { id } = req.params;

  try {
    const reviews = await getReviewsByBoatId(req.dbb, id);
    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
};
