const mongoose = require("mongoose")
require("dotenv").config()

const DB_URL = process.env.DB_CONNECT

mongoose.connection.on("open", () => {
    console.log("MongoDB connection ready!")
  })
  
  mongoose.connection.on("error", (err) => {
     console.error(`${err}`)
  })

const connectToMongo = async() => {
     await mongoose.connect(DB_URL)
}

module.exports = connectToMongo