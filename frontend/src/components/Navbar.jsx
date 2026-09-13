import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingBag, Heart, Search, Shield, LogOut, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart, setIsDrawerOpen } = useCart();
  const { wishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Auto-close drawers on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const isActive = (path, queryKey = null, queryVal = null) => {
    if (queryKey) {
      const params = new URLSearchParams(location.search);
      return location.pathname === path && params.get(queryKey) === queryVal;
    }
    return location.pathname === path && !location.search;
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
      backgroundColor: scrolled ? 'rgba(11, 12, 14, 0.94)' : 'rgba(11, 12, 14, 0.82)',
      borderBottom: '1px solid var(--border-subtle)',
      boxShadow: scrolled ? '0 8px 24px rgba(0, 0, 0, 0.5)' : 'none',
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 240ms ease'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: '24px'
      }}>
        {/* Brand Monogram */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-family-display)',
            fontWeight: 800,
            fontSize: '25px',
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'baseline'
          }}>
            SNEAK<span style={{ color: 'var(--accent-primary)' }}>X</span>
          </span>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)',
            boxShadow: '0 0 10px var(--accent-glow)',
            alignSelf: 'center',
            marginTop: '2px'
          }} />
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
          <Link
            to="/products"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: isActive('/products') ? '#FFFFFF' : 'var(--text-secondary)',
              position: 'relative',
              padding: '6px 0',
              transition: 'color 180ms ease'
            }}
          >
            Vault
            {isActive('/products') && (
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                left: '0',
                right: '0',
                height: '2px',
                backgroundColor: 'var(--accent-primary)',
                boxShadow: '0 0 8px var(--accent-glow)',
                borderRadius: '2px'
              }} />
            )}
          </Link>

          <Link
            to="/products?categoryId=1"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: isActive('/products', 'categoryId', '1') ? '#FFFFFF' : 'var(--text-secondary)',
              position: 'relative',
              padding: '6px 0',
              transition: 'color 180ms ease'
            }}
          >
            Basketball
            {isActive('/products', 'categoryId', '1') && (
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                left: '0',
                right: '0',
                height: '2px',
                backgroundColor: 'var(--accent-primary)',
                boxShadow: '0 0 8px var(--accent-glow)',
                borderRadius: '2px'
              }} />
            )}
          </Link>

          <Link
            to="/products?categoryId=2"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: isActive('/products', 'categoryId', '2') ? '#FFFFFF' : 'var(--text-secondary)',
              position: 'relative',
              padding: '6px 0',
              transition: 'color 180ms ease'
            }}
          >
            Lifestyle
            {isActive('/products', 'categoryId', '2') && (
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                left: '0',
                right: '0',
                height: '2px',
                backgroundColor: 'var(--accent-primary)',
                boxShadow: '0 0 8px var(--accent-glow)',
                borderRadius: '2px'
              }} />
            )}
          </Link>

          {isAdmin && (
            <Link to="/admin" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-family-display)',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 59, 48, 0.12)',
              color: 'var(--accent-primary)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              letterSpacing: '0.08em'
            }}>
              <Shield size={12} /> ADMIN PANEL
            </Link>
          )}
        </nav>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearch} style={{
          flex: '0 1 320px',
          position: 'relative',
          transition: 'flex-basis 250ms ease'
        }} className="desktop-search">
          <Search size={15} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: searchFocused ? 'var(--accent-primary)' : 'var(--text-muted)',
            transition: 'color 180ms ease'
          }} />
          <input
            type="text"
            placeholder="Search Jordan, Dunk, Samba..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%',
              backgroundColor: '#161820',
              border: searchFocused ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '9px 36px 9px 38px',
              color: '#FFFFFF',
              fontSize: '13px',
              outline: 'none',
              boxShadow: searchFocused ? '0 0 16px var(--accent-glow-subtle)' : 'none',
              transition: 'all 200ms ease'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Wishlist Icon (Desktop only - hidden on mobile) */}
          <Link
            to="/wishlist"
            className="desktop-wishlist"
            style={{
              position: 'relative',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#161820',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
              transition: 'border-color 180ms ease, transform 180ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            aria-label="Wishlist"
          >
            <Heart size={18} />
            {wishlist?.totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--accent-primary)',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px var(--accent-glow)'
              }}>
                {wishlist.totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Search Toggle Button (Mobile only - 44x44px touch target) */}
          <button
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen);
              setMobileMenuOpen(false);
            }}
            className="mobile-menu-btn"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: mobileSearchOpen ? 'rgba(255, 59, 48, 0.12)' : '#161820',
              border: mobileSearchOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              color: mobileSearchOpen ? 'var(--accent-primary)' : '#FFFFFF',
              cursor: 'pointer'
            }}
            aria-label="Toggle Search"
          >
            <Search size={18} />
          </button>

          {/* Cart Icon (Universal - min 44x44px touch target) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              position: 'relative',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#161820',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
              transition: 'border-color 180ms ease, transform 180ms ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag size={18} />
            {cart?.totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--accent-primary)',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px var(--accent-glow)'
              }}>
                {cart.totalItems}
              </span>
            )}
          </button>

          {/* User Profile / Auth Actions (Desktop only - hidden on mobile) */}
          <div className="desktop-auth" style={{ position: 'relative' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to="/orders"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#161820',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-subtle)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 180ms ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-medium)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  title="View Orders & Account"
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#FFFFFF'
                  }}>
                    {(user?.firstName || 'U')[0].toUpperCase()}
                  </div>
                  <span>{user?.firstName || 'Account'}</span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="btn btn-outline btn-sm"
                  style={{
                    padding: '8px 12px',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: 'var(--radius-full)'
                  }}
                  title="Sign Out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to="/admin/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-family-display)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 180ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Admin Portal Access"
                >
                  <Shield size={12} /> Admin
                </Link>
                <Link to="/login" className="btn btn-secondary btn-sm" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ padding: '8px 18px', borderRadius: 'var(--radius-full)' }}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Button (44x44px touch target) */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setMobileSearchOpen(false);
            }}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: mobileMenuOpen ? 'rgba(255, 59, 48, 0.12)' : 'transparent',
              color: mobileMenuOpen ? 'var(--accent-primary)' : '#FFFFFF',
              border: mobileMenuOpen ? '1px solid rgba(255, 59, 48, 0.3)' : '1px solid transparent',
              cursor: 'pointer'
            }}
            className="mobile-menu-btn"
            aria-label="Toggle Mobile Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown Bar */}
      {mobileSearchOpen && (
        <div style={{
          position: 'absolute',
          top: '72px',
          left: 0,
          right: 0,
          backgroundColor: '#0F1117',
          borderBottom: '1px solid var(--border-medium)',
          padding: '12px 16px',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6)',
          zIndex: 950,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
            <input
              type="text"
              placeholder="Search Jordan, Dunk, Samba..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                backgroundColor: '#1A1D26',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-full)',
                padding: '12px 38px 12px 42px',
                color: '#FFFFFF',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </form>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Mobile Off-Canvas Navigation Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(9, 10, 13, 0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: '20px 16px 36px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 999,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Quick Search inside Drawer */}
          <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
            <input
              type="text"
              placeholder="Search sneakers, houses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#161822',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px 12px 42px',
                color: '#FFFFFF',
                fontSize: '14px',
                outline: 'none',
                minHeight: '44px'
              }}
            />
          </form>

          {/* Primary Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 8px 4px 8px' }}>
              Collection Categories
            </div>

            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive('/products') ? 'rgba(255, 59, 48, 0.1)' : '#14161F',
                border: isActive('/products') ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                color: isActive('/products') ? '#FFFFFF' : 'var(--text-primary)',
                fontFamily: 'var(--font-family-display)',
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                minHeight: '48px'
              }}
            >
              <span>VAULT (ALL GRAILS)</span>
              <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 800 }}>37 MODELS →</span>
            </Link>

            <Link
              to="/products?categoryId=1"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive('/products', 'categoryId', '1') ? 'rgba(255, 59, 48, 0.1)' : '#14161F',
                border: isActive('/products', 'categoryId', '1') ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                color: isActive('/products', 'categoryId', '1') ? '#FFFFFF' : 'var(--text-primary)',
                fontFamily: 'var(--font-family-display)',
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                minHeight: '48px'
              }}
            >
              <span>BASKETBALL</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RETROS & ON-COURT</span>
            </Link>

            <Link
              to="/products?categoryId=2"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive('/products', 'categoryId', '2') ? 'rgba(255, 59, 48, 0.1)' : '#14161F',
                border: isActive('/products', 'categoryId', '2') ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                color: isActive('/products', 'categoryId', '2') ? '#FFFFFF' : 'var(--text-primary)',
                fontFamily: 'var(--font-family-display)',
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                minHeight: '48px'
              }}
            >
              <span>LIFESTYLE</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TERRACE & RUNNING</span>
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#14161F',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: 700,
                minHeight: '48px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Heart size={18} color="var(--accent-primary)" />
                <span>Saved Wishlist</span>
              </div>
              <span style={{
                backgroundColor: 'rgba(255, 59, 48, 0.15)',
                color: 'var(--accent-primary)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800
              }}>
                {wishlist?.totalItems || 0}
              </span>
            </Link>
          </div>

          {/* User Authentication & Admin Access */}
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '20px',
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  padding: '14px 16px',
                  backgroundColor: '#14161F',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    flexShrink: 0
                  }}>
                    {(user?.firstName || 'U')[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.fullName || user?.firstName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email}
                    </div>
                  </div>
                </div>

                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', minHeight: '46px', fontSize: '14px' }}
                >
                  Order History & Tracking
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 59, 48, 0.12)',
                      border: '1px solid rgba(255, 59, 48, 0.3)',
                      color: 'var(--accent-primary)',
                      fontSize: '13px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      minHeight: '46px'
                    }}
                  >
                    <Shield size={16} /> Admin Portal
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="btn btn-outline"
                  style={{ width: '100%', color: 'var(--status-danger)', borderColor: 'rgba(239, 68, 68, 0.3)', minHeight: '46px' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', minHeight: '46px', fontSize: '15px' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', minHeight: '46px', fontSize: '15px' }}
                >
                  Create SneakX Account
                </Link>
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    minHeight: '44px'
                  }}
                >
                  <Shield size={13} /> Admin Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
