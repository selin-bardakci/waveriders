import { connectDB } from '../config/db.js'; 
import { Auction } from '../models/listingModel.js';


const db = connectDB();
export const createListing = async (req, res, db) => {
  try {
    console.log('createListing method called');
    const { productName, description, minPrice, duration} = req.body;
    const id = req.users.id;
    const images = req.files;

    console.log('Request Body:', req.body); // Log request body
    console.log('Uploaded Files:', req.files); // Log uploaded files

    // Validate input data
    if (!productName || !description || !minPrice || !duration || !images || images.length === 0) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Correctly form the image paths to save in the database
    const imagePaths = images.map((file) => file.path);
    
  
    const auctionId = generateUniqueListingId(); // Assuming you have a function to generate unique IDs

  const sql = `
    INSERT INTO listings 
    (listing_id, product_name, description, min_price, duration, images, user_id, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

const values = [
  auctionId, 
  productName,
  description,
  minPrice,
  duration,
  JSON.stringify(imagePaths), // Save images as a JSON string
  id || 1, 
];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error inserting auction listing:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log('Auction created successfully:', result);
      res.status(201).json({ message: 'Auction created successfully', id: result.insertId });
    });
  } catch (error) {
    console.error('Error in createAuction controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


function generateUniqueListingId() {
 
  return 'auction_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
}

// Function to fetch all auctions
export const fetchListings = async (req, res) => {
  try {
    Auction.findAllListings(db, (err, results) => {
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
