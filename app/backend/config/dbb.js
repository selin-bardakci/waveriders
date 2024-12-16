import mysql from 'mysql2/promise';

let dbb; // Global variable for the database pool

export const connectDBB = () => {
  if (!dbb) {
    console.log('Initializing database connection pool...');
    dbb = mysql.createPool({
      host: 'waveriders-db.c7o8asca2sex.eu-north-1.rds.amazonaws.com',
      user: 'admin',
      password: 'root1234',
      database: 'waveriders',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('Database connection pool created');
  } else {
    console.log('Reusing existing database connection pool');
  }

  return dbb; // Return the pool
};
