import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Package, Calendar, MapPin, CreditCard, ChevronRight } from 'lucide-react';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load customer orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving purchase history..." />;
  }

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '960px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        My Orders
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Track shipments and historical order snapshots
      </p>

      {orders.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '64px 24px',
          textAlign: 'center'
        }}>
          <Package size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>No Orders Placed Yet</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            You haven't copped any pairs yet. Explore the latest drops.
          </p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map((order) => {
            const statusColor = order.status === 'DELIVERED'
              ? 'badge-success'
              : order.status === 'CANCELLED'
                ? 'badge-danger'
                : 'badge-warning';

            return (
              <div key={order.id} style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  padding: '16px 24px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking ID</span>
                      <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {order.orderNumber}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span className={`badge ${statusColor}`}>{order.status}</span>
                    <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '16px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-card)' }}>
                  {order.items?.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '68px',
                        height: '68px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '6px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.productName}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Size: US {item.size} • Color: {item.colorway} • Qty: {item.quantity}
                        </p>
                      </div>

                      <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{item.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer / Address info */}
                <div style={{
                  padding: '14px 24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <MapPin size={15} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <span>
                    Delivering to <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.shippingAddress?.fullName}</strong> — {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
