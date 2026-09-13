import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';

import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminUsersPage } from './pages/AdminUsersPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            <main>
              <Routes>
                {/* Public Customer Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<CatalogPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Authenticated Customer Routes */}
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-confirmation/:orderNumber"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminProductsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <CartDrawer />
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
