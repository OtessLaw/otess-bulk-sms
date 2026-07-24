// Import mongoose package to connect to MongoDB database
const mongoose = require('mongoose');

/**
 * Function: connectDB
 * Description: Establishes a persistent connection to the MongoDB Atlas or local MongoDB instance.
 */
const connectDB = async () => {
  try {
    // Read MONGO_URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/otess_sms');
    
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Exit process with failure code if connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
