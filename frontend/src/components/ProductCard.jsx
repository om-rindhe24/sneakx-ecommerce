import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const bookmarked = isInWishlist(product.id);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id).catch((err) => alert(err.message));
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Pick first in-stock variant, or default first variant
    const variant = product.variants?.find(v => v.stockQuantity > 0) || product.variants?.[0];
    if (!variant) {
      navigate(`/products/${product.id}`);
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(variant.id, 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.basePrice || 0);

  // Neutral dark fallback sneaker SVG
  const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%231B1D25'%3E%3Crect width='400' height='300' fill='%2314161E'/%3E%3Cpath d='M80 200c40-30 110-35 150-30 20-30 50-60 90-60 15 0 25 10 25 25v15c-15 15-40 25-60 25l-205 25z' fill='%23222532'/%3E%3Ctext x='200' y='250' font-family='sans-serif' font-size='13' fill='%23656875' text-anchor='middle'%3ESneakX Vault Silhouette%3C/text%3E%3C/svg%3E";

  const sizeSummary = product.variants && product.variants.length > 0
    ? product.variants.slice(0, 4).map(v => `UK ${v.size}`).join(' · ')
    : 'UK 7 · 8 · 9 · 10';

  return (
    <div className="product-card-modern">
      {/* Top Floating Controls */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            backgroundColor: 'rgba(11, 12, 14, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-medium)',
            color: '#FFFFFF',
            fontSize: '10px',
            fontFamily: 'var(--font-family-display)',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            {product.brandName}
          </span>
          {product.gender && (
            <span style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              fontSize: '10px',
              fontWeight: 600,
              padding: '3px 6px',
              borderRadius: 'var(--radius-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {product.gender}
            </span>
          )}
        </div>

        <button
          onClick={handleWishlistClick}
          aria-label={bookmarked ? "Remove from wishlist" : "Add to wishlist"}
          className="wishlist-btn-animated touch-target"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(18, 20, 26, 0.88)',
            backdropFilter: 'blur(8px)',
            border: bookmarked ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: bookmarked ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-subtle)',
            transition: 'all 180ms ease'
          }}
        >
          <Heart size={15} fill={bookmarked ? 'var(--accent-primary)' : 'none'} color={bookmarked ? 'var(--accent-primary)' : 'currentColor'} />
        </button>
      </div>

      {/* Sneaker Image Stage */}
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="product-image-wrap">
          {!imageLoaded && !imageError && (
            <div className="skeleton" style={{ position: 'absolute', inset: '16px', borderRadius: 'var(--radius-md)' }} />
          )}
          <img
            src={imageError ? fallbackImg : (product.primaryImageUrl || fallbackImg)}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            className="product-image"
          />

          {/* Hover-reveal "Quick Add to Cart" Button */}
          <button
            onClick={handleQuickAdd}
            disabled={addingToCart}
            aria-label="Quick add to bag"
            className="quick-add-btn"
            title="Quick Add to Bag"
          >
            <ShoppingBag size={17} />
          </button>

          {/* Quick Size Preview Bar on Hover */}
          <div className="quick-size-bar">
            <span>Sizes: {sizeSummary}</span>
            <ArrowUpRight size={13} style={{ marginLeft: 'auto', color: 'var(--accent-primary)' }} />
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--accent-primary)',
              display: 'block',
              marginBottom: '3px'
            }}>
              {product.brandName}
            </span>
            <h3 style={{
              fontSize: '15px',
              fontFamily: 'var(--font-family-display)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.3,
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {product.name}
            </h3>
            <p style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {product.colorway || 'Official Release Colorway'}
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '12px',
            marginTop: '2px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                Retail
              </span>
              <span style={{
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                letterSpacing: '-0.02em'
              }}>
                {formattedPrice}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              <Star size={11} fill="#F59E0B" color="#F59E0B" />
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{product.averageRating || '4.9'}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
