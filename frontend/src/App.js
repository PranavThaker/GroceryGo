import './App.css';
import MyNavbar from './components/MyNavbar';
import Home from './pages/Home';
import { Route, Routes } from 'react-router-dom';
import Products from './pages/Products';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminRoute from './components/AdminRoute';
import { useEffect, useState } from 'react'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn)
  }, [isLoggedIn])

  const [cartCount, setCartCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Fetch cart data when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartData();
    } else {
      setCartCount(0);
      setTotalCost(0);
    }
  }, [isLoggedIn]);

  const fetchCartData = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        credentials: 'include'
      });
      if (response.ok) {
        const cartItems = await response.json();
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cartItems.reduce((sum, item) => {
          const price = item.product ? item.product.price : item.price;
          return sum + (price * item.quantity);
        }, 0);

        setCartCount(totalItems);
        setTotalCost(totalPrice);
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  function updateCartCount() {
    fetchCartData();
  }

  return (
    <>
      <MyNavbar isLoggedIn={isLoggedIn} cartCount={cartCount} totalCost={totalCost} />

      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} updateCartCount={updateCartCount} />} />
        <Route path="/products" element={<Products isLoggedIn={isLoggedIn} updateCartCount={updateCartCount} />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart isLoggedIn={isLoggedIn} updateCartCount={updateCartCount} />} />
        <Route path="/profile" element={<Profile isLoggedIn={isLoggedIn} />} />
        <Route path="/admin" element={
          <AdminRoute isLoggedIn={isLoggedIn}>
            <Admin isLoggedIn={isLoggedIn} />
          </AdminRoute>
        } />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;
