const mongoose = require('mongoose'); // untuk koneksi dengan MongoDB Atlas

// Daftar komunitas fixed dengan ObjectId yang sudah ditentukan
const COMMUNITIES = [
  {
    _id: new mongoose.Types.ObjectId('667f1a2b3c5d4e6f78912345'),
    name: 'Tanam Mangrove',
    description: 'Komunitas untuk pelestarian mangrove.',
  },
  {
    _id: new mongoose.Types.ObjectId('667f1a2b3c5d4e6f78912346'),
    name: 'Pantai Kita',
    description: 'Komunitas untuk kebersihan pantai.',
  },
  {
    _id: new mongoose.Types.ObjectId('667f1a2b3c5d4e6f78912347'),
    name: 'Sahabat Terumbu',
    description: 'Komunitas untuk pelestarian terumbu karang.',
  },
];

// Validasi komunitas berdasarkan ID
const getCommunityById = (id) => COMMUNITIES.find(community => community._id.toString() === id);

module.exports = { COMMUNITIES, getCommunityById };