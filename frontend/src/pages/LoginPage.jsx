import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '440px' }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-card, 12px)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-modal)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            SIGN IN
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Access your orders, wishlist, and bag
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.65)', pointerEvents: 'none' }} />
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '42px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.65)', pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '42px', paddingRight: '44px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'rgba(255, 255, 255, 0.55)',
                  transition: 'color 150ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '24px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
