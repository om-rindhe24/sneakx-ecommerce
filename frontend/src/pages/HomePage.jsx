import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { AtmosphericBackdrop } from '../components/AtmosphericBackdrop';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Award,
  Layers
} from 'lucide-react';

// Hero Spotlight Silhouettes with 1:1 authentic photography
const HERO_SPOTLIGHTS = [
  {
    id: 1,
    name: 'Air Jordan 1 Retro High OG Chicago',
    brand: 'JORDAN',
    brandId: 2,
    price: '₹16,999',
    colorway: 'Varsity Red / White / Black',
    badge: 'ICONIC JUMPMAN GRAIL',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=80',
    link: '/products/1'
  },
  {
    id: 9,
    name: 'Nike Dunk Low Retro Panda',
    brand: 'NIKE',
    brandId: 1,
    price: '₹8,995',
    colorway: 'Black / White',
    badge: 'STREETWEAR ICON',
    imageUrl: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1200&auto=format&fit=crop&q=80',
    link: '/products/9'
  },
  {
    id: 17,
    name: 'Adidas Samba Classic OG',
    brand: 'ADIDAS',
    brandId: 3,
    price: '₹9,999',
    colorway: 'Cloud White / Core Black / Gum',
    badge: 'TERRACE CLASSIC',
    imageUrl: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1200&auto=format&fit=crop&q=80',
    link: '/products/17'
  },
  {
    id: 23,
    name: 'Yeezy Boost 350 V2 Zebra',
    brand: 'YEEZY',
    brandId: 4,
    price: '₹22,999',
    colorway: 'White / Core Black / Red',
    badge: 'PRIMEKNIT BOOST',
    imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&auto=format&fit=crop&q=80',
    link: '/products/23'
  },
  {
    id: 28,
    name: 'New Balance 550 White Green',
    brand: 'NEW BALANCE',
    brandId: 5,
    price: '₹11,499',
    colorway: 'Sea Salt / Team Forest Green',
    badge: 'BOSTON HERITAGE',
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&auto=format&fit=crop&q=80',
    link: '/products/28'
  }
];

// All 7 Certified Sneaker Houses
const BRAND_HOUSES = [
  { name: 'NIKE', slug: 'nike', id: 1, count: '8 Models' },
  { name: 'JORDAN', slug: 'jordan', id: 2, count: '7 Models' },
  { name: 'ADIDAS', slug: 'adidas', id: 3, count: '6 Models' },
  { name: 'YEEZY', slug: 'yeezy', id: 4, count: '5 Models' },
  { name: 'NEW BALANCE', slug: 'new-balance', id: 5, count: '5 Models' },
  { name: 'CONVERSE', slug: 'converse', id: 6, count: '3 Models' },
  { name: 'PUMA', slug: 'puma', id: 7, count: '3 Models' }
];

// Editorial Brand Cards
const EDITORIAL_BRANDS = [
  {
    name: 'JORDAN',
    id: 2,
    count: '7 Certified Models',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=700&auto=format&fit=crop&q=80',
    tagline: 'Hardwood Royalty & Retro Grails',
    gridSpan: 'span 7'
  },
  {
    name: 'NIKE',
    id: 1,
    count: '8 Certified Models',
    imageUrl: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=700&auto=format&fit=crop&q=80',
    tagline: 'The Swoosh Dynasty & Dunks',
    gridSpan: 'span 5'
  },
  {
    name: 'ADIDAS',
    id: 3,
    count: '6 Certified Models',
    imageUrl: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=700&auto=format&fit=crop&q=80',
    tagline: 'Terrace Icons, Sambas & Originals',
    gridSpan: 'span 4'
  },
  {
    name: 'YEEZY',
    id: 4,
    count: '5 Certified Models',
    imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=700&auto=format&fit=crop&q=80',
    tagline: 'Sculpted Primeknit & Boost',
    gridSpan: 'span 4'
  },
  {
    name: 'NEW BALANCE',
    id: 5,
    count: '5 Certified Models',
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=700&auto=format&fit=crop&q=80',
    tagline: 'Boston Heritage & 550 Retro',
    gridSpan: 'span 4'
  }
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSpotlightIdx, setActiveSpotlightIdx] = useState(0);

  const activeSpotlight = HERO_SPOTLIGHTS[activeSpotlightIdx];

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, newRes] = await Promise.all([
          productService.getFeatured(),
          productService.getNewReleases()
        ]);
        setFeatured(featuredRes || []);
        setNewReleases(newRes || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  // Smooth hero spotlight cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpotlightIdx((prev) => (prev + 1) % HERO_SPOTLIGHTS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', overflowX: 'hidden' }}>

      {/* =========================================================================
          1. HERO SECTION — EDITORIAL STREETWEAR AESTHETIC
          ========================================================================= */}
      <section style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '44px 0 24px 0',
        backgroundColor: '#0B0C0E',
        borderBottom: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        {/* Atmospheric Large Faded Sneaker Background Layer */}
        <AtmosphericBackdrop
          imageUrl="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&auto=format&fit=crop&q=80"
          opacity={0.18}
          position="right"
          rotate="-10deg"
          scale={1.22}
          blendMode="normal"
          gradientVariant="default"
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="hero-grid">

            {/* Left Column: Bold Typography & Headline Hierarchy */}
            <div className="hero-text-col">
              {/* Max 2 Clean Elegant Badges (De-cluttered) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <span className="badge-editorial" style={{ borderColor: 'rgba(255, 59, 48, 0.4)', color: '#FFFFFF' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary)',
                    boxShadow: '0 0 10px var(--accent-glow)'
                  }} />
                  AUTHENTICATED SNEAKER VAULT
                </span>
                <span className="badge-editorial">
                  SS26 CURATED RELEASE
                </span>
              </div>

              {/* Big, Confident Editorial Headline (Space Grotesk) */}
              <h1 style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(32px, 6.5vw, 76px)',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.02,
                letterSpacing: '-0.04em',
                marginBottom: '20px',
                textTransform: 'uppercase'
              }}>
                THE CULTURE<br />
                OF SNEAKERS.<br />
                <span style={{
                  color: 'transparent',
                  WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.85)',
                  letterSpacing: '-0.02em'
                }}>
                  REDEFINED.
                </span>
              </h1>

              <p style={{
                fontSize: 'clamp(14px, 1.2vw, 18px)',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: '560px',
                marginBottom: '26px',
                fontWeight: 400
              }}>
                Curated deadstock grails, multi-point physical authentication, and guaranteed zero ghost inventory. Built for collectors who demand purity.
              </p>

              {/* CTA Buttons with Scale & Shadow Motion */}
              <div className="hero-cta-group" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <Link
                  to="/products"
                  className="btn btn-primary btn-lg"
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    letterSpacing: '0.08em',
                    padding: '16px 36px',
                    fontSize: '14px',
                    borderRadius: 'var(--radius-card, 12px)',
                    minHeight: '48px'
                  }}
                >
                  EXPLORE VAULT <ArrowRight size={17} />
                </Link>

                <Link
                  to="/products?categoryId=1"
                  className="btn btn-secondary btn-lg"
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    letterSpacing: '0.08em',
                    padding: '16px 32px',
                    fontSize: '14px',
                    borderRadius: 'var(--radius-card, 12px)',
                    minHeight: '48px'
                  }}
                >
                  BASKETBALL ICONS
                </Link>
              </div>

              {/* Minimal Trust Micro-Metrics */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(14px, 3vw, 28px)',
                flexWrap: 'wrap',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>37</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>Flagship Models</p>
                </div>
                <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-subtle)' }} />
                <div>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>7</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>Certified Houses</p>
                </div>
                <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-subtle)' }} />
                <div>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '20px', fontWeight: 800, color: 'var(--status-success)' }}>100%</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>Deadstock Verified</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Sneaker Spotlight Card */}
            <div className="hero-card-col">
              <div style={{
                backgroundColor: '#14161F',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-card, 12px)',
                padding: '28px',
                boxShadow: 'var(--shadow-hover)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Top Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-family-display)',
                    fontWeight: 800,
                    color: 'var(--accent-primary)',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}>
                    {activeSpotlight.badge}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#FFFFFF'
                  }}>
                    {activeSpotlight.price}
                  </span>
                </div>

                {/* Floating Sneaker Stage */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1.2 / 1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle at 50% 50%, #242836 0%, #14161F 75%)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '22px'
                }}>
                  <img
                    key={activeSpotlight.imageUrl}
                    src={activeSpotlight.imageUrl}
                    alt={activeSpotlight.name}
                    style={{
                      width: '92%',
                      height: '92%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 20px 28px rgba(0, 0, 0, 0.7))',
                      animation: 'floatSneaker 6s ease-in-out infinite',
                      transition: 'transform 500ms var(--ease-spring)'
                    }}
                  />
                </div>

                {/* Sneaker Info & Price */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {activeSpotlight.brand}
                      </span>
                      <h3 style={{
                        fontFamily: 'var(--font-family-display)',
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        letterSpacing: '-0.02em',
                        marginTop: '2px'
                      }}>
                        {activeSpotlight.name}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {activeSpotlight.colorway}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                        Market Ask
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-family-mono)',
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#FFFFFF'
                      }}>
                        {activeSpotlight.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Model Selectors */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  {HERO_SPOTLIGHTS.map((spotlight, idx) => (
                    <button
                      key={spotlight.id}
                      onClick={() => setActiveSpotlightIdx(idx)}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-family-display)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: activeSpotlightIdx === idx ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                        color: activeSpotlightIdx === idx ? '#FFFFFF' : 'var(--text-secondary)',
                        border: activeSpotlightIdx === idx ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        transition: 'all 180ms ease'
                      }}
                    >
                      {spotlight.brand}
                    </button>
                  ))}
                </div>

                {/* Instant View CTA */}
                <Link
                  to={activeSpotlight.link}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '16px',
                    padding: '11px',
                    backgroundColor: '#1E222D',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'var(--font-family-display)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    transition: 'all 180ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1E222D';
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                  }}
                >
                  View Silhouette <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. BRAND CONSTELLATION STRIP — ALL 7 CERTIFIED HOUSES
          ========================================================================= */}
      <section style={{ padding: '0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            padding: '14px 20px',
            backgroundColor: '#12141C',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card, 12px)',
            boxShadow: 'var(--shadow-card)',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            <span style={{
              fontSize: '11px',
              fontFamily: 'var(--font-family-display)',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              whiteSpace: 'nowrap'
            }}>
              Certified Houses:
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {BRAND_HOUSES.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/products?brand=${encodeURIComponent(brand.name)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#1A1D26',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-family-display)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    transition: 'all 160ms ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1A1D26';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <span>{brand.name}</span>
                  <span style={{ fontSize: '9px', opacity: 0.6 }}>({brand.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. TRENDING RELEASES SECTION
          ========================================================================= */}
      <section style={{
        position: 'relative',
        padding: '0 0 24px 0',
        overflow: 'hidden'
      }}>
        {/* Atmospheric Faded Travis Mocha Background Texture */}
        <AtmosphericBackdrop
          imageUrl="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1400&auto=format&fit=crop&q=80"
          opacity={0.09}
          position="left"
          rotate="12deg"
          scale={1.25}
          gradientVariant="radial"
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Section Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '28px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '16px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--accent-primary)',
                fontSize: '11px',
                fontFamily: 'var(--font-family-display)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                marginBottom: '8px'
              }}>
                <Zap size={14} /> HIGH-VELOCITY RELEASES
              </div>
              <h2 style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(28px, 3.2vw, 42px)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                textTransform: 'uppercase'
              }}>
                Trending in Vault
              </h2>
            </div>

            <Link
              to="/products?sort=newest"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-family-display)',
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                padding: '8px 16px',
                borderRadius: 'var(--radius-card, 12px)',
                backgroundColor: '#161820',
                border: '1px solid var(--border-medium)',
                transition: 'all 200ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#161820';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }}
            >
              All Drops <ArrowRight size={14} />
            </Link>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="product-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: '390px', borderRadius: '12px' }} />
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {(featured.length > 0 ? featured.slice(0, 8) : HERO_SPOTLIGHTS).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          4. EDITORIAL BRAND SHOWCASE — HIGH-FASHION MAGAZINE WALL
          ========================================================================= */}
      <section style={{ padding: '0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '36px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '20px'
          }}>
            <div>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-family-display)',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                display: 'block',
                marginBottom: '6px'
              }}>
                Brand Architecture
              </span>
              <h2 style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(26px, 3vw, 38px)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                textTransform: 'uppercase'
              }}>
                The Seven Houses
              </h2>
            </div>
          </div>

          <div className="editorial-brands-grid">
            {EDITORIAL_BRANDS.map((brand) => (
              <Link
                key={brand.id}
                to={`/products?brand=${encodeURIComponent(brand.name)}`}
                style={{
                  gridColumn: brand.gridSpan,
                  position: 'relative',
                  backgroundColor: '#12141C',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-card, 12px)',
                  padding: 'clamp(24px, 4vw, 36px) clamp(18px, 3.5vw, 30px)',
                  overflow: 'hidden',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'all 280ms var(--ease-spring)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                  const img = e.currentTarget.querySelector('.brand-editorial-img');
                  if (img) {
                    img.style.opacity = '0.35';
                    img.style.transform = 'scale(1.1) rotate(-3deg)';
                    img.style.filter = 'grayscale(20%)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  const img = e.currentTarget.querySelector('.brand-editorial-img');
                  if (img) {
                    img.style.opacity = '0.14';
                    img.style.transform = 'scale(1) rotate(0deg)';
                    img.style.filter = 'grayscale(100%)';
                  }
                }}
              >
                {/* Atmospheric Faded Background Silhouette */}
                <img
                  className="brand-editorial-img"
                  src={brand.imageUrl}
                  alt={brand.name}
                  style={{
                    position: 'absolute',
                    right: '-10px',
                    bottom: '-15px',
                    width: '240px',
                    height: '160px',
                    objectFit: 'contain',
                    opacity: 0.14,
                    filter: 'grayscale(100%)',
                    transition: 'all 350ms var(--ease-spring)',
                    pointerEvents: 'none'
                  }}
                />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-family-display)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--accent-primary)',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    {brand.count}
                  </span>
                  <h3 style={{
                    fontFamily: 'var(--font-family-display)',
                    fontSize: 'clamp(24px, 2.5vw, 36px)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: '#FFFFFF',
                    lineHeight: 1
                  }}>
                    {brand.name}
                  </h3>
                </div>

                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '20px'
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {brand.tagline}
                  </span>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#1E212B',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}>
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. AUTHENTICITY & TRUST PROTOCOL BANNER
          ========================================================================= */}
      <section style={{ padding: '0' }}>
        <div className="container">
          <div style={{
            position: 'relative',
            backgroundColor: '#12141C',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card, 12px)',
            padding: '56px 48px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)'
          }}>
            {/* Faded Background Accent */}
            <AtmosphericBackdrop
              imageUrl="https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1000&auto=format&fit=crop&q=70"
              opacity={0.07}
              position="center"
              rotate="-5deg"
              scale={1.3}
              gradientVariant="vignette"
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ maxWidth: '640px', marginBottom: '44px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--status-success)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-family-display)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  marginBottom: '10px'
                }}>
                  <ShieldCheck size={15} /> VERIFIED DEADSTOCK GUARANTEE
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'clamp(28px, 3.2vw, 40px)',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  marginBottom: '14px',
                  textTransform: 'uppercase'
                }}>
                  No Fakes. No Ghost Inventory. Zero Compromise.
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Every pair that ships from the SneakX vault undergoes rigorous multi-point physical authentication: UV blacklight stitch inspection, weight variance check, font alignment audit, and RFID tamper-seal verification.
                </p>
              </div>

              {/* 4 Trust Pillars */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px'
              }}>
                <div style={{
                  padding: '22px',
                  backgroundColor: '#181A24',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px'
                }}>
                  <div style={{ color: 'var(--accent-primary)', marginBottom: '12px' }}>
                    <Award size={22} />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-family-display)', fontSize: '15px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                    Multi-Point Inspection
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Stitching, materials, insole typography, and box specifications inspected by specialists.
                  </p>
                </div>

                <div style={{
                  padding: '22px',
                  backgroundColor: '#181A24',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px'
                }}>
                  <div style={{ color: 'var(--status-success)', marginBottom: '12px' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-family-display)', fontSize: '15px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                    Tamper-Evident Seal
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Serialized authenticity tag permanently affixed. 100% money-back refund guarantee.
                  </p>
                </div>

                <div style={{
                  padding: '22px',
                  backgroundColor: '#181A24',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px'
                }}>
                  <div style={{ color: 'var(--status-info)', marginBottom: '12px' }}>
                    <Zap size={22} />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-family-display)', fontSize: '15px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                    Atomic Reservation
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Pessimistic database locks prevent overselling. If you buy it, it is guaranteed yours.
                  </p>
                </div>

                <div style={{
                  padding: '22px',
                  backgroundColor: '#181A24',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px'
                }}>
                  <div style={{ color: 'var(--status-warning)', marginBottom: '12px' }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-family-display)', fontSize: '15px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                    Brand Fit Advisor
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Predictive sizing algorithm offsets variance across Yeezy, Converse, and Nike lasts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FRESH ARRIVALS SECTION
          ========================================================================= */}
      <section style={{
        position: 'relative',
        padding: '20px 0',
        overflow: 'hidden'
      }}>
        {/* Atmospheric Faded New Balance 550 Texture Backdrop */}
        <AtmosphericBackdrop
          imageUrl="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1400&auto=format&fit=crop&q=80"
          opacity={0.08}
          position="right"
          rotate="-8deg"
          scale={1.2}
          gradientVariant="radial"
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '40px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '20px'
          }}>
            <div>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-family-display)',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                display: 'block',
                marginBottom: '6px'
              }}>
                Latest Intake
              </span>
              <h2 style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(28px, 3.2vw, 42px)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                textTransform: 'uppercase'
              }}>
                Fresh Vault Releases
              </h2>
            </div>

            <Link
              to="/products"
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 'var(--radius-card, 12px)' }}
            >
              Browse All 37 Silhouettes <ArrowRight size={14} />
            </Link>
          </div>

          <div className="product-grid">
            {(newReleases.length > 0 ? newReleases.slice(0, 4) : HERO_SPOTLIGHTS.slice(0, 4)).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
