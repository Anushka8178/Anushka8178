const mongoose = require('mongoose');
const Listing = require('./models/listing');

async function clearDatabase() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/majorProject');
        console.log("Connected to MongoDB");
        
        // Drop the entire database
        await mongoose.connection.dropDatabase();
        console.log("Database dropped successfully");
        
        // Verify the database is empty
        const count = await Listing.countDocuments();
        console.log(`Remaining listings: ${count}`);
        
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.connection.close();
        console.log("Connection closed");
    }
}

clearDatabase(); 