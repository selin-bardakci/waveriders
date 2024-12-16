export const Favorite = {
  addFavorite: (db, user_id, boat_id, callback) => {
    const sql = 'INSERT INTO favorites (user_id, boat_id) VALUES (?, ?)';
    const values = [user_id, boat_id];

    console.log('Adding favorite:', { user_id, boat_id });

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error inserting favorite:', err);
        return callback(err, null);
      }
      callback(null, result);
    });
  },

  deleteFavorite: (db, user_id, boat_id, callback) => {
    const sql = 'DELETE FROM favorites WHERE user_id = ? AND boat_id = ?';
    db.query(sql, [user_id, boat_id], (err, result) => {
      if (err) {
        console.error('Error deleting favorite:', err);
        return callback(err, null);
      }
      callback(null, result);
    });
  },
};

