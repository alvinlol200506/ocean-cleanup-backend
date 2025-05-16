const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { COMMUNITIES } = require('./config/constants');
const Community = require('./models/Community');

// Inisialisasi variabel lingkungan
dotenv.config();

// Buat aplikasi Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Koneksi ke MongoDB
connectDB();

// Inisialisasi komunitas fixed jika belum ada
const initializeCommunities = async () => {
  try {
    const count = await Community.countDocuments();
    if (count === 0) {
      await Community.insertMany(COMMUNITIES);
      console.log('Fixed communities initialized: Mangrove, Pantai, Terumbu Karang');
    }
  } catch (error) {
    console.error('Error initializing communities:', error);
  }
};
initializeCommunities();

// Rute (akan ditambahkan di file routes/)
app.get('/', (req, res) => {
  res.send('Ocean Cleanup Backend API');
});

// Port dari .env atau default 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});