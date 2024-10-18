export const Boat = {
    createBoat: (db, boatData, callback) => {
      const sql = 'INSERT INTO boats (boat_name, description, trip_types, price_per_hour, price_per_day, capacity, boat_type, location, business_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const values = [
        boatData.boat_name,
        boatData.description,
        boatData.trip_types,
        boatData.price_per_hour,
        boatData.price_per_day,
        boatData.capacity,
        boatData.boat_type,
        boatData.location,
        boatData.business_id
      ];
      db.query(sql, values, callback);
    }
  };
  
