const mongoose = require("mongoose")
require("dotenv").config()

const DB_URL = process.env.DB_CONNECT

mongoose.connection.on("open", () => {
    console.log("MongoDB connection ready!")
})
  
mongoose.connection.on("error", (err) => {
    console.error(`MongoDB connection error: ${err}`)
})

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected")
})

const connectToMongo = async() => {
    try {
        if (!DB_URL) {
            throw new Error('DB_CONNECT environment variable is not set');
        }
        await mongoose.connect(DB_URL);
        console.log('MongoDB connection initiated');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

module.exports = connectToMongo