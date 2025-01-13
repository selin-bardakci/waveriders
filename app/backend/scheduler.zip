import cron from 'node-cron';
import { connectDB } from './config/db.js';

const db = connectDB();

// Fonksiyon: Kiralamaları kontrol et ve güncelle
export const checkAndUpdateRentalStatus = () => {
  const sql = `
    UPDATE rentals
    SET status = 'completed'
    WHERE end_date < CURDATE() AND status = 'ongoing'
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error updating rentals:', err);
    } else {
      console.log('Rental statuses updated to completed:', results.affectedRows, 'rows affected.');
    }
  });
};

// Gece yarısı çalışan cron job
cron.schedule('0 0 * * *', () => {
  console.log('Running nightly rental status check...');
  checkAndUpdateRentalStatus();
});
