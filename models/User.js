const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true, // menghapus spasi sebelum email, seperti " user@example.com"
    lowercase: true, // mengubah email menjadi huruf kecil semua
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], // memastikan inputnya sesuai struktur email, yaitu user@example.com
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  birthDate: {
    day: {
      type: Number,
      required: [true, 'Birth day is required'],
      min: 1,
      max: 31,
    },
    month: {
      type: Number,
      required: [true, 'Birth month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Birth year is required'],
      min: 1900,
      max: new Date().getFullYear(),
    },
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;