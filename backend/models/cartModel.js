const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: Number
        }
    ]
})
module.exports = mongoose.model('Cart', schema)