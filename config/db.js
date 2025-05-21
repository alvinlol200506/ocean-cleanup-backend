const mongoose = require('mongoose'); // untuk koneksi dengan MongoDB Atlas
const dotenv = require('dotenv'); // memuat variabel dari .env (rahasia)

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/ocean-cleanup-backend', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;