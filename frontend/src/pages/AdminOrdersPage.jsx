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
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      alert(`Order ${orderId} transitioned to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Status transition failed');
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
                <th style={{ padding: '12px 16px' }}>Current Status</th>
                <th style={{ padding: '12px 16px' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
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
                    <span className={`badge ${o.status === 'DELIVERED' ? 'badge-success' : o.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
