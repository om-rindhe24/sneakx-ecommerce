import React from 'react';
import { ProductCard } from './ProductCard';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProductGrid = ({ products = [], loading = false, emptyMessage = "No sneakers match your selected filters.", onResetFilters = null }) => {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            padding: '16px'
          }}>
            <div className="skeleton" style={{ width: '100%', aspectRatio: '4/3', marginBottom: '14px' }} />
            <div className="skeleton" style={{ width: '40%', height: '14px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '80%', height: '18px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ width: '30%', height: '20px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '64px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        width: '100%'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)'
        }}>
          <ShoppingBag size={28} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>No Grails Found</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '380px' }}>{emptyMessage}</p>
        </div>
        {onResetFilters ? (
          <button onClick={onResetFilters} className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
            Reset Filters & Explore
          </button>
        ) : (
          <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
            Reset Filters & Explore
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
