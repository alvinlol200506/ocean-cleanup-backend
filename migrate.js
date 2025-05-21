const mongoose = require('mongoose');
const Community = require('./models/Community');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ocean-cleanup-backend', {
      serverSelectionTimeoutMS: 5000, // Timeout untuk tes
    });
    console.log('MongoDB connected for migration');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

async function migrateLocations() {
  await connectDB();
  const communities = await Community.find();
  for (const community of communities) {
    community.locations = community.locations.map(loc => ({ ...loc, _id: new mongoose.Types.ObjectId() }));
    await community.save();
    console.log(`Migrated community ${community._id}`);
  }
  console.log('Migration completed');
  mongoose.connection.close();
}

migrateLocations().catch(console.error);