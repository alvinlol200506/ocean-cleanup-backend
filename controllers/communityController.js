const Community = require('../models/Community');
const { getCommunityById } = require('../config/constants');
const User = require('../models/User');

// Mendapatkan daftar semua komunitas
const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate('members', 'email');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mendapatkan detail komunitas berdasarkan ID
const getCommunityDetails = async (req, res) => { // Ubah nama di sini
  try {
    const community = await Community.findById(req.params.id).populate('members', 'email');
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Menambahkan lokasi ke komunitas
const addLocation = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;
    const userId = req.user; // Diambil dari middleware auth
    const communityId = req.params.id;

    // Validasi communityId
    if (!getCommunityById(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }

    // Validasi input
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ message: 'Name, latitude, and longitude are required' });
    }

    // Cari komunitas
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Tambahkan lokasi baru
    community.locations.push({
      name,
      latitude,
      longitude,
      addedBy: req.user,
    });

    await community.save();
    res.status(201).json({ message: 'Location added successfully', location: community.locations[community.locations.length - 1] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getCommunities, getCommunityDetails, addLocation };