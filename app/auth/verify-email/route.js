import { connectDB } from '../../backend/config/db'; // Adjust to your database connection path
const db = connectDB();

export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return new Response(JSON.stringify({ message: 'Token is required.' }), { status: 400 });
    }

    const tokenData = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM email_verifications WHERE token = ? AND expiration > NOW()`;
      db.query(sql, [token], (err, results) => {
        if (err) return reject(new Error('Database error.'));
        if (results.length === 0) return reject(new Error('Invalid or expired token.'));
        resolve(results[0]);
      });
    });

    const userId = tokenData.user_id;

    // Delete the token after use
    await new Promise((resolve, reject) => {
      const sql = `DELETE FROM email_verifications WHERE token = ?`;
      db.query(sql, [token], (err) => {
        if (err) return reject(new Error('Failed to delete token.'));
        resolve();
      });
    });

    return new Response(JSON.stringify({ message: 'Email verified successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Error in verify-email route:', error.message);
    return new Response(JSON.stringify({ message: error.message || 'An error occurred.' }), { status: 500 });
  }
}
