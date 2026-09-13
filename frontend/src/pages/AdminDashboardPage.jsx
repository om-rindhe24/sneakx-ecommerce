import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Shield, DollarSign, Package, Users, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restockQty, setRestockQty] = useState({});

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRestock = async (variantId) => {
    const qty = parseInt(restockQty[variantId] || '10', 10);
    try {
      await adminService.updateVariantStock(variantId, qty);
      alert('Variant stock updated successfully!');
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to update stock');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Aggregating platform metrics..." />;
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(230, 255, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-volt)'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>Admin Command Center</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Platform metrics, inventory health, and order fulfillment</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/products" className="btn btn-secondary btn-sm">Manage Products</Link>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm">Manage Orders</Link>
          <Link to="/admin/users" className="btn btn-secondary btn-sm">Manage Users</Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="card">
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Revenue</span>
          <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '24px', fontWeight: 800, color: 'var(--accent-volt)', marginTop: '6px' }}>
            ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Orders</span>
          <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            {stats?.totalOrders || 0}
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Active Orders</span>
          <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '24px', fontWeight: 800, color: 'var(--status-warning)', marginTop: '6px' }}>
            {stats?.activeOrders || 0}
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Products</span>
          <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            {stats?.totalProducts || 0}
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Registered Users</span>
          <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            {stats?.totalUsers || 0}
          </p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <AlertTriangle size={18} color="var(--status-warning)" />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
            Low Stock Inventory Alerts (≤ 5 pairs remaining)
          </h2>
        </div>

        {stats?.lowStockAlerts && stats.lowStockAlerts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Variant SKU</th>
                  <th style={{ padding: '12px 16px' }}>Shoe Size</th>
                  <th style={{ padding: '12px 16px' }}>Current Stock</th>
                  <th style={{ padding: '12px 16px' }}>Restock Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockAlerts.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-family-mono)', color: '#fff' }}>{v.sku}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>US {v.size}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-warning">{v.stockQuantity} Left</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="New Qty"
                          defaultValue={v.stockQuantity + 10}
                          onChange={(e) => setRestockQty({ ...restockQty, [v.id]: e.target.value })}
                          style={{
                            width: '80px',
                            padding: '4px 8px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            color: '#fff',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px'
                          }}
                        />
                        <button
                          onClick={() => handleRestock(v.id)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          <RefreshCw size={12} /> Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
            All variants have healthy stock levels (&gt; 5 pairs).
          </p>
        )}
      </div>
    </div>
  );
};
