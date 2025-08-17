import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";

function QuickPicks({ isLoggedIn, updateCartCount }) {
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRandomProducts();
        if (isLoggedIn) {
            fetchCartItems();
        }
    }, [isLoggedIn]);

    const fetchRandomProducts = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/products");
            if (response.ok) {
                const allProducts = await response.json();
                const productsArray = Array.isArray(allProducts) ? allProducts : [];
                const shuffled = productsArray.sort(() => 0.5 - Math.random());
                setProducts(shuffled.slice(0, 4));
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCartItems = async () => {
        if (!isLoggedIn) return;

        try {
            const response = await fetch("http://localhost:5000/api/cart", {
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                setCartItems(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    };

    const addToCart = async (product) => {
        if (!isLoggedIn) {
            alert("Please login to add items to cart");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    productId: product._id,
                    quantity: 1
                })
            });

            if (response.ok) {
                alert("Product added to cart successfully!");
                fetchCartItems();
                if (updateCartCount) updateCartCount();
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to add product to cart");
            }
        } catch (error) {
            console.error("Error adding to cart from QuickPicks:", error);
            alert("Error adding product to cart. Please try again.");
        }
    };

    const updateCartQuantity = async (productId, newQuantity) => {
        if (!isLoggedIn) return;

        try {
            const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (response.ok) {
                fetchCartItems();
                if (updateCartCount) updateCartCount();
            }
        } catch (error) {
            console.error("Error updating cart quantity:", error);
        }
    };

    const getCartItemQuantity = (productId) => {
        const cartItem = cartItems.find(item =>
            (item.product && item.product._id === productId) || item._id === productId
        );
        return cartItem ? cartItem.quantity : 0;
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
        <section className="quick-picks py-5">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h2 className="text-center mb-4">Quick Picks</h2>
                        <p className="text-center text-muted mb-5">
                            Discover our handpicked favorites for you
                        </p>
                    </div>
                </div>
                <div className="row">
                    {products.map((product) => (
                        <div key={product._id} className="col-md-6 col-lg-3 mb-4">
                            <div className="card h-100 product-card">
                                <div className="position-relative">
                                    <img
                                        src={product.image ? `/${product.image}.png` : "https://via.placeholder.com/300x200?text=Product"}
                                        className="card-img-top product-image"
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/300x200?text=Product";
                                        }}
                                    />
                                </div>
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="card-text text-muted">{product.description}</p>
                                    <div className="mt-auto">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold text-success">₹{product.price}</span>
                                        </div>
                                        {(() => {
                                            const quantity = getCartItemQuantity(product._id);
                                            if (quantity > 0) {
                                                return (
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => updateCartQuantity(product._id, Math.max(0, quantity - 1))}
                                                        >
                                                            <FaMinus />
                                                        </button>
                                                        <span className="fw-bold">{quantity}</span>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => updateCartQuantity(product._id, quantity + 1)}
                                                        >
                                                            <FaPlus />
                                                        </button>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <button
                                                        className="btn btn-success w-100"
                                                        onClick={() => addToCart(product)}
                                                    >
                                                        <FaShoppingCart className="me-2" />
                                                        Add to Cart
                                                    </button>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default QuickPicks;
