import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { ProductGrid } from '../components/ProductGrid';
import { Heart } from 'lucide-react';

export const WishlistPage = () => {
  const { wishlist, loading } = useWishlist();

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Heart size={28} color="var(--accent-primary)" fill="var(--accent-primary)" />
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Saved Grails
        </h1>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '36px' }}>
        {wishlist?.totalItems || 0} sneakers bookmarked for quick access
      </p>

      <ProductGrid
        products={wishlist?.items || []}
        loading={loading}
        emptyMessage="Your wishlist is empty. Tap the heart on any sneaker to bookmark it."
      />
    </div>
  );
};
