import { connectDB } from '../config/db.js';
import{ connectDBB } from '../config/dbb.js';
import { Listing } from '../models/listingModel.js';
import { uploadToS3 } from '../config/s3.js'; // S3 upload logic
import  getSignedUrl  from '../../utils/s3utils.js';
import path from 'path'; // Module for resolving file paths
import AWS from 'aws-sdk';
import multer from 'multer'; // Multer for handling file uploads
import fs from 'fs/promises'; // File system for async operations
let randomSeed;
const bucketName = 'waveriders-boat-photos';
const db = connectDB();
const dbb = connectDBB();

// Configure Multer for handling photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/photos'; // Directory for photos
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

export const uploadPhotos = upload.array('photos', 5); // Middleware for handling multiple files

// Controller for creating a boat listing
export const createListing = async (req, res) => {
  try {
    console.log('Received Files:', req.files); // Log uploaded files
    console.log('Request Body:', req.body); // Log form data

    const {
      boat_name: boatName,
      boat_type: boatType,
      capacity,
      price_per_hour: pricePerHour,
      price_per_day: pricePerDay,
      description,
      location,
      business_id: businessId,
    } = req.body;

    if (!boatName || !boatType || !capacity || !pricePerHour || !description || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'All fields and at least one photo are required' });
    }

    // Upload files to S3
    const s3Urls = [];
    for (const file of req.files) {
      try {
        const fullPath = path.resolve(file.path);
        console.log('Uploading file to S3:', fullPath);
        const s3Url = await uploadToS3(fullPath, process.env.AWS_S3_BUCKET);
        console.log('Uploaded to S3:', s3Url);
        s3Urls.push(s3Url);

        // Optionally delete the local file after uploading to S3
        await fs.unlink(fullPath);
      } catch (uploadError) {
        console.error(`Error uploading file ${file.path} to S3:`, uploadError);
        return res.status(500).json({ error: 'Failed to upload photos to S3' });
      }
    }

    console.log('Uploaded S3 URLs:', s3Urls);

    // Insert listing data into the database
    const listingData = {
      boat_name: boatName,
      description,
      trip_types: req.body.trip_types || '',
      price_per_hour: pricePerHour,
      price_per_day: pricePerDay || null,
      capacity,
      boat_type: boatType,
      location,
      business_id: businessId,
      photos: JSON.stringify(s3Urls), // Store photo URLs
    };

    console.log('Inserting Data:', listingData);

    const newListing = await db.insert('boats', listingData); // Replace with your DB insertion logic

    return res.status(201).json({
      message: 'Listing created successfully',
      listing: newListing,
    });
  } catch (error) {
    console.error('Error in createListing:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller for fetching all listings
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

// Controller for fetching a listing by ID
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

// Controller for deleting a listing by ID
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
    console.error('Error in deleteListing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getListingByBoatId = async (req, res) => {
  console.log('getListingByBoatId invoked'); // Initial log

  try {
    const boatId = req.params.boat_id; // Access the correct parameter
    console.log(`Fetching details for boat_id: ${boatId}`); // Log ID

    const [rows] = await req.dbb.query('SELECT * FROM boats WHERE boat_id = ?', [boatId]);
    console.log(`Query result for boat_id ${boatId}:`, rows); // Log query result

    if (rows.length === 0) {
      console.warn(`Boat with id ${boatId} not found`);
      return res.status(404).json({ error: 'Boat not found' });
    }

    const boat = rows[0];
    console.log('Boat details:', boat);

    // Handle the photos field
    let photoKeys = [];
    try {
      photoKeys = Array.isArray(boat.photos) ? boat.photos : JSON.parse(boat.photos || '[]');
    } catch (parseError) {
      console.error('Error parsing photos field:', parseError);
      return res.status(500).json({ error: 'Invalid photos data format' });
    }
    console.log('Photo keys:', photoKeys);

    // Generate signed URLs for each photo
    const signedUrls = photoKeys.map((key) => {
  return key;
    });
    

    console.log('Signed URLs:', signedUrls);
    res.json({ ...boat, photos: signedUrls });
  } catch (error) {
    console.error('Error in getListingByBoatId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getListings = async (req, res) => {
  try {
    const [rows] = await req.dbb.query('SELECT * FROM boats');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch random listings
export const getRandomListings = async (req, res) => {
  try {
    const [rows] = await dbb.query("SELECT * FROM waveriders.boats ORDER BY RAND() LIMIT 4");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching random listings:", error);
    res.status(500).json({ message: "Failed to fetch random listings" });
  }
};

export const getPaginatedListings = async (req, res) => {
  const { page = 1, limit = 15, price_min, price_max, trip_type, vehicle_type, sortField, sortOrder, location, start_date, end_date, guests } = req.query;
  console.log('Received sortField:', sortField); 
  console.log('Received sortOrder:', sortOrder); 
  console.log('Filters:', { price_min, price_max, trip_type, vehicle_type });
  console.log('Pagination:', { page, limit });
  
  try {
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM boats WHERE 1=1';
    let totalQuery = 'SELECT COUNT(*) as total FROM boats WHERE 1=1';
    const params = [];
    const totalParams = [];

    // Price filter
    if (price_min) {
      query += ' AND price_per_hour >= ?';
      totalQuery += ' AND price_per_hour >= ?';
      params.push(price_min);
      totalParams.push(price_min);
    }
    if (price_max) {
      query += ' AND price_per_hour <= ?';
      totalQuery += ' AND price_per_hour <= ?';
      params.push(price_max);
      totalParams.push(price_max);
    }

    // Date filter (exclude boats rented during selected dates)
    if (start_date && end_date) {
      query += ` AND boat_id NOT IN (
        SELECT boat_id FROM rentals WHERE
        (start_date BETWEEN ? AND ?) OR
        (end_date BETWEEN ? AND ?)
      )`;
      totalQuery += ` AND boat_id NOT IN (
        SELECT boat_id FROM rentals WHERE
        (start_date BETWEEN ? AND ?) OR
        (end_date BETWEEN ? AND ?)
      )`;
      params.push(start_date, end_date, start_date, end_date);
      totalParams.push(start_date, end_date, start_date, end_date);
    }

    // Location filter
    if (location && location !== '' && location !== 'All Ports') {
      query += ' AND location = ?';
      totalQuery += ' AND location = ?';
      params.push(location);
      totalParams.push(location);
    } else {
      console.log('Location is "All Ports" or empty, fetching all ports.');
    }
    if (guests) {
      query += ' AND capacity >= ?';
      totalQuery += ' AND capacity >= ?';
      params.push(guests);
      totalParams.push(guests);
    }

    // Trip Type filter
    let tripTypes = [];
    let tripTypeConditions = '';
    if (trip_type) {
      tripTypes = Array.isArray(trip_type) ? trip_type : [trip_type];
      tripTypeConditions = tripTypes
        .map(() => 'FIND_IN_SET(?, trip_types) > 0')
        .join(' OR ');
      query += ` AND (${tripTypeConditions})`;
      totalQuery += ` AND (${tripTypeConditions})`;
      params.push(...tripTypes);
      totalParams.push(...tripTypes);
    }

    // Vehicle type filter
    if (vehicle_type) {
      query += ' AND boat_type = ?';
      totalQuery += ' AND boat_type = ?';
      params.push(vehicle_type); 
      totalParams.push(vehicle_type);
    }

    // Sort field and order
    if (sortField && sortOrder) {
      const validSortFields = ['price_per_hour']; 
      const validSortOrders = ['asc', 'desc'];

      if (!validSortFields.includes(sortField) || !validSortOrders.includes(sortOrder.toLowerCase())) {
        console.log('Invalid sortField or sortOrder:', sortField, sortOrder);
        return res.status(400).json({ message: 'Invalid sort parameters' });
      }

      query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
    }

    // Pagination limit and offset
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    console.log('Generated SQL query:', query);
    console.log('Query parameters:', params);

    const [rows] = await dbb.query(query, params);

    console.log('Generated Total SQL query:', totalQuery);
    console.log('Total Query parameters:', totalParams);

    const [[{ total }]] = await dbb.query(totalQuery, totalParams);

    res.json({ rows, total });
  } catch (error) {
    console.error('Error fetching paginated listings:', error);
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
};








