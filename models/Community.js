const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: -180,
    max: 180,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    enum: {
      values: ['Tanam Mangrove', 'Pantai Kita', 'Sahabat Terumbu'],
      message: 'Community name must be Tanam Mangrove, Pantai Kita, or Sahabat Terumbu',
    },
  },
  description: {
    type: String,
    default: '',
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  locations: [
    {
      _id: mongoose.Schema.Types.ObjectId, // Tambahkan _id
      tanggal: { type: String, required: true },
      lokasiJalan: { type: String, required: true },
      mission: { type: String, required: true },
      namaPantai: { type: String, required: true },
      foto: { type: String, required: true },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
  ],
  volunteers: [
    {
      namaLengkap: { type: String, required: true },
      namaPantai: { type: String, required: true },
      tanggalKegiatan: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;