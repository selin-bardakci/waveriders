import { connectDB } from '../config/db.js';
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
    // Status default "ongoing"
    const status = 'ongoing';

    const calculated_end_date = end_date || start_date;

    const sql = `
      INSERT INTO rentals (customer_id, boat_id, start_date, end_date, rental_price, status, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [customer_id, boat_id, start_date, calculated_end_date, rental_price, status, start_time, end_time],
      (err, result) => {
        if (err) {
          console.error('Error inserting rental:', err);
          return res.status(500).json({ message: 'Error creating rental.' });
        }
        res.status(201).json({ message: 'Rental created successfully!', rental_id: result.insertId });
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

      res.status(200).json(results[0]);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const cancelBooking = async (req, res) => {
  const { rental_id } = req.params;

  if (!rental_id) {
    return res.status(400).json({ message: 'Rental ID is required' });
  }

  try {
    const sql = `
      DELETE FROM rentals
      WHERE rental_id = ?
    `;

    db.query(sql, [rental_id], (err, result) => {
      if (err) {
        console.error('Error deleting booking:', err);
        return res.status(500).json({ message: 'Error deleting booking' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Booking not found or already deleted' });
      }

      res.status(200).json({ message: 'Booking deleted successfully' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



