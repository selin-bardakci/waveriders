import mysql from 'mysql2';

// Create and return the database connection
export const connectDB = () => {
  const db = mysql.createConnection({
    host: 'waveriders-db.c7o8asca2sex.eu-north-1.rds.amazonaws.com',
    user: 'admin',
    password: 'root1234',
    database: 'waveriders'
  });

  // Connect to the database
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      throw err;
    }
    console.log('Connected to the database');
  });

  return db;
};
