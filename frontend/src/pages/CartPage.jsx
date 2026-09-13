import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartPage = () => {
  const { cart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(cart.subtotal || 0);

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(cart.total || 0);

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          color: 'var(--text-muted)'
        }}>
          <ShoppingBag size={32} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Your Shopping Bag is Empty</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Explore authenticated silhouettes and add your size.
        </p>
        <Link to="/products" className="btn btn-primary">
          Explore Collection <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '32px' }}>
        Shopping Bag ({cart.totalItems})
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        alignItems: 'flex-start'
      }}>
        {/* Line Items List */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {cart.items.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
              alignItems: 'center'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#F4F3F0',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                flexShrink: 0,
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>

              <div style={{ flex: 1 }}>
                <span className="badge badge-volt" style={{ fontSize: '10px', marginBottom: '4px' }}>{item.brandName}</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.productName}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Size: <strong>US {item.size}</strong> • {item.colorway}
                </p>
                <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  ₹{item.unitPrice.toLocaleString('en-IN')}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', fontWeight: 600, padding: '0 8px', color: 'var(--text-primary)' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Order Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items Subtotal</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>{formattedSubtotal}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estimated Shipping</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', color: cart.shipping === 0 ? 'var(--status-success)' : 'var(--text-primary)', fontWeight: 600 }}>
                {cart.shipping === 0 ? 'FREE' : `₹${cart.shipping}`}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <span>Total</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--accent-primary)' }}>{formattedTotal}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            Checkout Securely <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
