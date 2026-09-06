const mongoose = require('mongoose')
const dotenv = require('dotenv')

const MONGO_URI = process.env.MONGO_URI
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('Database connected successfully')
    }
    catch (error) {
        console.error('Database connection failed:', error)
        process.exit(1)
    }
}
module.exports = connectDB