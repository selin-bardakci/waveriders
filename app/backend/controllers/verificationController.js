import { connectDB } from '../config/db.js';
import nodemailer from 'nodemailer';
const db = connectDB();


import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // E-posta adresi
    pass: process.env.EMAIL_PASS, // Uygulama şifresi
  },
});

// Boats in 'inReview' status
export const getInReviewBoats = async (req, res) => {
  try {
    const sql = `
      SELECT v.verification_id, v.boat_id, b.boat_name, b.business_id 
      FROM verification v
      JOIN boats b ON v.boat_id = b.boat_id
      WHERE v.verification_status = 'inReview';
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching boats under review:', err);
        return res.status(500).json({ message: 'Error fetching boats under review' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveBoat = async (req, res) => {
  const { boat_id } = req.body; // `boat_id` request body'den alınıyor

  if (!boat_id) {
    console.error('approveBoat - Boat ID is missing in request body');
    return res.status(400).json({ message: 'Boat ID is required.' });
  }

  try {
    // Önce verification tablosunu güncelle
    const updateSql = `
      UPDATE verification 
      SET verification_status = 'approved' 
      WHERE boat_id = ?;
    `;

    db.query(updateSql, [boat_id], (err, result) => {
      if (err) {
        console.error('approveBoat - Error updating verification status:', err);
        return res.status(500).json({ message: 'Error approving boat.' });
      }

      if (result.affectedRows === 0) {
        console.warn(`approveBoat - No verification entry found for boat_id: ${boat_id}`);
        return res.status(404).json({ message: 'No verification entry found for this boat ID.' });
      }

      console.log(`approveBoat - Verification status updated for boat_id: ${boat_id}`);

      // Boats tablosundan boat_name ve business_id çek
      const boatQuery = `
        SELECT boat_name, business_id 
        FROM boats 
        WHERE boat_id = ?;
      `;

      db.query(boatQuery, [boat_id], (err, boatResults) => {
        if (err) {
          console.error('approveBoat - Error fetching boat details:', err);
          return res.status(500).json({ message: 'Error fetching boat details.' });
        }

        if (boatResults.length === 0) {
          return res.status(404).json({ message: 'No boat found with this ID.' });
        }

        const { boat_name, business_id } = boatResults[0];

        // Businesses tablosundan user_id çek
        const businessQuery = `
          SELECT user_id 
          FROM businesses 
          WHERE business_id = ?;
        `;

        db.query(businessQuery, [business_id], (err, businessResults) => {
          if (err) {
            console.error('approveBoat - Error fetching business details:', err);
            return res.status(500).json({ message: 'Error fetching business details.' });
          }

          if (businessResults.length === 0) {
            return res.status(404).json({ message: 'No business found with this ID.' });
          }

          const { user_id } = businessResults[0];

          // Users tablosundan email çek
          const userQuery = `
            SELECT email 
            FROM users 
            WHERE user_id = ?;
          `;

          db.query(userQuery, [user_id], (err, userResults) => {
            if (err) {
              console.error('approveBoat - Error fetching user email:', err);
              return res.status(500).json({ message: 'Error fetching user email.' });
            }

            if (userResults.length === 0) {
              return res.status(404).json({ message: 'No user found with this ID.' });
            }

            const { email } = userResults[0];

            // Email gönder
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER, // Gmail kullanıcı adı
                pass: process.env.EMAIL_PASS, // Gmail şifresi (veya uygulama şifresi)
              },
            });

            const mailOptions = {
              from: 'no-reply@waveriders.com',
              to: email,
              subject: 'Waveriders Boat Approval',
              text: `We have good news! Your boat license and captain license have been approved. Your boat "${boat_name}" is now listed.`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.error('approveBoat - Error sending email:', err);
                return res.status(500).json({ message: 'Boat approved, but email could not be sent.' });
              }

              console.log('approveBoat - Email sent:', info.response);
              res.status(200).json({ message: 'Boat approved and email sent successfully.' });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('approveBoat - Server error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


// Reject a boat
export const rejectBoat = async (req, res) => {
  const { boat_id, reason } = req.body;

  if (!boat_id || !reason) {
    return res.status(400).json({ message: 'Boat ID and rejection reason are required.' });
  }

  try {
    // Boat name ve business_id'yi al
    const boatQuery = `
      SELECT boat_name, business_id 
      FROM boats 
      WHERE boat_id = ?;
    `;

    db.query(boatQuery, [boat_id], (err, boatResults) => {
      if (err) {
        console.error('rejectBoat - Error fetching boat details:', err);
        return res.status(500).json({ message: 'Error fetching boat details.' });
      }

      if (boatResults.length === 0) {
        return res.status(404).json({ message: 'No boat found with this ID.' });
      }

      const { boat_name, business_id } = boatResults[0];

      // Businesses tablosundan user_id al
      const businessQuery = `
        SELECT user_id 
        FROM businesses 
        WHERE business_id = ?;
      `;

      db.query(businessQuery, [business_id], (err, businessResults) => {
        if (err) {
          console.error('rejectBoat - Error fetching business details:', err);
          return res.status(500).json({ message: 'Error fetching business details.' });
        }

        if (businessResults.length === 0) {
          return res.status(404).json({ message: 'No business found with this ID.' });
        }

        const { user_id } = businessResults[0];

        // Users tablosundan email al
        const userQuery = `
          SELECT email 
          FROM users 
          WHERE user_id = ?;
        `;

        db.query(userQuery, [user_id], (err, userResults) => {
          if (err) {
            console.error('rejectBoat - Error fetching user email:', err);
            return res.status(500).json({ message: 'Error fetching user email.' });
          }

          if (userResults.length === 0) {
            return res.status(404).json({ message: 'No user found with this ID.' });
          }

          const { email } = userResults[0];

          // Boats ve Verification tablosundan veriyi sil
          const deleteVerificationQuery = `
            DELETE FROM verification 
            WHERE boat_id = ?;
          `;
          db.query(deleteVerificationQuery, [boat_id], (err) => {
            if (err) {
              console.error('rejectBoat - Error deleting verification:', err);
              return res.status(500).json({ message: 'Error deleting verification.' });
            }

            const deleteBoatQuery = `
              DELETE FROM boats 
              WHERE boat_id = ?;
            `;
            db.query(deleteBoatQuery, [boat_id], (err) => {
              if (err) {
                console.error('rejectBoat - Error deleting boat:', err);
                return res.status(500).json({ message: 'Error deleting boat.' });
              }

              console.log(`rejectBoat - Boat and verification deleted for boat_id: ${boat_id}`);

              // E-posta gönder
              const mailOptions = {
                from: 'no-reply@waveriders.com',
                to: email,
                subject: 'Waveriders Boat Rejection',
                text: `We are sorry to inform you that your boat license and captain license have been rejected. Your boat "${boat_name}" is not listed because of "${reason}".\nYou could try to add a new boat.\n\nWaveRiders Support Team`,
              };

              transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                  console.error('rejectBoat - Error sending email:', err);
                  return res.status(500).json({ message: 'Boat rejected, but email could not be sent.' });
                }

                console.log('rejectBoat - Email sent:', info.response);
                res.status(200).json({ message: 'Boat rejected and email sent successfully.' });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('rejectBoat - Server error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


// Fetch user details via boat -> business -> user chain
export const getUserDetailsByBoat = async (req, res) => {
    const { boat_id } = req.query;
  
    if (!boat_id) {
      return res.status(400).json({ message: 'Boat ID is required.' });
    }
  
    try {
      const sql = `
        SELECT 
          u.user_id, 
          u.first_name, 
          u.last_name, 
          u.email, 
          u.phone_number, 
          u.account_type, 
          u.created_at, 
          u.date_of_birth
        FROM users u
        JOIN businesses b ON u.user_id = b.user_id
        JOIN boats bt ON b.business_id = bt.business_id
        WHERE bt.boat_id = ?;
      `;
  
      db.query(sql, [boat_id], (err, results) => {
        if (err) {
          console.error('Error fetching user details:', err);
          return res.status(500).json({ message: 'Error fetching user details.' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ message: 'No user found for this boat.' });
        }
  
        res.status(200).json(results[0]);
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  };

  export const getCaptainDetails = async (req, res) => {
    const { business_id } = req.query;
  
    if (!business_id) {
      return res.status(400).json({ message: 'Business ID is required.' });
    }
  
    try {
      const sql = `
        SELECT 
          captain_id, 
          first_name, 
          last_name, 
          phone_number, 
          date_of_birth, 
          experience_years, 
          registration_papers
        FROM captains
        WHERE business_id = ?;
      `;
  
      db.query(sql, [business_id], (err, results) => {
        if (err) {
          console.error('Error fetching captain details:', err);
          return res.status(500).json({ message: 'Error fetching captain details.' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ message: 'No captain found for this business.' });
        }
  
        res.status(200).json({ captains: results });
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  };
  
