import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ items: [], totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist({ items: [], totalItems: 0 });
      return;
    }
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      setWishlist(data || { items: [], totalItems: 0 });
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to save items to your wishlist.');
    }
    const updated = await wishlistService.toggle(productId);
    setWishlist(updated);
    return updated;
  };

  const isInWishlist = (productId) => {
    if (!wishlist.items) return false;
    return wishlist.items.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
