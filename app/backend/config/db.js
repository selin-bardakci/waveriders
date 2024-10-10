import mysql from 'mysql2';

export const connectDB = () => {
  const db = mysql.createConnection({
    host: 'waveriders-db.c7o8asca2sex.eu-north-1.rds.amazonaws.com',
    user: 'admin', // Your MySQL username
    password: 'root1234', // Your MySQL password
    database: 'waveriders',
  });

  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the database');
  });
  
  db.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection lost. Reconnecting...');
      connectDB(); // Reconnect to the database
    } else {
      throw err;
    }
  });
  // Export the db instance for use in other modules
  return db;
};
