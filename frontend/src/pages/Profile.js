import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

function Profile({ isLoggedIn }) {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        fetchUserData();
        fetchOrders();
    }, [isLoggedIn, navigate]);

    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/session', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setEditForm({
                    name: data.user.name || '',
                    email: data.user.email || '',
                    phone: data.user.phone || '',
                    address: data.user.address || ''
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
        });
    };

    const handleSave = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editForm)
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setEditing(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
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

    if (!user) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <h4 className="text-muted">User not found</h4>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Profile Information</h4>
                            {!editing && (
                                <button className="btn btn-outline-primary btn-sm" onClick={handleEdit}>
                                    <FaEdit className="me-2" />
                                    Edit Profile
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {editing ? (
                                <form>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editForm.address}
                                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-success" onClick={handleSave}>
                                            <FaSave className="me-2" />
                                            Save Changes
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                            <FaTimes className="me-2" />
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaUser className="me-3 text-muted" />
                                            <div>
                                                <small className="text-muted">Name</small>
                                                <div className="fw-bold">{user.name || 'Not provided'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaEnvelope className="me-3 text-muted" />
                                            <div>
                                                <small className="text-muted">Email</small>
                                                <div className="fw-bold">{user.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaPhone className="me-3 text-muted" />
                                            <div>
                                                <small className="text-muted">Phone</small>
                                                <div className="fw-bold">{user.phone || 'Not provided'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaMapMarkerAlt className="me-3 text-muted" />
                                            <div>
                                                <small className="text-muted">Address</small>
                                                <div className="fw-bold">{user.address || 'Not provided'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h5 className="mb-0">Recent Orders</h5>
                        </div>
                        <div className="card-body">
                            {orders.length === 0 ? (
                                <p className="text-muted text-center">No orders yet</p>
                            ) : (
                                orders.slice(0, 5).map((order) => (
                                    <div key={order._id} className="border-bottom pb-2 mb-2">
                                        <div className="d-flex justify-content-between">
                                            <small className="text-muted">Order #{order._id.slice(-6)}</small>
                                            <small className="fw-bold">₹{order.total || 0}</small>
                                        </div>
                                        <small className="text-muted">{order.status || 'pending'}</small>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile; 