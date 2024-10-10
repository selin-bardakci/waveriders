import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js'; 
import { connectDB } from './config/db.js'; 

const app = express();
app.use(cors());
app.use(express.json());

// Connect to the database
connectDB();


app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


