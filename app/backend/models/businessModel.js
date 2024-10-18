export const Business = {
    createBusiness: (db, businessData, callback) => {
      const sql = 'INSERT INTO businesses (user_id, business_name, business_registration) VALUES (?, ?, ?)';
      const values = [businessData.user_id, businessData.business_name, businessData.business_registration];
      db.query(sql, values, callback);
    }
  };
  
