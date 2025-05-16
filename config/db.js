const mongoose = require('mongoose'); // untuk koneksi dengan MongoDB Atlas
const dotenv = require('dotenv'); // memuat variabel dari .env (rahasia)

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // menggunakan Parser baru MongoDB agar tidak terjadi error karena versi
      useUnifiedTopology: true, // menggunakan Tapology baru MongoDB agar tidak terjadi error karena versi
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;