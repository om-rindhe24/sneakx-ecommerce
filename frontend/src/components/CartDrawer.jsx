import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export const CartDrawer = () => {
  const { cart, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    navigate('/checkout');
  };

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

  const freeShippingThreshold = 5000;
  const subtotalVal = cart.subtotal || 0;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotalVal);
  const progressPercent = Math.min(100, Math.round((subtotalVal / freeShippingThreshold) * 100));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        transition: 'opacity 200ms ease'
      }}
      onClick={() => setIsDrawerOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag Drawer"
    >
      <div
        className="cart-drawer-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Your Bag
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="touch-target"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--border-medium)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {cart.items && cart.items.length > 0 && (
          <div style={{
            padding: '12px 24px',
            backgroundColor: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: amountForFreeShipping === 0 ? 'var(--status-success)' : 'var(--text-secondary)', fontWeight: 600 }}>
                {amountForFreeShipping === 0 ? '🎉 FREE Express Shipping Unlocked!' : `Add ₹${amountForFreeShipping.toLocaleString('en-IN')} more for FREE shipping`}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-family-mono)' }}>
                {progressPercent}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: amountForFreeShipping === 0 ? 'var(--status-success)' : 'var(--accent-primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 300ms ease'
              }} />
            </div>
          </div>
        )}

        {/* Item List / Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {cart.items && cart.items.length > 0 ? (
            <>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-card)',
                    padding: '14px',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-subtle)',
                    transition: 'border-color 150ms ease'
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px'
                  }}>
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.productName}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '11px',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        US {item.size}
                      </span>
                      {item.colorway && (
                        <span style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.colorway}
                        </span>
                      )}
                    </div>

                    <div style={{
                      fontFamily: 'var(--font-family-mono)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginTop: '2px'
                    }}>
                      ₹{item.unitPrice.toLocaleString('en-IN')}
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="touch-target"
                          style={{
                            padding: '6px 10px',
                            minWidth: '36px',
                            minHeight: '36px',
                            color: 'var(--text-secondary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 150ms'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{
                          fontFamily: 'var(--font-family-mono)',
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '0 6px',
                          color: 'var(--text-primary)',
                          minWidth: '24px',
                          textAlign: 'center'
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="touch-target"
                          style={{
                            padding: '6px 10px',
                            minWidth: '36px',
                            minHeight: '36px',
                            color: 'var(--text-secondary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 150ms'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="touch-target"
                        style={{
                          color: 'var(--text-muted)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px',
                          minWidth: '38px',
                          minHeight: '38px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 150ms, background-color 150ms'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--status-danger)';
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        aria-label="Remove item"
                        title="Remove from bag"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Graceful filler card for empty space when 1-2 items */}
              {cart.items.length <= 2 && (
                <div style={{
                  marginTop: 'auto',
                  padding: '14px 16px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>
                    SneakX Assurance
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255, 59, 48, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                      flexShrink: 0
                    }}>
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>100% Verified Authentic</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Condition inspected by sneaker specialists</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--status-success)',
                      flexShrink: 0
                    }}>
                      <Truck size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Express Insured Shipping</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Double-box dispatched in 24-48 hours</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                marginBottom: '16px'
              }}>
                <ShoppingBag size={32} style={{ opacity: 0.6 }} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Your bag is empty
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '240px', lineHeight: 1.5, marginBottom: '20px' }}>
                Explore the latest deadstock sneaker drops and add pairs to your bag.
              </p>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate('/catalogue');
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '10px 20px', fontSize: '13px' }}
              >
                Explore Drops <ArrowRight size={14} style={{ marginLeft: '6px' }} />
              </button>
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {cart.items && cart.items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{formattedSubtotal}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>Shipping</span>
              <span style={{
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 600,
                color: cart.shipping === 0 ? 'var(--status-success)' : 'var(--text-primary)'
              }}>
                {cart.shipping === 0 ? 'FREE' : `₹${cart.shipping}`}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <span>Estimated Total</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {formattedTotal}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn btn-primary btn-lg touch-target"
              style={{
                width: '100%',
                minHeight: '52px',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700
              }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
