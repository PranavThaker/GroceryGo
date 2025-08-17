import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminRoute({ children, isLoggedIn }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        checkAdminStatus();
    }, [isLoggedIn, navigate]);

    const checkAdminStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/session', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.user && data.user.isAdmin) {
                    setIsAdmin(true);
                } else {
                    navigate('/');
                }
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            navigate('/login');
        } finally {
            setLoading(false);
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

    return isAdmin ? children : null;
}

export default AdminRoute; 