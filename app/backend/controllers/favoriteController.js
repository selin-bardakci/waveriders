import { Favorite } from '../models/favoriteModel.js';
import { connectDB } from '../config/db.js';


export const addFavorite = (req, res) => {
  const db = connectDB();
  const { boat_id } = req.body;
  const user_id = req.user.id;

  Favorite.addFavorite(db, user_id, boat_id, (err, result) => {
    if (err) {
      console.error('Error adding favorite:', err);
      return res.status(500).json({ message: 'Error adding favorite.' });
    }
    res.status(201).json({ message: 'Boat added to favorites successfully.' });
  });
};

export const removeFavorite = (req, res) => {
  const db = connectDB();
  const { boat_id } = req.body;
  const user_id = req.user.id;

  Favorite.deleteFavorite(db, user_id, boat_id, (err, result) => {
    if (err) {
      console.error('Error removing favorite:', err);
      return res.status(500).json({ message: 'Error removing favorite.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Boat not found in favorites.' });
    }

    res.status(200).json({ message: 'Boat removed from favorites successfully.' });
  });
};

export const getUserFavorites = (req, res) => {
    const db = connectDB();
    const user_id = req.user.id; 
  
    const sql = `
      SELECT boats.* 
      FROM favorites 
      JOIN boats ON favorites.boat_id = boats.boat_id 
      WHERE favorites.user_id = ?
    `;
  
    db.query(sql, [user_id], (err, results) => {
      if (err) {
        console.error('Error fetching favorites:', err);
        return res.status(500).json({ message: 'Failed to fetch favorite boats.' });
      }
  
      res.status(200).json({ favorites: results });
    });
  };
