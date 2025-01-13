import { connectDB } from '../config/db.js';
import { createBoatRegistration } from '../config/boatService.js';
import { User } from '../models/userModel.js';
import { Business } from '../models/businessModel.js';
import { Captain } from '../models/captainModel.js';
import { Boat } from '../models/boatModel.js';

const db = connectDB();


export const registerBoat = async (req, res) => {
  const { 
    boat_name, 
    description, 
    trip_types, 
    price_per_hour, 
    capacity, 
    boat_type, 
    location, 
    business_id 
  } = req.body;

  // Validate required fields
  if (!business_id || !boat_name || !description || !trip_types || 
      !price_per_hour || !capacity || !boat_type || !location) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate files
  if (!req.files?.photos || !req.files?.license) {
    return res.status(400).json({ 
      message: 'Both photos and license files are required' 
    });
  }

  try {
    // Step 1: Create the boat registration
    const result = await createBoatRegistration(
      db,
      req.body,
      {
        photos: req.files.photos,
        license: req.files.license[0]
      },
      process.env.AWS_S3_BUCKET
    );

    // Step 2: Get the boat_id from the result (assumes result contains the boat info including boat_id)
    const boatId = result.boat_id;

    // Step 3: Add the boat_id to the verification table
    const verificationQuery = `
        INSERT INTO verification (
          boat_id,
          boat_approvement,
          verification_status
        ) VALUES (?, 1, 'inReview')
      `; // Assuming the default status for a new boat verification is 'inReview'

    
      db.query(verificationQuery, [boatId], (verificationErr) => {
        if (verificationErr) {
          console.error('Error adding boat to verification:', verificationErr);
          return res.status(500).json({ message: 'Error creating verification record' });
        }
    });

    // Step 4: Return success response
    return res.status(201).json({
      message: 'Boat registered successfully',
      boat: result
    });
    
  } catch (error) {
    console.error('Server error during boat registration:', error);
    return res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

export const getBoat = (req, res) => {
  const { business_id } = req.query;
  Boat.getBoat(db, business_id, (err, results) => {
    if (err) {
      console.error('Error fetching boats:', err);
      return res.status(500).json({ message: 'Error fetching boats' });
    }
    res.status(200).json({ boats: results });
  });
};

export const getCaptain = (req, res) => {
  const { business_id } = req.query;
  Captain.getCaptain(db, business_id, (err, results) => {
    if (err) {
      console.error('Error fetching captains:', err);
      return res.status(500).json({ message: 'Error fetching captains' });
    }
    res.status(200).json({ captains: results });
  });
};

export const getBusiness = (req, res) => {
  Business.getAllBusinesses(db, (err, results) => {
    if (err) {
      console.error('Error fetching businesses:', err);
      return res.status(500).json({ message: 'Error fetching businesses' });
    }
    res.status(200).json({ businesses: results });
  });
};

export const getUser = (req, res) => {
  User.getUser(db, 'business', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Error fetching users' });
    }
    res.status(200).json({ users: results });
  });
};
export const getBusinessID = (req, res) => {
  const userId = req.params.userId;
  console.log("Received userId:", userId); // Log the userId to see if it's correctly passed

  const query = 'SELECT business_id FROM businesses WHERE user_id = ?';
  
  req.db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Database query failed:", err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (result.length > 0) {
      console.log("Business ID found:", result[0].business_id); // Log the found business ID
      return res.json({ business_id: result[0].business_id });
    } else {
      console.log("No business found for userId:", userId); // Log when no business is found
      return res.status(404).json({ error: 'No business found for this user' });
    }
  });
};
