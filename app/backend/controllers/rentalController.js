import { connectDB } from '../config/db.js';
import nodemailer from "nodemailer";
const db = connectDB();

export const getUnavailableDates = async (req, res) => {
  const { boat_id } = req.query; 

  if (!boat_id) {
    return res.status(400).json({ message: 'Boat ID is required' });
  }

  try {
    const sql = `
      SELECT start_date, end_date
      FROM rentals
      WHERE boat_id = ? AND (
        status = 'completed' OR status = 'ongoing'
      )
    `;

    db.query(sql, [boat_id], (err, results) => {
      if (err) {
        console.error('Error fetching unavailable dates:', err);
        return res.status(500).json({ message: 'Error fetching unavailable dates' });
      }

      const unavailableDates = results.map((rental) => ({
        start_date: rental.start_date,
        end_date: rental.end_date,
      }));

      res.status(200).json({ unavailableDates });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const createRental = async (req, res) => {
  const { boat_id, start_date, end_date, rental_price, start_time, end_time } = req.body;
  const customer_id = req.user.id;

  if (!boat_id || !start_date || !rental_price) {
    return res.status(400).json({ message: 'Boat ID, start date, and rental price are required.' });
  }

  try {
    const status = 'ongoing';
    const calculated_end_date = end_date || start_date;

    const rentalSql = `
      INSERT INTO rentals (customer_id, boat_id, start_date, end_date, rental_price, status, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      rentalSql,
      [customer_id, boat_id, start_date, calculated_end_date, rental_price, status, start_time, end_time],
      async (err, result) => {
        if (err) {
          console.error('Error inserting rental:', err);
          return res.status(500).json({ message: 'Error creating rental.' });
        }

        const rental_id = result.insertId;

        // Fetch boat, business, and captain details
        const boatQuery = `
          SELECT b.boat_name, b.location, b.business_id, bus.business_name, u.first_name AS business_first_name,
                 u.last_name AS business_last_name, u.phone_number AS business_phone, c.first_name AS captain_first_name,
                 c.last_name AS captain_last_name, c.phone_number AS captain_phone
          FROM boats b
          LEFT JOIN businesses bus ON b.business_id = bus.business_id
          LEFT JOIN users u ON bus.user_id = u.user_id
          LEFT JOIN captains c ON b.business_id = c.business_id
          WHERE b.boat_id = ?
        `;

        db.query(boatQuery, [boat_id], async (err, boatResults) => {
          if (err || boatResults.length === 0) {
            console.error("Error fetching boat details:", err);
            return res.status(500).json({ message: "Error fetching boat details for email." });
          }

          const boatDetails = boatResults[0];
          const { boat_name, location, business_name, business_first_name, business_last_name, business_phone, captain_first_name, captain_last_name, captain_phone } = boatDetails;

          // Compose email content
          const emailSubject = "Booking Details";
          const emailBody = `
            <p>We are happy to have you here! Here are your booking details:</p>
            <ul>
              <li><strong>Boat name:</strong> ${boat_name}</li>
              <li><strong>Date:</strong> ${start_date}</li>
              <li><strong>Time:</strong> ${start_time} - ${end_time}</li>
              <li><strong>Port:</strong> ${location}</li>
            </ul>
            <h3>Business Contact Information</h3>
            <p>${business_name || `${business_first_name} ${business_last_name}`} - ${business_phone}</p>
            <h3>Captain Contact Information</h3>
            <p>${captain_first_name} ${captain_last_name} - ${captain_phone}</p>
            <p>Thank you for choosing Waveriders!</p>
            <p><strong>Waveriders Team</strong></p>
          `;

          // Send the email
          const transporter = nodemailer.createTransport({
            service: 'gmail', // or your preferred email service
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.user.email, // Ensure user's email is available in `req.user`
            subject: emailSubject,
            html: emailBody,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully.");
          } catch (emailError) {
            console.error("Error sending email:", emailError);
          }

          res.status(201).json({ message: 'Rental created successfully!', rental_id });
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

export const getRecentRentals = async (req, res) => {
  const customer_id = req.user.id;

  try {
    const sql = `
      SELECT 
        r.rental_id, 
        r.boat_id, 
        r.start_date, 
        r.end_date, 
        r.status, 
        r.rental_price,
        br.overall_rating AS rating,
        br.driver_rating AS driver,
        br.cleanliness_rating AS cleanliness,
        br.review_text AS comment
      FROM rentals r
      LEFT JOIN boat_reviews br ON r.rental_id = br.rental_id
      WHERE r.customer_id = ?
      ORDER BY r.start_date DESC
    `;

    db.query(sql, [customer_id], (err, results) => {
      if (err) {
        console.error("Error fetching recent rentals:", err);
        return res.status(500).json({ message: "Error fetching recent rentals" });
      }

      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




export const submitReview = async (req, res) => {
  const { rental_id, general_rating, driver_rating, cleanliness_rating, review_text } = req.body;
  const user_id = req.user.id;

  try {
    const sql = `
      INSERT INTO boat_reviews (rental_id, boat_id, user_id, cleanliness_rating, driver_rating, overall_rating, review_text)
      VALUES (
        ?, 
        (SELECT boat_id FROM rentals WHERE rental_id = ?), 
        ?, ?, ?, ?, ?
      )
    `;

    db.query(
      sql,
      [rental_id, rental_id, user_id, cleanliness_rating, driver_rating, general_rating, review_text],
      (err, result) => {
        if (err) {
          console.error('Error submitting review:', err);
          return res.status(500).json({ message: 'Error submitting review' });
        }
        res.status(201).json({ message: 'Review submitted successfully!' });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteReview = async (req, res) => {
  const { rental_id } = req.params;

  try {
    const sql = `DELETE FROM boat_reviews WHERE rental_id = ?`;
    db.query(sql, [rental_id], (err, result) => {
      if (err) {
        console.error("Error deleting review:", err);
        return res.status(500).json({ message: "Error deleting review." });
      }

      res.status(200).json({ message: "Review deleted successfully!" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getBookingDetails = async (req, res) => {
  const { rental_id } = req.params;

  if (!rental_id) {
    return res.status(400).json({ message: 'Rental ID is required' });
  }

  try {
    const sql = `
      SELECT 
        rental_id, 
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,         -- end_date ekleniyor
        TIME_FORMAT(start_time, '%H:%i') AS start_time,       -- start_time formatlanıyor
        TIME_FORMAT(end_time, '%H:%i') AS end_time,           -- end_time formatlanıyor
        rental_price AS total_price
      FROM rentals
      WHERE rental_id = ?
    `;

    db.query(sql, [rental_id], (err, results) => {
      if (err) {
        console.error('Error fetching booking details:', err);
        return res.status(500).json({ message: 'Error fetching booking details' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      res.status(200).json(results[0]);  // end_date dahil edildi
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const cancelBooking = async (req, res) => {
  const { rental_id } = req.params;

  console.log('Rental ID received for cancellation:', rental_id);

  if (!rental_id) {
    console.log('Rental ID is missing');
    return res.status(400).json({ message: 'Rental ID is required' });
  }

  try {
    const sql = 'DELETE FROM rentals WHERE rental_id = ?';

    db.query(sql, [rental_id], (err, result) => {
      if (err) {
        console.error('Error deleting booking:', err);
        return res.status(500).json({ message: 'Error deleting booking' });
      }

      if (result.affectedRows === 0) {
        console.log('No booking found for rental_id:', rental_id);
        return res.status(404).json({ message: 'Booking not found or already deleted' });
      }

      console.log('Booking deleted successfully:', rental_id);
      res.status(200).json({ message: 'Booking deleted successfully' });
    });
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const getDashboardRecentRentals = async (req, res) => {
  const customer_id = req.user.id;

  console.log("Customer ID:", customer_id); // Kullanıcı ID kontrolü

  try {
    const sql = `
      SELECT 
        r.rental_id, 
        r.boat_id, 
        r.start_date, 
        r.end_date, 
        r.status, 
        r.rental_price,
        br.overall_rating AS rating,
        br.driver_rating AS driver,
        br.cleanliness_rating AS cleanliness,
        br.review_text AS comment,
        b.photos AS photos,
        b.boat_name AS boat_name,
        b.location AS location
      FROM rentals r
      LEFT JOIN boat_reviews br ON r.rental_id = br.rental_id
      LEFT JOIN boats b ON r.boat_id = b.boat_id
      WHERE r.customer_id = ?
      ORDER BY 
        CASE 
          WHEN r.status = 'completed' AND br.review_text IS NOT NULL THEN 1
          WHEN r.status = 'completed' THEN 2
          ELSE 3
        END, 
        r.start_date DESC
      LIMIT 4
    `;

    console.log("SQL Query:", sql); // SQL sorgusunu loglayın

    db.query(sql, [customer_id], (err, results) => {
      if (err) {
        console.error("Error fetching recent rentals for dashboard:", err);
        return res.status(500).json({ message: "Error fetching recent rentals" });
      }

      console.log("SQL Results:", results); // SQL sorgusunun sonucunu loglayın

      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
