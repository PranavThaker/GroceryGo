import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import defaultProfile from "../assets/profile_icon.png";
import { assets } from "../assets/assets";

function Navbar({ isLoggedIn, cartCount = 0, totalCost = 0 }) {
    const navigate = useNavigate();
    const [animateCart, setAnimateCart] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (cartCount > 0) {
            setAnimateCart(true);
            const t = setTimeout(() => setAnimateCart(false), 500);
            return () => clearTimeout(t);
        }
    }, [cartCount]);

    useEffect(() => {
        import("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            checkAdminStatus();
        }
    }, [isLoggedIn]);

    const checkAdminStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/session', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setIsAdmin(data.user?.isAdmin || false);
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    const collapseId = "appNavbar";

    const handleCartClick = () => {
        if (isLoggedIn) {
            navigate("/cart");
        } else {
            navigate("/login");
        }
    };

    const handleLogout = () => {
        fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        }).then(() => {
            localStorage.setItem('isLoggedIn', 'false');
            window.location.reload();
        });
    };

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid px-3">
                <NavLink to="/" className="d-flex align-items-center me-3">
                    <img
                        src={logo}
                        alt="Logo"
                        className="navbar-logo"
                        style={{ width: 85, height: 75 }}
                    />
                </NavLink>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#${collapseId}`}
                    aria-controls={collapseId}
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id={collapseId}>
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <NavLink
                                to="/"
                                end
                                className={({ isActive }) =>
                                    "nav-link" + (isActive ? " active fw-bold text-success" : "")
                                }
                            >
                                Home
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/products"
                                className={({ isActive }) =>
                                    "nav-link" + (isActive ? " active fw-bold text-success" : "")
                                }
                            >
                                Products
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/about"
                                end
                                className={({ isActive }) =>
                                    "nav-link" + (isActive ? " active fw-bold text-success" : "")
                                }
                            >
                                About
                            </NavLink>
                        </li>
                        {isAdmin && (
                            <li className="nav-item">
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) =>
                                        "nav-link" + (isActive ? " active fw-bold text-danger" : "")
                                    }
                                >
                                    Admin Panel
                                </NavLink>
                            </li>
                        )}
                    </ul>
                    <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 mt-3 mt-lg-0">
                        <button
                            className={`btn ${cartCount > 0 ? 'btn-success' : 'btn-outline-success'} position-relative me-3 ${animateCart ? 'cart-vibrate' : ''}`}
                            onClick={handleCartClick}
                        >
                            {cartCount > 0 && isLoggedIn ? (
                                <div className="d-flex align-items-center gap-2">
                                    <img
                                        src={assets.cart_icon}
                                        alt="Cart"
                                        className="img-fluid"
                                        height={25}
                                        width={25}
                                    />
                                    <div className="d-flex flex-column text-start">
                                        <span className="fw-bold" style={{ fontSize: "0.61rem" }}>
                                            {cartCount} Items
                                        </span>
                                        <span className="fw-bold" style={{ fontSize: "0.61rem" }}>
                                            ₹{totalCost}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center gap-2">
                                    <img
                                        src={assets.cart_icon}
                                        alt="Cart"
                                        height={25}
                                        width={25}
                                    />
                                    <span className="flex-column text-start" style={{ fontSize: "0.61rem" }}>My Cart</span>
                                </div>
                            )}
                        </button>
                        {isLoggedIn ? (
                            <div className="d-flex align-items-center gap-2">
                                <NavLink to="/profile">
                                    <img
                                        src={defaultProfile}
                                        alt="User Profile"
                                        className="rounded-circle"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            objectFit: "cover",
                                            border: "2px solid #0d6efd"
                                        }}
                                    />
                                </NavLink>
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <NavLink to="/login" className="btn btn-outline-primary">
                                Login
                            </NavLink>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;