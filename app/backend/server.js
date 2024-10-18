import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js'; 
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the database connection
const db = connectDB();

// Pass `db` to your routes or middleware if needed
app.use('/api/auth', (req, res, next) => {
  req.db = db; // Attach db to the request object
  next();
}, authRoutes);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
