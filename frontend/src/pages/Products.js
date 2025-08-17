import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";

function Products({ isLoggedIn, updateCartCount }) {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortBy, setSortBy] = useState("name");

    useEffect(() => {
        fetchProducts();
        if (isLoggedIn) {
            fetchCartItems();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        } else {
            setSelectedCategory("");
        }
    }, [searchParams]);

    const fetchProducts = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/products");
            if (response.ok) {
                const data = await response.json();
                setProducts(Array.isArray(data) ? data : []);
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
            console.error("Error adding to cart:", error);
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

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case "name":
                return a.name.localeCompare(b.name);
            case "price-low":
                return a.price - b.price;
            case "price-high":
                return b.price - a.price;
            case "category":
                return a.category.localeCompare(b.category);
            default:
                return 0;
        }
    });

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

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
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => {
                            const newCategory = e.target.value;
                            setSelectedCategory(newCategory);
                            const newUrl = newCategory
                                ? `/products?category=${encodeURIComponent(newCategory)}`
                                : '/products';
                            window.history.pushState({}, '', newUrl);
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="name">Sort by Name</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="category">Sort by Category</option>
                    </select>
                </div>
            </div>

            <div className="row">
                {sortedProducts.map((product) => (
                    <div key={product._id} className="col-md-4 col-lg-3 mb-4">
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

            {sortedProducts.length === 0 && (
                <div className="text-center mt-5">
                    <h4 className="text-muted">No products found</h4>
                    <p className="text-muted">Try adjusting your search or filter criteria</p>
                </div>
            )}
        </div>
    );
}

export default Products;