import { connectDB } from '../config/db.js';
const db = connectDB();

// Get Business Listings
export const getBusinessListings = async (req, res) => {
  const userId = req.user.id;

  try {
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
