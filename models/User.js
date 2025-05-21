const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  namaLengkap: {
    type: String,
    required: [true, 'Nama lengkap is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: [true, 'Community ID is required'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;