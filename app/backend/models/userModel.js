export const User = {
  createUser: (db, userData, callback) => {
    const sql = 'INSERT INTO users (first_name, last_name, email, password, phone_number, date_of_birth, account_type) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [userData.first_name, userData.last_name, userData.email, userData.password, userData.phone_number, userData.date_of_birth, userData.account_type];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('SQL Error:', err);
        return callback(err);
      }
      callback(null, result);
    });
  },

  findUserByEmail: (db, email, callback) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const values = [email];
    db.query(sql, values, (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
        return callback(err);
      }
      callback(null, results);
    });
  }
};
