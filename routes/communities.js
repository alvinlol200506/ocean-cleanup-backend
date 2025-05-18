const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const auth = require('../middleware/auth');

// Rute untuk mendapatkan daftar semua komunitas
router.get('/', communityController.getCommunities);

// Rute untuk mendapatkan detail komunitas berdasarkan ID
router.get('/:id', communityController.getCommunityDetails);

// Rute untuk menambahkan lokasi ke komunitas (memerlukan autentikasi)
router.post('/:id/locations', auth, communityController.addLocation);

module.exports = router;