const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const auth = require('../middleware/auth');

router.get('/select', communityController.selectCommunity);
router.get('/', communityController.getCommunities);
router.get('/:id/volunteers', auth, communityController.getVolunteers);
router.post('/:id/locations', auth, communityController.addLocation);
router.post('/:id/join-volunteer', auth, communityController.joinVolunteer);
router.delete('/:id/locations/:locationId', auth, communityController.deleteLocation);
router.post('/:id/verify-certificate', auth, communityController.verifyVolunteerForCertificate);
router.delete('/:id/volunteers/:volunteerId', auth, communityController.deleteVolunteer); 

module.exports = router;