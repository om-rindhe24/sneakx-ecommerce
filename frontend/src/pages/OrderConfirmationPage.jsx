import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { orderService } from '../services/orderService';
import {
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  MapPin,
  Calendar,
  CreditCard,
  Mail
} from 'lucide-react';

export const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (order) return;
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderByNumber(orderNumber);
        if (data) setOrder(data);
      } catch (err) {
        console.error('Failed to load order confirmation details', err);
      } finally {
        setLoading(false);
      }
    };
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber, order]);

  const maskEmail = (email) => {
    if (!email) return 'your registered email';
    const parts = email.split('@');
    if (parts.length < 2) return email;
    const name = parts[0];
    const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : name;
    return `${maskedName}@${parts[1]}`;
  };

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="container" style={{ padding: '48px 24px', maxWidth: '840px' }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Animated Checkmark Hero */}
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '2px solid var(--status-success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--status-success)',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)'
        }}>
          <CheckCircle2 size={44} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.10)',
            color: 'var(--status-success)',
            fontSize: '12px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px'
          }}>
            Order Confirmed ✓
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Grails Secured & Confirmed!
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.6 }}>
            Thank you for your order. Your sneaker drop is locked into the SneakX system with atomic stock deduction and authenticated verification.
          </p>

          {order && (
            order.confirmationEmailSent ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 14px',
                fontSize: '12px',
                color: 'var(--status-success)',
                marginTop: '12px'
              }}>
                <Mail size={14} />
                <span>Confirmation email sent to <strong style={{ color: 'var(--text-primary)' }}>{maskEmail(order.customerEmail)}</strong></span>
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 14px',
                fontSize: '12px',
                color: 'var(--status-success)',
                marginTop: '12px'
              }}>
                <CheckCircle2 size={14} />
                <span>Your order has been placed successfully.</span>
              </div>
            )
          )}
        </div>

        {/* Order Reference Pill */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          width: '100%'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Order ID / Tracking Number
            </div>
            <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '17px', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {orderNumber}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Payment:</span>
            <span className={`badge ${order?.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
              {order?.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Payment Successful — Test Mode'}
            </span>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        {order && (
          <div style={{
            width: '100%',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-subtle)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Meta info grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} /> Order Date
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', display: 'block' }}>
                  {formattedDate}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={13} /> Payment Method
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', display: 'block' }}>
                  {order.paymentMethod}
                  {order.paymentReference && ` (${order.paymentReference.slice(0, 16)}...)`}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} /> Shipping Destination
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', display: 'block' }}>
                  {order.shippingAddress?.fullName} — {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </span>
              </div>
            </div>

            {/* Items Purchased Table */}
            {order.items && order.items.length > 0 && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                  Items Purchased ({order.items.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {order.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            style={{
                              width: '40px',
                              height: '40px',
                              objectFit: 'contain',
                              backgroundColor: '#F4F3F0',
                              borderRadius: '4px',
                              padding: '2px'
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.productName}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            US {item.size} • Qty {item.quantity} {item.colorway && `• ${item.colorway}`}
                          </div>
                        </div>
                      </div>

                      <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{item.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Billing Total */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}>
              <span>Order Total:</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--accent-primary)', fontSize: '20px' }}>
                ₹{order.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '8px',
          width: '100%'
        }}>
          <Link to="/orders" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={16} /> View Order
          </Link>
          <Link to="/orders" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            View My Orders
          </Link>
          <Link to="/products" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};
