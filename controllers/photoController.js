const Photo = require('../models/Photo');
const { getCommunityById } = require('../config/constants');

// Mengunggah foto baru
const uploadPhoto = async (req, res) => {
  try {
    const { communityId, caption } = req.body;
    const userId = req.user; // Diambil dari middleware auth

    if (communityId && !getCommunityById(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imageUrl) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const photo = new Photo({
      userId,
      communityId,
      imageUrl,
      caption,
    });

    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mendapatkan daftar foto
const getPhotos = async (req, res) => {
  try {
    const photos = await Photo.find().populate('userId', 'email').populate('communityId', 'name');
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mendapatkan detail foto berdasarkan ID
const getPhotoById = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id).populate('userId', 'email').populate('communityId', 'name');
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { uploadPhoto, getPhotos, getPhotoById };