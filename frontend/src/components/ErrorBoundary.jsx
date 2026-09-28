import React from 'react';
import { AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="container"
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 16px'
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              backgroundColor: 'var(--bg-card, #161820)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              borderRadius: 'var(--radius-lg, 16px)',
              padding: 'clamp(24px, 5vw, 40px)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card, 0 8px 32px rgba(0, 0, 0, 0.4))'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 59, 48, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}
            >
              <AlertCircle size={28} color="var(--accent-primary, #FF3B30)" />
            </div>

            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--text-primary, #FFFFFF)',
                marginBottom: '10px'
              }}
            >
              {this.props.title || 'Checkout Temporarily Unavailable'}
            </h2>

            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary, #A0A5B5)',
                lineHeight: 1.6,
                marginBottom: '28px'
              }}
            >
              {this.props.message ||
                "We encountered a hiccup while loading your checkout session. Your cart items are completely safe."}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontWeight: 700
                }}
              >
                <RefreshCw size={15} />
                Try Again
              </button>

              <a
                href="/cart"
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <ShoppingBag size={15} />
                Return to Cart
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
