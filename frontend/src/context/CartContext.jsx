import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0, shipping: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalItems: 0, subtotal: 0, shipping: 0, total: 0 });
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data || { items: [], totalItems: 0, subtotal: 0, shipping: 0, total: 0 });
    } catch {
      // Ignored if user not logged in
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (variantId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to add sneakers to your bag.');
    }
    const updated = await cartService.addItem(variantId, quantity);
    setCart(updated);
    setIsDrawerOpen(true); // Open drawer for instant feedback
    return updated;
  };

  const updateQuantity = async (itemId, quantity) => {
    const updated = await cartService.updateQuantity(itemId, quantity);
    setCart(updated);
    return updated;
  };

  const removeItem = async (itemId) => {
    const updated = await cartService.removeItem(itemId);
    setCart(updated);
    return updated;
  };

  const clearCart = async () => {
    await cartService.clearCart();
    setCart({ items: [], totalItems: 0, subtotal: 0, shipping: 0, total: 0 });
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      isDrawerOpen,
      setIsDrawerOpen,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
