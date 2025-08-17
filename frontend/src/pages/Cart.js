import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';

function Cart({ isLoggedIn, updateCartCount }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        fetchCartItems();
    }, [isLoggedIn, navigate]);

    const fetchCartItems = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/cart', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                const items = Array.isArray(data) ? data : (data.items || []);
                setCartItems(items);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        try {
            const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ quantity: newQuantity })
            });
            if (response.ok) {
                fetchCartItems();
                if (updateCartCount) updateCartCount();
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const removeItem = async (productId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                fetchCartItems();
                if (updateCartCount) updateCartCount();
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.product ? item.product.price : item.price;
            return total + (price * item.quantity);
        }, 0);
    };

    const calculateItemsCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex align-items-center mb-4">
                        <button
                            className="btn btn-outline-secondary me-3"
                            onClick={() => navigate('/')}
                        >
                            <FaArrowLeft className="me-2" />
                            Continue Shopping
                        </button>
                        <h2 className="mb-0">Shopping Cart</h2>
                    </div>
                </div>
            </div>

            {cartItems.length === 0 ? (
                <div className="text-center py-5">
                    <h4 className="text-muted">Your cart is empty</h4>
                    <p className="text-muted">Add some products to get started!</p>
                    <button
                        className="btn btn-success"
                        onClick={() => navigate('/products')}
                    >
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card shadow-sm">
                            <div className="card-header">
                                <h5 className="mb-0">Cart Items ({calculateItemsCount()})</h5>
                            </div>
                            <div className="card-body">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="d-flex align-items-center border-bottom pb-3 mb-3">
                                        <div className="me-3">
                                            <img
                                                src={item.product ? (item.product.image ? `/${item.product.image}.png` : 'https://via.placeholder.com/80x80?text=Product') : (item.image ? `/${item.image}.png` : 'https://via.placeholder.com/80x80?text=Product')}
                                                alt={item.product ? item.product.name : item.name}
                                                className="rounded"
                                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/80x80?text=Product';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-grow-1 me-3">
                                            <h6 className="mb-1">{item.product ? item.product.name : item.name}</h6>
                                            <p className="text-muted small mb-0">{item.product ? item.product.category : item.category}</p>
                                            <span className="fw-bold text-success">₹{item.product ? item.product.price : item.price}</span>
                                        </div>
                                        <div className="d-flex align-items-center me-3">
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => updateQuantity(item.product?._id || item._id, Math.max(0, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                            >
                                                <FaMinus />
                                            </button>
                                            <span className="mx-3 fw-bold">{item.quantity}</span>
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => updateQuantity(item.product?._id || item._id, item.quantity + 1)}
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                        <div className="text-end me-3">
                                            <span className="fw-bold">₹{(item.product ? item.product.price : item.price) * item.quantity}</span>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeItem(item.product?._id || item._id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card shadow-sm">
                            <div className="card-header">
                                <h5 className="mb-0">Order Summary</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal ({calculateItemsCount()} items):</span>
                                    <span className="fw-bold">₹{calculateTotal()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Shipping:</span>
                                    <span className="text-success">Free</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="fw-bold">Total:</span>
                                    <span className="fw-bold fs-5 text-success">₹{calculateTotal()}</span>
                                </div>
                                <button className="btn btn-success w-100" disabled>
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart; 