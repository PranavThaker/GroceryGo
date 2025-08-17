import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaBox, FaShoppingCart, FaChartBar } from 'react-icons/fa';

function Admin({ isLoggedIn }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [isLoggedIn, navigate]);

    const fetchData = async () => {
        try {
            const [productsRes, usersRes, ordersRes] = await Promise.all([
                fetch('http://localhost:5000/api/products'),
                fetch('http://localhost:5000/api/admin/users', { credentials: 'include' }),
                fetch('http://localhost:5000/api/admin/orders', { credentials: 'include' })
            ]);

            if (productsRes.ok) {
                const productsData = await productsRes.json();
                setProducts(Array.isArray(productsData) ? productsData : []);
            }
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(Array.isArray(usersData) ? usersData : (usersData.users || []));
            }
            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(Array.isArray(ordersData) ? ordersData : (ordersData.orders || []));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingProduct
                ? `http://localhost:5000/api/products/${editingProduct._id}`
                : 'http://localhost:5000/api/products';

            const method = editingProduct ? 'PUT' : 'POST';

            // For editing, only include image if it's changed
            const formData = { ...productForm };
            if (editingProduct && !formData.image) {
                delete formData.image; // Remove image field if not provided during edit
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowProductModal(false);
                setEditingProduct(null);
                setProductForm({ name: '', description: '', price: '', category: '', stock: '', image: '' });
                fetchData();
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            image: product.image || ''
        });
        setShowProductModal(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (response.ok) {
                    fetchData();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const calculateStats = () => {
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = orders.length;
        const totalUsers = users.length;
        const totalProducts = products.length;

        return { totalRevenue, totalOrders, totalUsers, totalProducts };
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

    const stats = calculateStats();

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-md-3">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h5 className="mb-0">Admin Panel</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="list-group list-group-flush">
                                <button
                                    className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('dashboard')}
                                >
                                    <FaChartBar className="me-2" />
                                    Dashboard
                                </button>
                                <button
                                    className={`list-group-item list-group-item-action ${activeTab === 'products' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('products')}
                                >
                                    <FaBox className="me-2" />
                                    Products
                                </button>
                                <button
                                    className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('users')}
                                >
                                    <FaUsers className="me-2" />
                                    Users
                                </button>
                                <button
                                    className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('orders')}
                                >
                                    <FaShoppingCart className="me-2" />
                                    Orders
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-9">
                    {activeTab === 'dashboard' && (
                        <div>
                            <h3 className="mb-4">Dashboard Overview</h3>
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <div className="card bg-primary text-white">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <h4 className="mb-0">₹{stats.totalRevenue}</h4>
                                                    <small>Total Revenue</small>
                                                </div>
                                                <FaChartBar size={30} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="card bg-success text-white">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <h4 className="mb-0">{stats.totalOrders}</h4>
                                                    <small>Total Orders</small>
                                                </div>
                                                <FaShoppingCart size={30} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="card bg-info text-white">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <h4 className="mb-0">{stats.totalUsers}</h4>
                                                    <small>Total Users</small>
                                                </div>
                                                <FaUsers size={30} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="card bg-warning text-white">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <h4 className="mb-0">{stats.totalProducts}</h4>
                                                    <small>Total Products</small>
                                                </div>
                                                <FaBox size={30} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row mt-4">
                                <div className="col-md-6">
                                    <div className="card shadow-sm">
                                        <div className="card-header">
                                            <h6 className="mb-0">Recent Orders</h6>
                                        </div>
                                        <div className="card-body">
                                            {orders.slice(0, 5).map((order) => (
                                                <div key={order._id} className="d-flex justify-content-between align-items-center mb-2">
                                                    <div>
                                                        <small className="text-muted">Order #{order._id.slice(-6)}</small>
                                                        <br />
                                                        <small>₹{order.total || 0}</small>
                                                    </div>
                                                    <span className={`badge bg-${order.status === 'delivered' ? 'success' : 'warning'}`}>
                                                        {order.status || 'pending'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card shadow-sm">
                                        <div className="card-header">
                                            <h6 className="mb-0">Low Stock Products</h6>
                                        </div>
                                        <div className="card-body">
                                            {products.filter(p => p.stock < 10).slice(0, 5).map((product) => (
                                                <div key={product._id} className="d-flex justify-content-between align-items-center mb-2">
                                                    <span>{product.name}</span>
                                                    <span className="badge bg-danger">{product.stock} left</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3>Product Management</h3>
                                <button
                                    className="btn btn-success"
                                    onClick={() => {
                                        setEditingProduct(null);
                                        setProductForm({ name: '', description: '', price: '', category: '', stock: '', image: '' });
                                        setShowProductModal(true);
                                    }}
                                >
                                    <FaPlus /> Add Product
                                </button>
                            </div>
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Image</th>
                                                    <th>Name</th>
                                                    <th>Category</th>
                                                    <th>Price</th>
                                                    <th>Stock</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map((product) => (
                                                    <tr key={product._id}>
                                                        <td>
                                                            <img
                                                                src={product.image ? `/${product.image}.png` : 'https://via.placeholder.com/50x50?text=Product'}
                                                                alt={product.name}
                                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                className="rounded"
                                                                onError={(e) => {
                                                                    e.target.src = 'https://via.placeholder.com/50x50?text=Product';
                                                                }}
                                                            />
                                                        </td>
                                                        <td>{product.name}</td>
                                                        <td>{product.category}</td>
                                                        <td>₹{product.price}</td>
                                                        <td>
                                                            <span className={`badge bg-${product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}`}>
                                                                {product.stock}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary me-2"
                                                                onClick={() => handleEditProduct(product)}
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteProduct(product._id)}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div>
                            <h3 className="mb-4">User Management</h3>
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Role</th>
                                                    <th>Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((user) => (
                                                    <tr key={user._id}>
                                                        <td>{user.name}</td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            <span className={`badge bg-${user.isAdmin ? 'danger' : 'success'}`}>
                                                                {user.isAdmin ? 'Admin' : 'User'}
                                                            </span>
                                                        </td>
                                                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div>
                            <h3 className="mb-4">Order Management</h3>
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Customer</th>
                                                    <th>Total</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map((order) => (
                                                    <tr key={order._id}>
                                                        <td>#{order._id.slice(-6)}</td>
                                                        <td>{order.user?.name || 'Unknown'}</td>
                                                        <td>₹{order.total || 0}</td>
                                                        <td>
                                                            <span className={`badge bg-${order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'info' : 'warning'}`}>
                                                                {order.status || 'pending'}
                                                            </span>
                                                        </td>
                                                        <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Modal */}
            {showProductModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowProductModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleProductSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Product Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={productForm.name}
                                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={productForm.description}
                                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Price (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={productForm.price}
                                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Stock</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={productForm.stock}
                                                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Category</label>
                                        <select
                                            className="form-select"
                                            value={productForm.category}
                                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Fruits">Fruits</option>
                                            <option value="Vegetables">Vegetables</option>
                                            <option value="Dairy">Dairy</option>
                                            <option value="Bakery">Bakery</option>
                                            <option value="Beverages">Beverages</option>
                                            <option value="Snacks">Snacks</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Image URL {!editingProduct && '(Required)'}</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            value={productForm.image}
                                            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                            required={!editingProduct}
                                        />
                                        {editingProduct && (
                                            <small className="text-muted">Leave empty to keep current image</small>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowProductModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success">
                                        {editingProduct ? 'Update Product' : 'Add Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Backdrop */}
            {showProductModal && (
                <div className="modal-backdrop fade show"></div>
            )}
        </div>
    );
}

export default Admin; 