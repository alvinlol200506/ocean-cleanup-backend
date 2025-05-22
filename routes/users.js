const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');


router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', auth, userController.logout);
router.put('/join-community', auth, userController.joinCommunity);
router.put('/profile', auth, userController.updateProfile);
router.post('/reset-password', userController.resetPassword);
router.post('/reset-password/:token', userController.resetPasswordWithToken);

module.exports = router;