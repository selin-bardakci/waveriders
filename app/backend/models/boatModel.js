export const Boat = {
  createBoat: (db, boatData, callback) => {
    const sql = `
      INSERT INTO boats (
        boat_name,
        description,
        trip_types,
        price_per_hour,
        price_per_day,
        capacity,
        boat_type,
        location,
        business_id,
        photos,
        boat_license_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      boatData.boat_name,
      boatData.description,
      boatData.trip_types,
      boatData.price_per_hour,
      boatData.price_per_day,
      boatData.capacity,
      boatData.boat_type,
      boatData.location,
      boatData.business_id,
      boatData.photos, // Already stringified JSON
      boatData.boat_license_path || null // Optional field for license path
    ];

    console.log('Inserting data:', {
      boat_name: boatData.boat_name,
      description: boatData.description,
      trip_types: boatData.trip_types,
      price_per_hour: boatData.price_per_hour,
      price_per_day: boatData.price_per_day,
      capacity: boatData.capacity,
      boat_type: boatData.boat_type,
      location: boatData.location,
      business_id: boatData.business_id,
      photos: boatData.photos,
      boat_license_path: boatData.boat_license_path
    });

    // Execute the SQL query
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting boat data:", err);
        return callback(err, null);
      }
      callback(null, result);
    });
  },
  
  updateBoat: (db, boatId, boatLicensePath, callback) => {
    const sql = `
      UPDATE boats
      SET boat_license_path = ?
      WHERE boat_id = ?
    `;
  
    const values = [boatLicensePath, boatId];
  
    console.log('Updating boat license path:', {
      boat_id: boatId,
      boat_license_path: boatLicensePath
    });
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Database error during license update:", err); // Log the SQL error
        return callback(err, null);
      }
      callback(null, result);
    });
  },
  
  getBoat: (db, business_id, callback) => {
    const sql = 'SELECT * FROM boats WHERE business_id = ?';
    db.query(sql, [business_id], callback); // Wrap business_id in an array
  },
    getBoatById: (db, boat_id, callback) => {
    const sql = 'SELECT * FROM boats WHERE boat_id = ?';
    db.query(sql, [boat_id], (err, results) => {
      if (err) {
        console.error("Error fetching boat by ID:", err);
        return callback(err, null);
      }
      callback(null, results);
    });
  }
  
};


export class Boat2 {
  static createBoat(db, boatData, callback) {
    const query = 'INSERT INTO boats SET ?';
    db.query(query, boatData, callback);
  }

  static async getLastInsertedBoat(db) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM boats WHERE boat_id = LAST_INSERT_ID()',
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });
  }
}
