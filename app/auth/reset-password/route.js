import bcrypt from 'bcryptjs';
import { User } from '../../backend/models/userModel'; // Adjust the path to your User model
import { connectDB } from '../../backend/config/db'; // Adjust the path to your database connection utility

// Connect to the database
const db = connectDB();

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return new Response(
        JSON.stringify({ message: 'Token and new password are required.' }),
        { status: 400 }
      );
    }

    // Fetch token data from the database
    const tokenData = await new Promise((resolve, reject) => {
        const sql = `SELECT email, expiration FROM reset_tokens WHERE token = ?`;
        db.query(sql, [token], (err, results) => {
          if (err) {
            console.error('Database error fetching token:', err);
            return reject(new Error('Failed to fetch token.'));
          }
          if (results.length === 0) {
            return reject(new Error('Invalid or expired token.'));
          }
          resolve(results[0]);
        });
      });
      

    const { email, expiration } = tokenData;

    // Check token expiration
    if (new Date(expiration) < Date.now()) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired token.' }),
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await new Promise((resolve, reject) => {
      User.findUserByEmail(db, email, (err, results) => {
        if (err) return reject(new Error('Database error.'));
        if (results.length === 0) return reject(new Error('User not found.'));
        resolve(results[0]);
      });
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found.' }),
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password in the database
    await new Promise((resolve, reject) => {
      const sql = `UPDATE users SET password = ? WHERE email = ?`;
      db.query(sql, [hashedPassword, email], (err, result) => {
        if (err) {
          console.error('Error updating password:', err);
          return reject(new Error('Failed to update password.'));
        }
        resolve(result);
      });
    });

    // Delete the token from the database after successful reset
    await new Promise((resolve, reject) => {
      const sql = `DELETE FROM reset_tokens WHERE token = ?`;
      db.query(sql, [token], (err) => {
        if (err) {
          console.error('Error deleting token:', err);
          return reject(new Error('Failed to delete reset token.'));
        }
        resolve();
      });
    });

    return new Response(
      JSON.stringify({ message: 'Password reset successfully.' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reset-password route:', error.message);
    return new Response(
      JSON.stringify({ message: error.message || 'An error occurred.' }),
      { status: 500 }
    );
  }
}
