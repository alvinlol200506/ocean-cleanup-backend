const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const auth = require('../middleware/auth');

router.get('/select', communityController.selectCommunity);
router.get('/', communityController.getCommunities);
router.post('/:id/locations', auth, communityController.addLocation);
router.post('/:id/join-volunteer', auth, communityController.joinVolunteer);
router.post('/:id/issue-certificate', auth, communityController.issueCertificate);

module.exports = router;