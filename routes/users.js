const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');


router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', auth, userController.logout);
// router.get('/me', auth, userController.getMe);
router.put('/join-community', auth, userController.joinCommunity);

module.exports = router;