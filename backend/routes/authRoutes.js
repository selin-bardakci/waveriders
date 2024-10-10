import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Registration route
router.post('/signup', registerUser);
// Login route
router.post('/login', loginUser);


export default router;
