// routes/tripTypesRoutes.js
const express = require('express');
const router = express.Router();

// Veritabanı bağlantınızın olduğu yer
const db = require('../db'); // Buradaki db, veritabanı bağlantınızı içeren dosya olabilir.

router.get('/api/tripTypes', async (req, res) => {
  try {
    const tripTypes = await db.query('SELECT * FROM trip_types'); // trip_types tablosu üzerinden veri çekiyoruz
    res.json(tripTypes.rows); // Veriyi döndürüyoruz
  } catch (err) {
    console.error('Error fetching trip types:', err);
    res.status(500).send('Failed to fetch trip types');
  }
});

module.exports = router;
