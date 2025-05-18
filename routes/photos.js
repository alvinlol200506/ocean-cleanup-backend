const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Rute untuk mengunggah foto (memerlukan autentikasi)
router.post('/', auth, upload.single('image'), photoController.uploadPhoto);

// Rute untuk mendapatkan daftar foto
router.get('/', photoController.getPhotos);

// Rute untuk mendapatkan detail foto berdasarkan ID
router.get('/:id', photoController.getPhotoById);

module.exports = router;