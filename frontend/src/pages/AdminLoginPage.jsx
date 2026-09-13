import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser && (loggedUser.roles?.includes('ADMIN') || loggedUser.roles?.includes('ROLE_ADMIN'))) {
        navigate(from, { replace: true });
      } else {
        setError('Access denied. This portal is restricted to authorized SneakX administrators.');
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials');
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 59, 48, 0.08)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Shield size={22} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Admin Portal Access
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Restricted management console for SneakX operations
          </p>
        </div>

        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                placeholder="admin@sneakx.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
          >
            {loading ? 'Verifying Credentials...' : 'Sign In to Admin'} <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '24px' }}>
          Customer looking to sign in?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Customer Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
