const mongoose = require('mongoose');
const Listing = require('./models/listing');

mongoose.connect('mongodb://localhost:27017/majorProject');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async () => {
    console.log("Database connected");
    try {
        const listings = await Listing.find({});
        console.log("Found listings:", listings.length);
        listings.forEach(listing => {
            console.log("Title:", listing.title);
            console.log("Category:", listing.category);
            console.log("Geometry:", listing.geometry);
            console.log("-------------------");
        });
    } catch (err) {
        console.error("Error fetching listings:", err);
    }
    mongoose.connection.close();
}); 