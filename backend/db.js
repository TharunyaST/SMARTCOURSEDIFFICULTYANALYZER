const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB database');
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err.message);
        console.log('Please ensure your MongoDB server is running and MONGO_URI in .env is correct.');
        process.exit(1);
    }
};

module.exports = connectDB;
