const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    name: String,
    description: String,
    image: String,
    category: String,
    stock: Number,
    price: Number
})
module.exports = mongoose.model('Product', schema)