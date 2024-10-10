export const User = {
    createUser: (db, userData, callback) => {
      const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      const values = [userData.username, userData.email, userData.password];
      db.query(sql, values, callback);
    },
    
    findUserByEmail: (db, email, callback) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      const values = [email];
      db.query(sql, values, callback);
    }
  };
  