const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Community = require('../models/Community');
const { getCommunityById } = require('../config/constants');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

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

const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });

    const transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:5000/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Click this link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token has expired' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { namaLengkap, email, password } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (namaLengkap) user.namaLengkap = namaLengkap;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        namaLengkap: user.namaLengkap,
        email: user.email,
        communityId: user.communityId,
      },
    });
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



const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // Ganti ke 587 untuk TLS
  secure: false, // Ganti ke false untuk port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = { register, login, logout, joinCommunity, updateProfile, resetPassword, transporter, resetPasswordWithToken };