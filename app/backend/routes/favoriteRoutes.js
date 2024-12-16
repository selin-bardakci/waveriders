import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { addFavorite, removeFavorite, getUserFavorites } from '../controllers/favoriteController.js'; 

const router = express.Router();

router.post('/', authenticateToken, addFavorite); 
router.delete('/', authenticateToken, removeFavorite); 
router.get('/', authenticateToken, getUserFavorites);

export default router;
