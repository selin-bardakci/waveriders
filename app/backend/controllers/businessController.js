import { connectDB } from '../config/db.js';
const db = connectDB();

// Get Business Listings
export const getBusinessListings = async (req, res) => {
  const userId = req.user.id; // AuthMiddleware üzerinden gelen kullanıcı ID

  try {
    // Business ID'yi al
    const businessSql = `SELECT business_id FROM businesses WHERE user_id = ?`;
    db.query(businessSql, [userId], (err, businessResults) => {
      if (err) {
        console.error("Error fetching business ID:", err);
        return res.status(500).json({ message: "Error fetching business ID" });
      }

      if (businessResults.length === 0) {
        return res.status(404).json({ message: "No business found for this user" });
      }

      const businessId = businessResults[0].business_id;

      // Business ID ile ilgili tüm botları getir
      const boatsSql = `
        SELECT boat_id, boat_name, description, price_per_hour, price_per_day, capacity, boat_type, location, available, photos
        FROM boats
        WHERE business_id = ?
      `;
      db.query(boatsSql, [businessId], (err, boatResults) => {
        if (err) {
          console.error("Error fetching boats:", err);
          return res.status(500).json({ message: "Error fetching boats" });
        }

        res.status(200).json({ boats: boatResults });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBusinessOrUserName = async (req, res) => {
  const user_id = req.user.id; // Kullanıcı kimliği JWT'den alınır

  try {
    // Önce users tablosunu kontrol et
    const userSql = `
      SELECT first_name, last_name
      FROM users
      WHERE user_id = ?
    `;
    db.query(userSql, [user_id], (err, userResult) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ message: "Error fetching user information" });
      }

      const user = userResult[0];

      // Eğer first_name ve last_name eksikse, businesses tablosunu kontrol et
      if (!user || (!user.first_name && !user.last_name)) {
        const businessSql = `
          SELECT business_name
          FROM businesses
          WHERE user_id = ?
        `;
        db.query(businessSql, [user_id], (err, businessResult) => {
          if (err) {
            console.error("Error fetching business:", err);
            return res.status(500).json({ message: "Error fetching business information" });
          }

          const business = businessResult[0];

          // Business adı varsa döndür
          if (business && business.business_name) {
            return res.status(200).json({ name: business.business_name });
          }

          // Eğer business_name bulunamazsa "Unknown User" döndür
          return res.status(404).json({ name: "Unknown User" });
        });
      } else {
        // Kullanıcı adını birleştir ve döndür
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        return res.status(200).json({ name: fullName });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMonthlyRentals = async (req, res) => {
  const userId = req.user.id;

  try {
    // Step 1: Find business_id from businesses table
    const [businessResult] = await db.promise().query(
      'SELECT business_id FROM businesses WHERE user_id = ?',
      [userId]
    );

    if (!businessResult.length) {
      console.error('No business found for the user');
      return res.status(404).json({ message: 'Business not found for the user' });
    }

    const businessId = businessResult[0].business_id;

    // Step 2: Find boat_ids from boats table
    const [boatsResult] = await db.promise().query(
      'SELECT boat_id FROM boats WHERE business_id = ?',
      [businessId]
    );

    if (!boatsResult.length) {
      console.error('No boats found for the business');
      return res.status(404).json({ message: 'No boats found for the business' });
    }

    const boatIds = boatsResult.map((boat) => boat.boat_id);
    console.log('Boat IDs:', boatIds);

    // Step 3: Count rentals per month for the current year
    const query = `
      SELECT MONTH(start_date) AS month, COUNT(*) AS rental_count
      FROM rentals
      WHERE boat_id IN (${boatIds.join(',')}) AND YEAR(start_date) = YEAR(CURDATE())
      GROUP BY MONTH(start_date)
    `;
    console.log('Executing Query:', query);

    const [rentalsResult] = await db.promise().query(query);

    console.log('Rentals Result:', rentalsResult);

    // Create an array for all months initialized to 0
    const monthlyRentals = Array(12).fill(0);
    rentalsResult.forEach(({ month, rental_count }) => {
      monthlyRentals[month - 1] = rental_count; // Adjust index (0-based)
    });

    res.status(200).json({ monthlyRentals });
  } catch (error) {
    console.error('Error fetching monthly rentals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




// Get Business Listings for Dashboard
export const getBusinessDashboardListings = async (req, res) => {
  const userId = req.user.id; // AuthMiddleware üzerinden gelen kullanıcı ID

  try {
    // Business ID'yi al
    const businessSql = `SELECT business_id FROM businesses WHERE user_id = ?`;
    db.query(businessSql, [userId], (err, businessResults) => {
      if (err) {
        console.error("Error fetching business ID:", err);
        return res.status(500).json({ message: "Error fetching business ID" });
      }

      if (businessResults.length === 0) {
        return res.status(404).json({ message: "No business found for this user" });
      }

      const businessId = businessResults[0].business_id;

      // Business ID ile ilgili maksimum 4 botu getir
      const boatsSql = `
        SELECT boat_id, boat_name, description, price_per_hour, price_per_day, capacity, boat_type, location, available, photos
        FROM boats
        WHERE business_id = ?
        LIMIT 4
      `;
      db.query(boatsSql, [businessId], (err, boatResults) => {
        if (err) {
          console.error("Error fetching boats:", err);
          return res.status(500).json({ message: "Error fetching boats" });
        }

        res.status(200).json({ boats: boatResults });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
