import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { AtmosphericBackdrop } from './AtmosphericBackdrop';
import api from '../services/api';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email: trimmed });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer style={{
      backgroundColor: '#07080A',
      borderTop: '1px solid var(--border-subtle)',
      padding: '80px 0 40px 0',
      marginTop: '120px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle Atmospheric Sneaker Background Silhouette in Footer */}
      <AtmosphericBackdrop
        imageUrl="https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=1000&auto=format&fit=crop&q=70"
        opacity={0.06}
        position="bottom-right"
        rotate="12deg"
        scale={1.3}
        gradientVariant="vignette"
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Newsletter / Drop Alerts Banner */}
        <div style={{
          padding: '40px 36px',
          marginBottom: '64px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          alignItems: 'center',
          gap: '32px',
          backgroundColor: '#12141C',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card, 12px)',
          boxShadow: 'var(--shadow-card)'
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
              <Zap size={14} /> VIP SHOCK DROP ALERTS
            </div>
            <h3 style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '24px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              marginBottom: '8px'
            }}>
              Never Miss Verified Grails & Restocks.
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '440px' }}>
              Instant notifications the moment authenticated deadstock pairs pass inspection and enter live inventory.
            </p>
          </div>

          <div>
            {subscribed ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 20px',
                borderRadius: 'var(--radius-btn, 10px)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--status-success)'
              }}>
                <CheckCircle2 size={18} />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>
                  Subscribed to SneakX VIP Drop Alerts! Welcome email dispatched.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '460px' }}>
                <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      placeholder="Enter collector email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                      style={{
                        width: '100%',
                        backgroundColor: '#1A1D26',
                        border: error ? '1px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-btn, 10px)',
                        padding: '13px 14px 13px 40px',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ padding: '0 24px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <span>Join</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                {error && (
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    paddingLeft: '4px'
                  }}>
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4-Column Navigation Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '48px',
          marginBottom: '64px'
        }}>
          {/* Brand Col */}
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', marginBottom: '16px' }}>
              <span style={{
                fontFamily: 'var(--font-family-display)',
                fontWeight: 800,
                fontSize: '24px',
                letterSpacing: '-0.04em',
                color: '#FFFFFF'
              }}>
                SNEAK<span style={{ color: 'var(--accent-primary)' }}>X</span>
              </span>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                marginBottom: '10px'
              }} />
            </Link>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '280px' }}>
              The definitive luxury sneaker platform engineered for collectors. 100% verified deadstock, zero ghost stock, and atomic reservation checkout.
            </p>
          </div>

          {/* Explore Collections */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '12px',
              fontWeight: 800,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: '18px'
            }}>
              Silhouettes
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/products" style={{ fontSize: '13px', color: 'var(--text-secondary)', transition: 'color 150ms' }} onMouseEnter={(e) => e.target.style.color = '#FFFFFF'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>All 37 Grails</Link></li>
              <li><Link to="/products?categoryId=1" style={{ fontSize: '13px', color: 'var(--text-secondary)', transition: 'color 150ms' }} onMouseEnter={(e) => e.target.style.color = '#FFFFFF'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Basketball Court Icons</Link></li>
              <li><Link to="/products?categoryId=2" style={{ fontSize: '13px', color: 'var(--text-secondary)', transition: 'color 150ms' }} onMouseEnter={(e) => e.target.style.color = '#FFFFFF'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Streetwear & Lifestyle</Link></li>
              <li><Link to="/products?categoryId=3" style={{ fontSize: '13px', color: 'var(--text-secondary)', transition: 'color 150ms' }} onMouseEnter={(e) => e.target.style.color = '#FFFFFF'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>High-Mileage Running</Link></li>
              <li><Link to="/products?sort=newest" style={{ fontSize: '13px', color: 'var(--text-secondary)', transition: 'color 150ms' }} onMouseEnter={(e) => e.target.style.color = '#FFFFFF'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Fresh Vault Arrivals</Link></li>
            </ul>
          </div>

          {/* Assurance & Quality */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '12px',
              fontWeight: 800,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: '18px'
            }}>
              Verification
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Physical Multi-Point Inspection</span></li>
              <li><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Brand Sizing Fit Advisor</span></li>
              <li><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Tamper-Evident Packaging</span></li>
              <li><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Safe Demo Payment Simulation</span></li>
              <li><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Zero Ghost Stock Guarantee</span></li>
            </ul>
          </div>

          {/* Technical Architecture */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '12px',
              fontWeight: 800,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: '18px'
            }}>
              Platform Core
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Engineered with <strong style={{ color: 'var(--text-secondary)' }}>Java 24, Spring Boot 3, Spring Security JWT, Hibernate 6, MySQL 8 / H2, and React 18 (Vite)</strong>.
              Features ACID transaction guarantees, pessimistic variant locks, and resilient fallback mail delivery.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Trust Badges & Copyright */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <p>© 2026 SneakX Inc. Authenticated luxury sneaker platform.</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <Lock size={13} /> 256-Bit SSL Encrypted
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--status-success)' }}>
              <ShieldCheck size={14} /> PCI-DSS Safe Demo
            </span>
            <span style={{ color: 'var(--text-muted)' }}>UPI / Card / COD Accepted</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
