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
app.use(express.json());

// Middleware
app.use(cors());
app.use(express.json());

// users
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// communities
const communityRoutes = require('./routes/communities');
app.use('/api/communities', communityRoutes);

// Koneksi ke MongoDB
connectDB();


// Inisialisasi komunitas fixed jika belum ada
const initializeCommunities = async () => {
  try {
    const count = await Community.countDocuments();
    if (count === 0) {
      await Community.insertMany(COMMUNITIES);
      console.log('Fixed communities initialized:', COMMUNITIES.map(c => c.name).join(', '));
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