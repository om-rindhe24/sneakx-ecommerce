import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { couponService } from '../services/couponService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Shield, DollarSign, Package, Users, AlertTriangle, ArrowRight, RefreshCw, Tag, Plus, Trash2, Power, X, CheckCircle, Percent } from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restockQty, setRestockQty] = useState({});

  // Coupon Management State
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderAmount: '',
    expiryDate: '',
    totalUsageLimit: '',
    onePerUser: true,
    isActive: true
  });

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

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const res = await couponService.getAdminCoupons();
      setCoupons(res.data || res || []);
    } catch (err) {
      console.error('Failed to load admin coupons', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) {
      setCouponError('Coupon code is required.');
      return;
    }
    if (!newCoupon.discountValue || Number(newCoupon.discountValue) <= 0) {
      setCouponError('Valid discount value is required.');
      return;
    }

    setCouponSubmitting(true);
    setCouponError(null);

    try {
      const payload = {
        code: newCoupon.code.trim().toUpperCase(),
        description: newCoupon.description.trim(),
        discountType: newCoupon.discountType,
        discountValue: parseFloat(newCoupon.discountValue),
        maxDiscountAmount: newCoupon.maxDiscountAmount ? parseFloat(newCoupon.maxDiscountAmount) : null,
        minOrderAmount: newCoupon.minOrderAmount ? parseFloat(newCoupon.minOrderAmount) : null,
        expiryDate: newCoupon.expiryDate ? `${newCoupon.expiryDate}T23:59:59` : null,
        totalUsageLimit: newCoupon.totalUsageLimit ? parseInt(newCoupon.totalUsageLimit, 10) : null,
        onePerUser: Boolean(newCoupon.onePerUser),
        isActive: Boolean(newCoupon.isActive)
      };

      await couponService.createAdminCoupon(payload);
      setShowCreateCoupon(false);
      setNewCoupon({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        maxDiscountAmount: '',
        minOrderAmount: '',
        expiryDate: '',
        totalUsageLimit: '',
        onePerUser: true,
        isActive: true
      });
      fetchCoupons();
    } catch (err) {
      setCouponError(err.response?.data?.message || err.message || 'Failed to create coupon.');
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleToggleCoupon = async (id) => {
    try {
      await couponService.toggleAdminCoupon(id);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to toggle coupon status.');
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${code}'?`)) return;
    try {
      await couponService.deleteAdminCoupon(id);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete coupon.');
    }
  };

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

      {/* Coupon Management Section */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={18} color="var(--accent-volt)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              Promotional Coupons & Discount Codes
            </h2>
            <span className="badge badge-secondary" style={{ marginLeft: '4px' }}>{coupons.length}</span>
          </div>

          <button
            onClick={() => {
              setShowCreateCoupon(!showCreateCoupon);
              setCouponError(null);
            }}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {showCreateCoupon ? <X size={14} /> : <Plus size={14} />}
            {showCreateCoupon ? 'Close Form' : '+ Create Coupon'}
          </button>
        </div>

        {/* Create Coupon Inline Form */}
        {showCreateCoupon && (
          <form onSubmit={handleCreateCoupon} style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Create New Promotional Coupon
            </h3>

            {couponError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 59, 48, 0.12)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                color: 'var(--accent-primary)',
                fontSize: '13px'
              }}>
                {couponError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  required
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontFamily: 'var(--font-family-mono)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Discount Type *</label>
                <select
                  value={newCoupon.discountType}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: '#fff' }}
                >
                  <option value="PERCENTAGE">Percentage (%) Off</option>
                  <option value="FLAT">Flat Amount (₹) Off</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>
                  {newCoupon.discountType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Flat Amount (₹) *'}
                </label>
                <input
                  type="number"
                  placeholder={newCoupon.discountType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 500'}
                  value={newCoupon.discountValue}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                  required
                  min="0.01"
                  step="0.01"
                  className="form-input"
                />
              </div>

              {newCoupon.discountType === 'PERCENTAGE' && (
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Max Discount Cap (₹) (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={newCoupon.maxDiscountAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountAmount: e.target.value })}
                    min="1"
                    className="form-input"
                  />
                </div>
              )}

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Min Order Subtotal (₹) (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 3000"
                  value={newCoupon.minOrderAmount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: e.target.value })}
                  min="0"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                  className="form-input"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Total Usage Limit (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={newCoupon.totalUsageLimit}
                  onChange={(e) => setNewCoupon({ ...newCoupon, totalUsageLimit: e.target.value })}
                  min="1"
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px' }}>Description / Promo Details</label>
              <input
                type="text"
                placeholder="e.g. 10% off for verified hype drops"
                value={newCoupon.description}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newCoupon.onePerUser}
                  onChange={(e) => setNewCoupon({ ...newCoupon, onePerUser: e.target.checked })}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                Limit to 1 use per customer
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newCoupon.isActive}
                  onChange={(e) => setNewCoupon({ ...newCoupon, isActive: e.target.checked })}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                Enable immediately (Active)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="submit"
                disabled={couponSubmitting}
                className="btn btn-primary btn-sm"
              >
                {couponSubmitting ? 'Saving...' : 'Save Coupon'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateCoupon(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Coupons List Table */}
        {loadingCoupons ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>Loading coupons...</p>
        ) : coupons.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>Coupon Code</th>
                  <th style={{ padding: '12px 14px' }}>Discount</th>
                  <th style={{ padding: '12px 14px' }}>Conditions</th>
                  <th style={{ padding: '12px 14px' }}>Usage</th>
                  <th style={{ padding: '12px 14px' }}>Expiry</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 800, color: '#fff' }}>
                        {c.code}
                      </div>
                      {c.description && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {c.description}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--accent-volt)' }}>
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                      {c.maxDiscountAmount && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
                          (Up to ₹{c.maxDiscountAmount})
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      <div>{c.minOrderAmount ? `Min ₹${c.minOrderAmount}` : 'No minimum'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {c.onePerUser ? '1 per user' : 'Multi-use'}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-family-mono)' }}>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{c.usageCount || 0}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {c.totalUsageLimit ? ` / ${c.totalUsageLimit}` : ' used'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'No expiry'}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${c.isActive ? 'badge-success' : 'badge-secondary'}`}>
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleToggleCoupon(c.id)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            color: c.isActive ? 'var(--status-warning)' : 'var(--status-success)'
                          }}
                          title={c.isActive ? 'Disable coupon' : 'Enable coupon'}
                        >
                          <Power size={12} style={{ marginRight: '4px' }} />
                          {c.isActive ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: 'var(--accent-primary)' }}
                          title="Delete coupon"
                        >
                          <Trash2 size={12} />
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
            No coupons created yet. Click "+ Create Coupon" to add your first promotion.
          </p>
        )}
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
