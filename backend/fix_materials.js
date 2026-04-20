const mongoose = require('mongoose');
const connectDB = require('./db');
const Material = require('./models/Material');

async function fix() {
    await connectDB();
    console.log('Fixing materials...');
    const result = await Material.updateMany(
        { fileUrl: { $exists: false } },
        { $set: { fileUrl: 'https://example.com/dummy-file.pdf' } }
    );
    console.log(`Updated ${result.modifiedCount} materials.`);
    process.exit(0);
}
fix();
