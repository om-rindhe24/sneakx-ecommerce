import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/ProductGrid';
import { AtmosphericBackdrop } from '../components/AtmosphericBackdrop';
import { X, SlidersHorizontal, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States - support both brand/brandId and category/categoryId
  const rawBrand = searchParams.get('brand') || '';
  const rawBrandId = searchParams.get('brandId') || '';
  const rawCategory = searchParams.get('category') || '';
  const rawCategoryId = searchParams.get('categoryId') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentGender = searchParams.get('gender') || '';
  const currentSize = searchParams.get('size') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '0', 10);

  const matchedBrand = brands.find((b) =>
    (rawBrandId && b.id.toString() === rawBrandId) ||
    (rawBrand && (b.slug.toLowerCase() === rawBrand.toLowerCase() || b.name.toLowerCase() === rawBrand.toLowerCase()))
  );
  const currentBrandId = matchedBrand ? matchedBrand.id.toString() : rawBrandId;
  const activeBrandName = matchedBrand?.name || (rawBrand ? rawBrand : undefined);

  const matchedCategory = categories.find((c) =>
    (rawCategoryId && c.id.toString() === rawCategoryId) ||
    (rawCategory && (c.slug.toLowerCase() === rawCategory.toLowerCase() || c.name.toLowerCase() === rawCategory.toLowerCase()))
  );
  const currentCategoryId = matchedCategory ? matchedCategory.id.toString() : rawCategoryId;
  const activeCategoryName = matchedCategory?.name || (rawCategory ? rawCategory : undefined);

  const hasActiveFilters = Boolean(
    rawBrand || rawBrandId || rawCategory || rawCategoryId || currentSize || currentGender || currentMinPrice || currentMaxPrice || currentSearch
  );

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [b, c] = await Promise.all([productService.getBrands(), productService.getCategories()]);
        setBrands(b || []);
        setCategories(c || []);
      } catch (err) {
        console.error('Failed to load filter metadata', err);
      }
    };
    loadMetadata();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      setLoading(true);
      setProducts([]); // Clear old products immediately to prevent displaying stale results
      try {
        const res = await productService.getProducts({
          brand: rawBrand || undefined,
          brandId: rawBrandId && !isNaN(Number(rawBrandId)) ? Number(rawBrandId) : undefined,
          category: rawCategory || undefined,
          categoryId: rawCategoryId && !isNaN(Number(rawCategoryId)) ? Number(rawCategoryId) : undefined,
          minPrice: currentMinPrice ? Number(currentMinPrice) : undefined,
          maxPrice: currentMaxPrice ? Number(currentMaxPrice) : undefined,
          gender: currentGender || undefined,
          size: currentSize ? Number(currentSize) : undefined,
          search: currentSearch || undefined,
          sort: currentSort,
          page: currentPage,
          pageSize: 12
        });
        if (isMounted) {
          setProducts(res?.content || []);
          setTotalPages(res?.totalPages || 1);
          setTotalElements(res?.totalElements || 0);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch catalog products', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === 'brandId' || key === 'brand') {
      newParams.delete('brand');
      newParams.delete('brandId');
      if (value) newParams.set('brandId', value);
    } else if (key === 'categoryId' || key === 'category') {
      newParams.delete('category');
      newParams.delete('categoryId');
      if (value) newParams.set('categoryId', value);
    } else {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    }
    newParams.set('page', '0'); // reset to first page on filter change
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const removeFilter = (key) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === 'brand' || key === 'brandId') {
      newParams.delete('brand');
      newParams.delete('brandId');
    } else if (key === 'category' || key === 'categoryId') {
      newParams.delete('category');
      newParams.delete('categoryId');
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const shoeSizes = [7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0];

  const renderFilterControls = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Filters
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <RotateCcw size={12} /> Reset All
          </button>
        )}
      </div>

      {/* Brand Filter */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Brand
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => updateFilter('brandId', '')}
            style={{
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: currentBrandId === '' ? 700 : 500,
              color: currentBrandId === '' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              padding: '4px 0'
            }}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => updateFilter('brandId', b.id.toString())}
              style={{
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: currentBrandId === b.id.toString() ? 700 : 500,
                color: currentBrandId === b.id.toString() ? 'var(--accent-primary)' : 'var(--text-secondary)',
                padding: '4px 0'
              }}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Category
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => updateFilter('categoryId', '')}
            style={{
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: currentCategoryId === '' ? 700 : 500,
              color: currentCategoryId === '' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              padding: '4px 0'
            }}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateFilter('categoryId', c.id.toString())}
              style={{
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: currentCategoryId === c.id.toString() ? 700 : 500,
                color: currentCategoryId === c.id.toString() ? 'var(--accent-primary)' : 'var(--text-secondary)',
                padding: '4px 0'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Price (₹)
          </h4>
          {(currentMinPrice || currentMaxPrice) && (
            <button
              onClick={() => { removeFilter('minPrice'); removeFilter('maxPrice'); }}
              style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '8px',
          width: '100%'
        }}>
          <div style={{ position: 'relative', minWidth: 0 }}>
            <span style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.45)',
              pointerEvents: 'none'
            }}>₹</span>
            <input
              type="number"
              placeholder="Min"
              value={currentMinPrice}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
              style={{
                width: '100%',
                minWidth: 0,
                padding: '8px 6px 8px 18px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#1D202A',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: 'var(--radius-sm, 6px)',
                color: '#FFFFFF'
              }}
            />
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>—</span>
          <div style={{ position: 'relative', minWidth: 0 }}>
            <span style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.45)',
              pointerEvents: 'none'
            }}>₹</span>
            <input
              type="number"
              placeholder="Max"
              value={currentMaxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              style={{
                width: '100%',
                minWidth: 0,
                padding: '8px 6px 8px 18px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#1D202A',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: 'var(--radius-sm, 6px)',
                color: '#FFFFFF'
              }}
            />
          </div>
        </div>
      </div>

      {/* Shoe Size Filter */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Size (US)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {shoeSizes.map((s) => {
            const sStr = s.toFixed(1);
            const isSelected = currentSize === sStr;
            return (
              <button
                key={s}
                onClick={() => updateFilter('size', isSelected ? '' : sStr)}
                style={{
                  padding: '6px 0',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-primary)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  transition: 'all 150ms ease'
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gender Filter */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Gender
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Men', 'Women', 'Unisex'].map((g) => (
            <button
              key={g}
              onClick={() => updateFilter('gender', currentGender === g ? '' : g)}
              className={`btn btn-sm ${currentGender === g ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '6px 8px' }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '85vh', backgroundColor: '#0B0C0E' }}>
      {/* Faded Atmospheric Sneaker Silhouette Watermark */}
      <AtmosphericBackdrop
        imageUrl="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&auto=format&fit=crop&q=80"
        opacity={0.16}
        position="right"
        rotate="-12deg"
        scale={1.3}
        blendMode="normal"
        gradientVariant="radial"
      />

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '40px 24px' }}>
      {/* Top Header & Sort Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            textTransform: 'uppercase'
          }}>
            SHOP SNEAKERS
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {totalElements} Sneakers
            {currentSearch && ` matching "${currentSearch}"`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="btn btn-secondary btn-sm mobile-filter-trigger touch-target"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px' }}
            aria-label="Open filters"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                display: 'inline-block'
              }} />
            )}
          </button>

          {/* Sort Dropdown */}
          <select
            className="form-select touch-target"
            value={currentSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            style={{ width: 'auto', minHeight: '44px', padding: '8px 16px', fontSize: '13px' }}
          >
            <option value="featured">Sort: Featured</option>
            <option value="price_asc">Price Low → High</option>
            <option value="price_desc">Price High → Low</option>
            <option value="newest">Newest</option>
            <option value="rating_desc">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Brand Browse Row (Section 16 requirement) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px',
        scrollbarWidth: 'none'
      }}>
        {['Nike', 'Jordan', 'Adidas', 'Yeezy', 'New Balance', 'Converse', 'Puma'].map((bName) => {
          const brandObj = brands.find((b) => b.name.toLowerCase() === bName.toLowerCase());
          const isSelected = activeBrandName?.toLowerCase() === bName.toLowerCase();
          return (
            <button
              key={bName}
              onClick={() => {
                if (isSelected) {
                  updateFilter('brandId', '');
                } else if (brandObj) {
                  updateFilter('brandId', brandObj.id.toString());
                } else {
                  updateFilter('brand', bName);
                }
              }}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? '0 2px 10px rgba(255, 74, 61, 0.28)' : 'var(--shadow-subtle)',
                transition: 'all 160ms ease'
              }}
            >
              {bName}
            </button>
          );
        })}
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ACTIVE FILTERS:
          </span>

          {currentSearch && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 59, 48, 0.08)',
              border: '1px solid rgba(255, 59, 48, 0.25)',
              color: 'var(--accent-primary)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)'
            }}>
              Search: "{currentSearch}"
              <button onClick={() => removeFilter('search')} style={{ cursor: 'pointer', color: 'inherit' }}>
                <X size={12} />
              </button>
            </span>
          )}

          {activeBrandName && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)'
            }}>
              Brand: {activeBrandName}
              <button onClick={() => removeFilter('brandId')} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={12} />
              </button>
            </span>
          )}

          {activeCategoryName && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)'
            }}>
              Category: {activeCategoryName}
              <button onClick={() => removeFilter('categoryId')} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={12} />
              </button>
            </span>
          )}

          {currentGender && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)'
            }}>
              Gender: {currentGender}
              <button onClick={() => removeFilter('gender')} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={12} />
              </button>
            </span>
          )}

          {currentSize && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)'
            }}>
              Size: {currentSize}
              <button onClick={() => removeFilter('size')} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={12} />
              </button>
            </span>
          )}

          {(currentMinPrice || currentMaxPrice) && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)'
            }}>
              ₹{currentMinPrice || '0'} - ₹{currentMaxPrice || 'Max'}
              <button onClick={() => { removeFilter('minPrice'); removeFilter('maxPrice'); }} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={12} />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            style={{
              fontSize: '12px',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              marginLeft: 'auto',
              cursor: 'pointer'
            }}
          >
            Reset All
          </button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="catalog-layout">
        {/* Sidebar Filters (Desktop) */}
        <aside
          className="catalog-sidebar-desktop"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {renderFilterControls()}
        </aside>

        {/* Product Grid & Pagination Area */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '32px', minWidth: 0, width: '100%' }}>
          <ProductGrid products={products} loading={loading} onResetFilters={clearAllFilters} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              paddingTop: '24px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <button
                disabled={currentPage === 0}
                onClick={() => updateFilter('page', (currentPage - 1).toString())}
                className="btn btn-secondary btn-sm touch-target"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => updateFilter('page', (currentPage + 1).toString())}
                className="btn btn-secondary btn-sm touch-target"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Filters Slide-over Modal */}
      {mobileFilterOpen && (
        <div
          className="modal-overlay"
          onClick={() => setMobileFilterOpen(false)}
          style={{ zIndex: 1000 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '92%',
              maxHeight: '85vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              padding: '24px 20px',
              borderRadius: 'var(--radius-card, 16px)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Catalogue Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="touch-target"
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)'
                }}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {renderFilterControls()}

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="btn btn-primary touch-target"
              style={{ width: '100%', minHeight: '48px', marginTop: '12px', fontWeight: 700 }}
            >
              Apply & View {totalElements} {totalElements === 1 ? 'Silhouette' : 'Silhouettes'}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
