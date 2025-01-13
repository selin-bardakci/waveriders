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


// Get Favorite Boats for Dashboard
export const getFavoriteBoats = async (req, res) => {
  const db = connectDB(); // db bağlantısını başlat
  const userId = req.user.id; // Kullanıcı ID (authMiddleware'den geliyor)

  try {
    console.log("User ID:", userId); // Kullanıcı ID'sini kontrol et

    // Favorilerden en fazla 4 bot ID'sini al
    const favoritesSql = `
      SELECT boat_id
      FROM favorites
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 4
    `;

    db.query(favoritesSql, [userId], (err, favoriteResults) => {
      if (err) {
        console.error("Error fetching favorites:", err); // SQL hatasını kontrol et
        return res.status(500).json({ message: "Error fetching favorite boats" });
      }

      console.log("Favorite Results:", favoriteResults); // Favori botları kontrol et

      if (favoriteResults.length === 0) {
        console.warn("No favorite boats found for user:", userId); // Favori bulunamazsa
        return res.status(200).json({ boats: [] });
      }

      const boatIds = favoriteResults.map((fav) => fav.boat_id);
      console.log("Boat IDs:", boatIds); // Bot ID'lerini kontrol et

      // Bu botların detaylarını al
      const boatsSql = `
        SELECT boat_id, boat_name, location, photos
        FROM boats
        WHERE boat_id IN (?)
      `;
      db.query(boatsSql, [boatIds], (err, boatResults) => {
        if (err) {
          console.error("Error fetching boats:", err); // SQL hatasını kontrol et
          return res.status(500).json({ message: "Error fetching boat details" });
        }

        console.log("Boat Results:", boatResults); // Bot detaylarını kontrol et
        res.status(200).json({ boats: boatResults });
      });
    });
  } catch (error) {
    console.error("Error:", error); // Genel hata kontrolü
    res.status(500).json({ message: "Server error" });
  }
};

