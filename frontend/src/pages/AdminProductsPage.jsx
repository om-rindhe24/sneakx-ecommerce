import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { adminService } from '../services/adminService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Plus, Trash2, X, ArrowLeft, Search, RotateCcw, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter States
  const [filterBrandId, setFilterBrandId] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // New Product Form State
  const [formData, setFormData] = useState({
    name: '',
    brandId: 1,
    categoryId: 1,
    description: '',
    basePrice: '',
    colorway: '',
    gender: 'Unisex',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800'
  });

  const loadFilterMetadata = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        productService.getBrands(),
        productService.getCategories()
      ]);
      setBrands(bRes || []);
      setCategories(cRes || []);
      if (bRes && bRes.length > 0) setFormData((prev) => ({ ...prev, brandId: bRes[0].id }));
      if (cRes && cRes.length > 0) setFormData((prev) => ({ ...prev, categoryId: cRes[0].id }));
    } catch (err) {
      console.error('Failed to load admin metadata', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        brandId: filterBrandId ? Number(filterBrandId) : undefined,
        categoryId: filterCategoryId ? Number(filterCategoryId) : undefined,
        search: filterSearch.trim() || undefined,
        pageSize: 100
      });
      setProducts(res?.content || []);
    } catch (err) {
      console.error('Failed to load admin products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterMetadata();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filterBrandId, filterCategoryId, filterSearch]);

  const handleResetFilters = () => {
    setFilterBrandId('');
    setFilterCategoryId('');
    setFilterSearch('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this sneaker?')) {
      try {
        await adminService.deleteProduct(id);
        alert('Product deactivated');
        loadProducts();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminService.createProduct({
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        imageUrls: [formData.imageUrl],
        initialVariants: [
          { size: 8.0, stockQuantity: 10, priceAdjustment: 0 },
          { size: 9.0, stockQuantity: 10, priceAdjustment: 0 },
          { size: 10.0, stockQuantity: 8, priceAdjustment: 0 },
          { size: 11.0, stockQuantity: 6, priceAdjustment: 0 }
        ]
      });
      alert('Sneaker silhouette published successfully!');
      setIsAddModalOpen(false);
      loadProducts();
    } catch (err) {
      alert(err.message || 'Failed to create product');
    }
  };

  const hasActiveFilters = Boolean(filterBrandId || filterCategoryId || filterSearch);

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></Link>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>Catalogue Inventory</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Showing {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Sneaker Model
        </button>
      </div>

      {/* Admin Filters Bar */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Brand Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Brand:</label>
          <select
            className="form-select"
            value={filterBrandId}
            onChange={(e) => setFilterBrandId(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Category:</label>
          <select
            className="form-select"
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Search Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px', minWidth: '200px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by model or colorway..."
              className="form-input"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              style={{ padding: '6px 10px 6px 32px', fontSize: '12px', width: '100%' }}
            />
          </div>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
          >
            <RotateCcw size={12} /> Clear Filters
          </button>
        )}
      </div>

      {/* Table Content */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <LoadingSpinner text="Filtering inventory..." />
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              No sneaker models match active filters
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Try adjusting your brand or category selections.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '12px 16px' }}>Image</th>
                  <th style={{ padding: '12px 16px' }}>Model</th>
                  <th style={{ padding: '12px 16px' }}>Brand</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Gender</th>
                  <th style={{ padding: '12px 16px' }}>Base Price</th>
                  <th style={{ padding: '12px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <img src={p.primaryImageUrl} alt={p.name} style={{ width: '44px', height: '44px', objectFit: 'contain', backgroundColor: '#15171B', borderRadius: '4px', padding: '4px' }} />
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>
                      <Link to={`/products/${p.id}`} style={{ color: 'inherit', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.target.style.color = '#fff'}>
                        {p.name}
                      </Link>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>{p.colorway}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-secondary">{p.brandName}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{p.categoryName}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{p.gender}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-family-mono)', fontWeight: 600 }}>
                      ₹{p.basePrice?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                        onMouseEnter={(e) => e.target.style.color = 'var(--status-danger)'}
                        onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                        title="Deactivate sneaker"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Sneaker Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Add Sneaker Model</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sneaker Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Air Jordan 3 Retro White Cement"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Brand</label>
                  <select
                    className="form-select"
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: parseInt(e.target.value, 10) })}
                  >
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value, 10) })}
                  >
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Base Retail Price (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="14999"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Colorway</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Summit White / Fire Red"
                    value={formData.colorway}
                    onChange={(e) => setFormData({ ...formData, colorway: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Primary Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Design & Release Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                Publish Sneaker & Initialize Sizes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
