export const Captain = {
    createCaptain: (db, captainData, callback) => {
      const sql = 'INSERT INTO captains (first_name, last_name, experience_years, phone_number, date_of_birth, business_id, registration_papers) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const values = [
        captainData.first_name,
        captainData.last_name,
        captainData.experience_years,
        captainData.phone_number,
        captainData.date_of_birth,
        captainData.business_id,
        captainData.registration_papers
      ];
      db.query(sql, values, callback);
    }
  };
  
