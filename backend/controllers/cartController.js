const Cart = require('../models/cartModel')

exports.getCart = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const cart = await Cart.findOne({ user: req.session.user._id }).populate('items.product');
        if (cart && cart.items) {
            res.json(cart.items);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
}

exports.addToCart = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        let cart = await Cart.findOne({ user: req.session.user._id });

        if (!cart) {
            cart = new Cart({
                user: req.session.user._id,
                items: [{ product: productId, quantity }]
            });
        } else {
            const existingItem = cart.items.find(item =>
                item.product.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
        }

        await cart.save();
        res.json({ message: 'Product added to cart successfully', cart });
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
}

exports.updateCartItem = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { productId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.session.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.product.toString() === productId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(item => item.product.toString() !== productId);
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        res.json({ message: 'Cart updated successfully', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart', error });
    }
}

exports.removeFromCart = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.session.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();

        res.json({ message: 'Item removed from cart successfully', cart });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Error removing from cart', error: error.message });
    }
}