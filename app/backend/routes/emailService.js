// app/backend/services/emailService.js

import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { connectDB } from '../config/db.js';
const db = connectDB();
export const sendVerificationEmail = async (email) => {
    try {
      const user = await new Promise((resolve, reject) => {
        const sql = 'SELECT user_id FROM users WHERE email = ?';
        db.query(sql, [email], (err, results) => {
          if (err) return reject(new Error('Database error.'));
          if (results.length === 0) return reject(new Error('User not found.'));
          resolve(results[0]);
        });
      });
  
      const token = crypto.randomBytes(32).toString('hex');
      const expiration = new Date(Date.now() + 3600000); // 1 hour
  
      await new Promise((resolve, reject) => {
        const sql = `INSERT INTO email_verifications (user_id, token, expiration) VALUES (?, ?, ?)`;
        db.query(sql, [user.user_id, token, expiration], (err) => {
          if (err) return reject(new Error('Database error.'));
          resolve();
        });
      });
  
      const verificationLink = `https://waveriders.com.tr/auth/VerifyEmailPage?token=${token}`;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      await transporter.sendMail({
        from: '"WaveRiders" <no-reply@yourapp.com>',
        to: email,
        subject: 'Email Verification',
        html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
      });
  
      console.log('Verification email sent to:', email);
    } catch (error) {
      console.error('Error in sendVerificationEmail:', error.message);
      throw error;
    }
  };
  
