const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Community = require('../models/Community');
const { getCommunityById } = require('../config/constants');
const dotenv = require('dotenv');

dotenv.config();

// Registrasi pengguna baru
const register = async (req, res) => {
  try {
    const { namaLengkap, email, password, communityId } = req.body;
    if (!namaLengkap || !email || !password || !communityId) {
      return res.status(400).json({ message: 'Nama lengkap, email, password, and communityId are required' });
    }
    if (!getCommunityById(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      namaLengkap,
      email,
      password: hashedPassword,
      communityId,
    });
    await user.save();
    const community = await Community.findById(communityId);
    if (community) {
      community.members.push(user._id);
      await community.save();
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        namaLengkap,
        email,
        communityId,
      },
      redirect: `/dashboard?communityId=${communityId}`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user._id,
        namaLengkap: user.namaLengkap,
        email: user.email,
        communityId: user.communityId,
      },
      redirect: `/dashboard?communityId=${user.communityId}`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
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

module.exports = { register, login, logout, joinCommunity };