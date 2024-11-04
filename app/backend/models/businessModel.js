export const Business = {
  createBusiness: (db, businessData, callback) => {
    const { user_id, business_name } = businessData;
    
    const query = `INSERT INTO businesses (user_id, business_name) VALUES (?, ?)`;
    db.query(query, [user_id, business_name], callback);
  }
};
