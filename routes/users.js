const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Rute untuk registrasi pengguna
router.post('/register', userController.register);

// Rute untuk login pengguna
router.post('/login', userController.login);

// Rute untuk mendapatkan profil pengguna (memerlukan autentikasi)
router.get('/me', auth, userController.getMe);

// Rute untuk bergabung dengan komunitas (memerlukan autentikasi)
router.put('/join-community', auth, userController.joinCommunity);

module.exports = router;