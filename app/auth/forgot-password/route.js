import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { User } from '../../backend/models/userModel.js'; // Adjust path
import { connectDB } from '../../backend/config/db.js';

const db = connectDB();
const resetTokens = new Map(); // Move resetTokens to the global scope

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ message: 'Email is required.' }),
        { status: 400 }
      );
    }

    // Find user by email
    const user = await new Promise((resolve, reject) => {
      User.findUserByEmail(db, email, (err, results) => {
        if (err) return reject(new Error('Database error.'));
        if (results.length === 0) return reject(new Error('User not found.'));
        resolve(results[0]);
      });
    });

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date(Date.now() + 3600000); // 1 hour
const insertTokenSQL = `
  INSERT INTO reset_tokens (token, email, expiration) 
  VALUES (?, ?, ?)
`;

db.query(insertTokenSQL, [token, email, tokenExpiration], (err) => {
  if (err) {
    console.error('Error saving reset token to database:', err);
    throw new Error('Failed to save reset token.');
  }
  console.log('Token stored in database:', { token, email, expiration: tokenExpiration });
});

    resetTokens.set(token, { email, expiration: tokenExpiration }); // Store token in the global map
    console.log('Token stored:', token, resetTokens.get(token)); // Debugging log

    // Send reset email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://waveriders.com.tr/auth/sign-in/ResetPassword?token=${token}`;
    await transporter.sendMail({
      from: `"WaveRiders" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click this link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    return new Response(
      JSON.stringify({ message: 'Password reset email sent.' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in forgot-password API:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Internal server error.' }),
      { status: 500 }
    );
  }
}
