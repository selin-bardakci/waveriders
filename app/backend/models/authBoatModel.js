import { connectDB } from '../config/db.js';  // Assuming db connection is in this file

const db = connectDB();

export const authBoat = {
  // Create a new boat entry
  createBoat: (db, boatData, callback) => {
    const sql = `
      INSERT INTO boats (
        boat_name, description, trip_types, price_per_hour, 
        price_per_day, capacity, boat_type, location, business_id, photos, boat_license_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
      sql, [
        boatData.boat_name,
        boatData.description,
        boatData.trip_types,
        boatData.price_per_hour,
        boatData.price_per_day,
        boatData.capacity,
        boatData.boat_type,
        boatData.location,
        boatData.business_id,
        boatData.photos,
        boatData.boat_license_path
      ], 
      callback
    );
  },

  // Get a boat by ID
  getBoatById: (db, boatId, callback) => {
    const sql = `SELECT * FROM boats WHERE boat_id = ?`;
    db.query(sql, [boatId], callback);
  },

  // Get all boats for a business by business ID
  getBoatsByBusinessId: (db, businessId, callback) => {
    const sql = `SELECT * FROM boats WHERE business_id = ?`;
    db.query(sql, [businessId], callback);
  },

  // Update boat details
  updateBoat: (db, boatId, boatData, callback) => {
    const sql = `UPDATE boats SET ? WHERE boat_id = ?`;
    db.query(sql, [boatData, boatId], callback);
  },

  // Update boat's photos or license path
  updateBoatFiles: (db, boatId, updates, callback) => {
    const sql = `UPDATE boats SET ? WHERE boat_id = ?`;
    db.query(sql, [updates, boatId], callback);
  },

  // Delete a boat by ID
  removeBoat: (db, boatId, callback) => {
    const sql = `DELETE FROM boats WHERE boat_id = ?`;
    db.query(sql, [boatId], callback);
  },
  
  // Helper function to fetch boats based on business id
  getBoat: (db, business_id, callback) => {
    const sql = 'SELECT * FROM boats WHERE business_id = ?';
    db.query(sql, [business_id], callback);
  }
};

export default authBoat;
