import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders(0, 50);
      setOrders(data?.content || []);
    } catch (err) {
      console.error('Failed to load admin orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder?.status === 'CANCELLED') {
      alert('Cancelled orders are locked and cannot be modified.');
      return;
    }

    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      alert(`Order ${orderId} transitioned to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Status transition failed');
    }
  };

  if (loading) return <LoadingSpinner text="Fetching all customer orders..." />;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link to="/admin" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>Customer Orders Management</h1>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Tracking Number</th>
                <th style={{ padding: '12px 16px' }}>Customer</th>
                <th style={{ padding: '12px 16px' }}>Total Amount</th>
                <th style={{ padding: '12px 16px' }}>Payment Mode</th>
                <th style={{ padding: '12px 16px' }}>Order Status & Details</th>
                <th style={{ padding: '12px 16px' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const isCancelled = o.status === 'CANCELLED';
                const isCod = o.paymentMethod?.toUpperCase() === 'COD' || o.refundStatus === 'NO_REFUND_REQUIRED';

                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: isCancelled ? 'rgba(255, 59, 48, 0.03)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-family-mono)', color: '#fff' }}>{o.orderNumber}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 600, color: '#fff' }}>{o.customerName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.customerEmail}</p>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-family-mono)', fontWeight: 700 }}>
                      ₹{o.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{o.paymentMethod}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`badge ${o.status === 'DELIVERED' ? 'badge-success' : isCancelled ? 'badge-danger' : 'badge-warning'}`} style={{ width: 'fit-content' }}>
                          {o.status}
                        </span>

                        {isCancelled && (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {o.cancellationReason && (
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Reason: </span>
                                <span style={{ color: 'var(--text-primary)' }}>{o.cancellationReason}</span>
                              </div>
                            )}
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Refund: </span>
                              {isCod ? (
                                <span style={{ color: 'var(--text-muted)' }}>No payment to refund (COD)</span>
                              ) : (
                                <span style={{ color: o.refundStatus === 'PROCESSED' ? 'var(--status-success)' : 'var(--accent-volt)', fontWeight: 600 }}>
                                  {o.refundStatus || 'PROCESSED'}
                                  {o.refundAmount ? ` (₹${Number(o.refundAmount).toLocaleString('en-IN')})` : ''}
                                  {o.refundId ? ` • Ref: ${o.refundId}` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {isCancelled ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)'
                          }}>
                            LOCKED (CANCELLED)
                          </span>
                        </div>
                      ) : (
                        <select
                          className="form-select"
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
