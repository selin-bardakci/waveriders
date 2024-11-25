import { connectDB } from '../config/db.js';
import { Listing } from '../models/listingModel.js';

const db = connectDB();

// Controller for creating a new boat listing
export const createListing = async (req, res) => {
  try {
    console.log('createListing method called');
    
    const { boatName, boatType, capacity, pricePerHour, description, location } = req.body;
    const businessId = req.user.id; 
    const images = req.files; 

    console.log('Request Body:', req.body);
    console.log('Uploaded Files:', req.files);

   
    if (!boatName || !boatType || !capacity || !location || !pricePerHour || !description || !images || images.length === 0) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const imagePaths = images.map((file) => file.path);

    
    const listingData = {
      boatName,
      boatType,
      capacity,
      pricePerHour,
      description,
      businessId,
      location,     
      imagePaths
    };

    Listing.createListing(db, listingData, (err, result) => {
      if (err) {
        console.error('Error creating boat listing:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json({ message: 'Boat listing created successfully', id: result.insertId });
    });
  } catch (error) {
    console.error('Error in createListing controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller for fetching all boat listings
export const fetchListings = async (req, res) => {
  try {
    Listing.findAllListings(db, (err, results) => {
      if (err) {
        console.error('Error fetching listings:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller for fetching a boat listing by ID
export const fetchListingById = async (req, res) => {
  const listingId = req.params.id;

  try {
    Listing.findListingById(db, listingId, (err, result) => {
      if (err) {
        console.error('Error fetching listing:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!result.length) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      res.status(200).json(result[0]);
    });
  } catch (error) {
    console.error('Error fetching listing by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller for updating a boat listing by ID
export const updateListing = async (req, res) => {
  const listingId = req.params.id;
  const { boatName, boatType, capacity, pricePerHour, description, location } = req.body;
  const images = req.files; // Handling uploaded images

  try {
    const imagePaths = images ? images.map((file) => file.path) : [];

    const updatedData = {
      boatName,
      boatType,
      capacity,
      pricePerHour,
      description,
      location,
      imagePaths
    };

    Listing.updateListingById(db, listingId, updatedData, (err, result) => {
      if (err) {
        console.error('Error updating listing:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      res.status(200).json({ message: 'Listing updated successfully' });
    });
  } catch (error) {
    console.error('Error in updateListing controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller for deleting a boat listing by ID
export const deleteListing = async (req, res) => {
  const listingId = req.params.id;

  try {
    Listing.deleteListingById(db, listingId, (err, result) => {
      if (err) {
        console.error('Error deleting listing:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      res.status(200).json({ message: 'Listing deleted successfully' });
    });
  } catch (error) {
    console.error('Error in deleteListing controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
