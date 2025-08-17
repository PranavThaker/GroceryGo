const Product = require('../models/productModel')

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
        res.json(products)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error })
    }
}

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }
        res.json(product)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error })
    }
}

exports.createProduct = async (req, res) => {
    try {
        const { name, description, image, category, stock, price } = req.body
        const product = new Product({ name, description, image, category, stock, price })
        await product.save()
        res.status(201).json({ message: 'Product created successfully', product })
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error })
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const { name, description, image, category, stock, price } = req.body
        const updateData = {}

        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (image !== undefined) updateData.image = image
        if (category !== undefined) updateData.category = category
        if (stock !== undefined) updateData.stock = stock
        if (price !== undefined) updateData.price = price

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }
        res.json({ message: 'Product updated successfully', product })
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error })
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }
        res.json({ message: 'Product deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error })
    }
}