import { connectDB } from '../config/db.js';

const db = connectDB();

// Remove a Boat Listing
export const removeBoatListing = async (req, res) => {
  const { boat_id } = req.params;

  if (!boat_id) {
    return res.status(400).json({ message: 'Boat ID is required' });
  }

  try {
    const sql = `DELETE FROM boats WHERE boat_id = ?`;

    db.query(sql, [boat_id], (err, result) => {
      if (err) {
        console.error('Error removing boat listing:', err);
        return res.status(500).json({ message: 'Error removing boat listing' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Boat listing not found' });
      }

      res.status(200).json({ message: 'Boat listing removed successfully' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
