require('dotenv').config()
const mongoose = require('mongoose')
const mongoURI = process.env.MONGOURI

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 5, // ✅ Limits concurrent open connections
            minPoolSize: 1, // ✅ Keeps at least one connection alive
            family: 4
        })
        console.log("Connected to MongoDB Successfully.")
    }
    catch(error){
        console.error("Failed to connect to MongoDB ",error)
    }
}

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('🔌 Mongoose connection closed due to app termination')
  process.exit(0)
})


module.exports = connectToMongo
