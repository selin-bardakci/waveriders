import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { addFavorite, removeFavorite, getUserFavorites } from '../controllers/favoriteController.js'; 
import { getFavoriteBoats } from '../controllers/favoriteController.js';

const router = express.Router();

router.post('/', authenticateToken, addFavorite); 
router.delete('/', authenticateToken, removeFavorite); 
router.get('/', authenticateToken, getUserFavorites);
router.get('/dashboard', authenticateToken, (req, res, next) => {
    console.log("Middleware çalıştı ve token kontrol edildi.");
    next();
  }, getFavoriteBoats);
  

export default router;
