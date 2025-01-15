import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js'; 
import { connectDBB } from './config/dbb.js'; 
import { attachDBMiddleware } from './middleware/attachDBMiddleware.js';
import { checkAndUpdateRentalStatus } from './scheduler.js';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import boatRoutes from './routes/boatRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import newboatRoutes from './routes/newboatRoutes.js';
import tripTypesRoutes from './routes/tripTypesRoutes.js'; // Add this import
import verificationRoutes from './routes/verificationRoutes.js';
import './scheduler.js'; 

const app = express();
console.log('Loaded Environment Variables:', process.env);


const allowedOrigins = ['https://waveriders.com.tr', 'http://localhost:3000']; // Add your allowed origins
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow requests from allowed origins
    } else {
      callback(new Error('Not allowed by CORS')); // Reject requests from other origins
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
  credentials: true, // Allow credentials (e.g., cookies or Authorization headers)
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Increase JSON body size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Increase URL-encoded body size limit
app.use(attachDBMiddleware);
app.use(tripTypesRoutes); 
// Initialize the database connection
const db = connectDB();
const dbb = connectDBB();

app.use((req, res, next) => {
  req.db = db; // Attach the database instance to the request object
  next();
});
app.use((req, res, next) => {
  req.dbb = dbb; // Attach the database instance to the request object
  next();
});
app.use((req, res, next) => {
  console.log(`Unhandled request: ${req.method} ${req.url}`);
  next();
});

app.use('/api/boats', boatRoutes);


// Route handlers
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/listings', listingRoutes); // Listings routes
app.use('/api/users', userRoutes);
app.use('/api/rentals', rentalRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/boats', boatRoutes);
app.use('/api/newBoat', newboatRoutes);
app.use('/api/verification', verificationRoutes);
checkAndUpdateRentalStatus();

// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

