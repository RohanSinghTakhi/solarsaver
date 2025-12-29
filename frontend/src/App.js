import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'sonner';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CalculatorPage from './pages/CalculatorPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VendorRegisterPage from './pages/VendorRegisterPage';
import UserDashboard from './pages/UserDashboard';
import VendorDashboard from './pages/VendorDashboard';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import ComparePage from './pages/ComparePage';
import BlogPage from './pages/BlogPage';
import VendorProducts from './pages/VendorProducts';
import VendorOrders from './pages/VendorOrders';
import VendorProfile from './pages/VendorProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminVendors from './pages/AdminVendors';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';
import AdminTickets from './pages/AdminTickets';
import AdminBlogs from './pages/AdminBlogs';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';

import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
export const API = BACKEND_URL;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Cart Context
const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

// Wishlist Context
const WishlistContext = createContext(null);

export const useWishlist = () => useContext(WishlistContext);

// Compare Context
const CompareContext = createContext(null);

export const useCompare = () => useContext(CompareContext);

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/api/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await axios.post(`${API}/api/auth/register`, { name, email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Cart Provider
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Wishlist Provider
const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearWishlist = () => setWishlist([]);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{
      wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, wishlistCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Compare Provider
const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    const saved = localStorage.getItem('compare');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('compare', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (product) => {
    setCompareList(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev;
      }
      if (prev.length >= 4) {
        return prev; // Max 4 items
      }
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId) => {
    setCompareList(prev => prev.filter(item => item.id !== productId));
  };

  const isInCompare = (productId) => {
    return compareList.some(item => item.id === productId);
  };

  const clearCompare = () => setCompareList([]);

  const compareCount = compareList.length;

  return (
    <CompareContext.Provider value={{
      compareList, addToCompare, removeFromCompare, isInCompare, clearCompare, compareCount
    }}>
      {children}
    </CompareContext.Provider>
  );
};

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
};

function App() {
  // Seed database on first load
  useEffect(() => {
    const seedDatabase = async () => {
      try {
        await axios.post(`${API}/api/seed`);
      } catch (error) {
        // Already seeded or error - ignore
      }
    };
    seedDatabase();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <HashRouter>
              <Toaster position="top-right" richColors />
              <Routes>
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/shop" element={<Layout><ShopPage /></Layout>} />
                <Route path="/shop/:category" element={<Layout><ShopPage /></Layout>} />
                <Route path="/product/:id" element={<Layout><ProductPage /></Layout>} />
                <Route path="/calculator" element={<Layout><CalculatorPage /></Layout>} />
                <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
                <Route path="/login" element={<Layout><LoginPage /></Layout>} />
                <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
                <Route path="/vendor/register" element={<Layout><VendorRegisterPage /></Layout>} />
                <Route path="/cart" element={<Layout><CartPage /></Layout>} />
                <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
                <Route path="/compare" element={<Layout><ComparePage /></Layout>} />
                <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Layout><CheckoutPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <Layout><UserDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/vendor/dashboard" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/vendor/products" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                    <VendorProducts />
                  </ProtectedRoute>
                } />
                <Route path="/vendor/orders" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                    <VendorOrders />
                  </ProtectedRoute>
                } />
                <Route path="/vendor/profile" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                    <VendorProfile />
                  </ProtectedRoute>
                } />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/vendors" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminVendors />
                  </ProtectedRoute>
                } />
                <Route path="/admin/products" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminProducts />
                  </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminOrders />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                <Route path="/admin/tickets" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminTickets />
                  </ProtectedRoute>
                } />
                <Route path="/admin/blogs" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminBlogs />
                  </ProtectedRoute>
                } />
              </Routes>
            </HashRouter>
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
