import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { recommendationService } from '../services/recommendationService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { SizeSelector } from '../components/SizeSelector';
import { SizeAdvisorModal } from '../components/SizeAdvisorModal';
import { ReviewModal } from '../components/ReviewModal';
import { ProductGrid } from '../components/ProductGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Heart, ShoppingBag, Star, Ruler, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [sizeAdvisorOpen, setSizeAdvisorOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
        setActiveImage(data.primaryImageUrl);

        // Pre-select first in-stock variant
        if (data.variants && data.variants.length > 0) {
          const firstInStock = data.variants.find((v) => v.stockQuantity > 0) || data.variants[0];
          setSelectedVariant(firstInStock);
        }

        // Fetch similar recommendations
        const similar = await recommendationService.getSimilar(id, 4);
        setSimilarProducts(similar || []);
      } catch (err) {
        console.error('Failed to load sneaker details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert('Please select a shoe size.');
      return;
    }
    if (selectedVariant.stockQuantity <= 0) {
      alert('This size is currently sold out.');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(selectedVariant.id, 1);
      setToastMessage(`Added size US ${selectedVariant.size} to your bag!`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to add item to bag.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleApplyRecommendedSize = (recSize) => {
    if (product && product.variants) {
      const match = product.variants.find((v) => parseFloat(v.size) === parseFloat(recSize));
      if (match) {
        setSelectedVariant(match);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching sneaker specs & inventory..." />;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Sneaker Not Found</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Catalogue</Link>
      </div>
    );
  }

  const effectivePrice = selectedVariant
    ? selectedVariant.effectivePrice
    : product.basePrice;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(effectivePrice);

  const bookmarked = isInWishlist(product.id);

  // Fallback sneaker SVG placeholder if remote image ever fails
  const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%231E222A'%3E%3Crect width='400' height='300' fill='%2315181E'/%3E%3Cpath d='M80 200c40-30 110-35 150-30 20-30 50-60 90-60 15 0 25 10 25 25v15c-15 15-40 25-60 25l-205 25z' fill='%23282D37'/%3E%3Ctext x='200' y='250' font-family='sans-serif' font-size='14' fill='%2364748B' text-anchor='middle'%3ESneakX Vault Silhouette%3C/text%3E%3C/svg%3E";

  return (
    <div className="container" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '64px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--accent-volt)',
          color: 'var(--accent-volt-text)',
          fontWeight: 700,
          fontSize: '13px',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-modal)',
          zIndex: 1100
        }}>
          ✓ {toastMessage}
        </div>
      )}

      {/* Main Product Hero Layout */}
      <div className="product-detail-grid">
        {/* Left: Interactive Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, width: '100%' }}>
          <div style={{
            width: '100%',
            aspectRatio: '1 / 1',
            backgroundColor: '#161820',
            borderRadius: 'var(--radius-card, 12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(14px, 4vw, 36px)'
          }}>
            <img
              src={activeImage || product.primaryImageUrl}
              alt={product.name}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImg; }}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-md)',
                    border: activeImage === img.imageUrl ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={img.imageUrl}
                    alt="Thumbnail"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImg; }}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Sneaker Specs & Purchasing Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span className="badge badge-volt">{product.brandName}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{product.gender}'s Footwear</span>
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              marginBottom: '6px'
            }}>
              {product.name}
            </h1>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Colorway: <strong>{product.colorway}</strong>
            </p>
          </div>

          {/* Pricing & Rating Summary */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}>
              {formattedPrice}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', color: '#F59E0B' }}>
                <Star size={16} fill="#F59E0B" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{product.averageRating}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({product.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Sizing Section & AI Fit Advisor Trigger */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-card, 12px)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: 'clamp(16px, 3.5vw, 24px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Footwear Sizing</span>
              <button
                onClick={() => setSizeAdvisorOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  cursor: 'pointer'
                }}
              >
                <Ruler size={14} /> Find Your Size (AI Sizing Advisor)
              </button>
            </div>

            <SizeSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />
          </div>

          {/* Action Buttons: Add to Bag & Wishlist */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || !selectedVariant || selectedVariant.stockQuantity <= 0}
              className="btn btn-primary btn-lg touch-target"
              style={{ flex: 1, minHeight: '52px', fontWeight: 700, fontSize: '15px' }}
            >
              <ShoppingBag size={20} />
              {selectedVariant?.stockQuantity <= 0
                ? 'Sold Out in this Size'
                : addingToCart
                  ? 'Reserving Stock...'
                  : 'Add to Bag'}
            </button>

            <button
              onClick={() => toggleWishlist(product.id).catch((err) => alert(err.message))}
              className="btn btn-secondary btn-lg touch-target"
              style={{
                width: '52px',
                minWidth: '52px',
                height: '52px',
                minHeight: '52px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: bookmarked ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}
              aria-label="Toggle Wishlist"
            >
              <Heart size={20} fill={bookmarked ? 'var(--accent-primary)' : 'none'} />
            </button>
          </div>

          {/* Assurance Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="var(--status-success)" />
              <span>100% Authentic</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} color="var(--status-info)" />
              <span>Fast Shipping</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={16} color="var(--status-warning)" />
              <span>Easy Size Swap</span>
            </div>
          </div>

          {/* Story & Description */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Silhouette Story
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-card, 12px)',
        boxShadow: 'var(--shadow-card)',
        padding: '36px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Customer Reviews</h2>
            <p style={{ fontSize: '13px', color: '#A0A0A0', marginTop: '4px' }}>
              Verified authentic purchases and sizing feedback from the community
            </p>
          </div>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="btn btn-outline btn-sm"
          >
            Write a Review
          </button>
        </div>

        {product.reviews && product.reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {product.reviews.map((rev) => (
              <div key={rev.id} style={{
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>{rev.userName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>Verified Buyer</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', color: '#F59E0B' }}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={13} fill="#F59E0B" />
                    ))}
                  </div>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                  {rev.title}
                </h4>
                <p style={{ fontSize: '13px', color: '#A0A0A0', lineHeight: 1.6 }}>
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: '#A0A0A0', textAlign: 'center', padding: '32px 0' }}>
            No reviews yet. Be the first verified collector to review this silhouette!
          </p>
        )}
      </section>

      {/* Recommendations Carousel */}
      {similarProducts.length > 0 && (
        <section>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Explainable Affinity Logic
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              You Might Also Like
            </h2>
          </div>
          <ProductGrid products={similarProducts} />
        </section>
      )}

      {/* Sizing Advisor Modal */}
      <SizeAdvisorModal
        isOpen={sizeAdvisorOpen}
        onClose={() => setSizeAdvisorOpen(false)}
        targetProduct={product}
        onApplySize={handleApplyRecommendedSize}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        productId={product.id}
        onReviewAdded={(newRev) => {
          setProduct((prev) => ({
            ...prev,
            reviews: [newRev, ...(prev.reviews || [])],
            reviewCount: (prev.reviewCount || 0) + 1
          }));
        }}
      />
    </div>
  );
};
