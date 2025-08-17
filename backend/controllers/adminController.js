const User = require('../models/userModel')
const Product = require('../models/productModel')

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password')
        res.json({ users })
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error })
    }
}

exports.getAllOrders = async (req, res) => {
    try {
        // This would need an Order model to be implemented
        // For now, returning empty array
        res.json({ orders: [] })
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error })
    }
}

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
        res.json({ products })
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error })
    }
}