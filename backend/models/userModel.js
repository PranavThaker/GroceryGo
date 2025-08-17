const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true })
module.exports = mongoose.model('User', schema)