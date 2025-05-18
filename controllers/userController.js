const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getCommunityById } = require('../config/constants');
const dotenv = require('dotenv');

dotenv.config();

// Registrasi pengguna baru
const register = async (req, res) => {
  try {
    const { email, password, birthDate, communityId } = req.body;

    // Validasi input
    if (!email || !password || !birthDate || !birthDate.day || !birthDate.month || !birthDate.year) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validasi communityId jika ada
    if (communityId && !getCommunityById(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat pengguna baru
    const user = new User({
      email,
      password: hashedPassword,
      birthDate,
      communityId: communityId || null,
    });

    await user.save();

    // Buat token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: { id: user._id, email: user.email, communityId: user.communityId } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login pengguna
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Cek apakah pengguna ada
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Buat token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

   res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        communityId: user.communityId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mendapatkan profil pengguna
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bergabung dengan komunitas
const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.body;

    // Validasi communityId
    if (!communityId || !getCommunityById(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }

    // Update komunitas pengguna
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.communityId = communityId;
    await user.save();

    // Tambahkan pengguna ke daftar anggota komunitas
    const community = await Community.findById(communityId);
    if (!community.members.includes(user._id)) {
      community.members.push(user._id);
      await community.save();
    }

    res.json({ message: 'Successfully joined community', communityId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getMe, joinCommunity };