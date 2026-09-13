import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Lock,
  Loader2,
  ChevronRight,
  Info,
  ExternalLink,
  Building2,
  Wallet
} from 'lucide-react';

export const CheckoutPage = () => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Address State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: true
  });

  // Pre-fill user profile if available
  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  // Payment Selection State: 'RAZORPAY' or 'COD'
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');

  // Processing & Error States
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState(null);

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(cart.total || 0);

  const validateInputs = () => {
    if (
      !shippingAddress.fullName?.trim() ||
      !shippingAddress.phone?.trim() ||
      !shippingAddress.streetAddress?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.state?.trim() ||
      !shippingAddress.postalCode?.trim()
    ) {
      setError('Please complete all required shipping address fields.');
      return false;
    }
    return true;
  };

  const handleProceedPayment = async (e) => {
    e.preventDefault();
    setError(null);

    if (!cart.items || cart.items.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    if (!validateInputs()) {
      return;
    }

    // -------------------------------------------------------------
    // FLOW 1: Authentic Razorpay Gateway Integration (Test Mode)
    // -------------------------------------------------------------
    if (paymentMethod === 'RAZORPAY') {
      if (typeof window.Razorpay === 'undefined') {
        setError('Razorpay SDK is currently loading. Please check your internet connection and refresh.');
        return;
      }

      setProcessing(true);
      setProcessingStep('Initiating secure Razorpay checkout order...');

      try {
        // Step 1: Create Razorpay Order on Backend
        const paymentOrder = await paymentService.createOrder(cart.total);

        if (!paymentOrder || !paymentOrder.orderId) {
          throw new Error('Could not generate Razorpay order. Please try again.');
        }

        setProcessingStep('Opening Razorpay Secure Gateway modal...');

        // Step 2: Configure Razorpay Standard Checkout modal
        const options = {
          key: paymentOrder.keyId,
          amount: paymentOrder.amountInPaise,
          currency: paymentOrder.currency || 'INR',
          name: 'SneakX',
          description: `SneakX Order - ${cart.totalItems} Deadstock Sneaker Item(s)`,
          image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=200&auto=format&fit=crop&q=80',
          order_id: paymentOrder.orderId,
          handler: async function (response) {
            setProcessing(true);
            setProcessingStep('Cryptographically verifying payment signature with server...');

            try {
              // Step 3: Backend signature verification & atomic order placement
              const confirmedOrder = await paymentService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                newAddress: shippingAddress
              });

              await refreshCart();
              navigate(`/order-confirmation/${confirmedOrder.orderNumber}`, { state: { order: confirmedOrder } });
            } catch (verifyErr) {
              console.error('[RAZORPAY-VERIFY-ERROR]', verifyErr);
              setError(
                verifyErr.response?.data?.message ||
                verifyErr.message ||
                'Payment signature verification failed. Please try again.'
              );
              setProcessing(false);
              setProcessingStep('');
            }
          },
          prefill: {
            name: shippingAddress.fullName || user?.fullName || '',
            email: user?.email || '',
            contact: (shippingAddress.phone || user?.phone || '').replace(/\D/g, '').slice(-10) || '9876543210'
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'Pay using UPI',
                  instruments: [
                    {
                      method: 'upi',
                      flows: ['qr', 'intent']
                    }
                  ]
                },
                other: {
                  name: 'Cards, Netbanking & Wallets',
                  instruments: [
                    { method: 'card' },
                    { method: 'netbanking' },
                    { method: 'wallet' }
                  ]
                }
              },
              sequence: ['block.upi', 'block.other'],
              preferences: {
                show_default_blocks: true
              }
            }
          },
          notes: {
            merchant_reference: 'SneakX Official Store',
            customer_name: shippingAddress.fullName
          },
          theme: {
            color: '#FF3B30'
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
              setProcessingStep('');
              setError('Payment window was dismissed. You can retry when ready.');
            }
          }
        };

        const rzp = new window.Razorpay(options);

        rzp.on('payment.failed', function (response) {
          setProcessing(false);
          setProcessingStep('');
          const desc = response.error?.description || response.error?.reason || 'Payment was declined by issuing bank';
          setError(`Payment Failed: ${desc}. Please try again.`);
        });

        rzp.open();
      } catch (err) {
        console.error('[RAZORPAY-INIT-ERROR]', err);
        setError(err.response?.data?.message || err.message || 'Failed to initiate Razorpay payment. Please retry.');
        setProcessing(false);
        setProcessingStep('');
      }
    } else {
      // -------------------------------------------------------------
      // FLOW 2: Cash on Delivery (COD) Checkout
      // -------------------------------------------------------------
      setProcessing(true);
      setProcessingStep('Validating delivery address & confirming COD order...');

      try {
        const order = await orderService.checkout({
          newAddress: shippingAddress,
          paymentMethod: 'COD',
          paymentReference: 'COD_VERIFIED'
        });

        await refreshCart();
        navigate(`/order-confirmation/${order.orderNumber}`, { state: { order } });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to place order. Check inventory availability.');
      } finally {
        setProcessing(false);
        setProcessingStep('');
      }
    }
  };

  return (
    <div className="container" style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 3.5vw, 24px)', maxWidth: '1120px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Checkout & Payment
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Review your delivery destination and complete your order with authentic Razorpay payment gateway
        </p>
      </div>

      <div className="checkout-grid">
        {/* Left Column: Delivery Address & Payment Method */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minWidth: 0, width: '100%' }}>

          {/* Section 1: Delivery Destination */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            padding: 'clamp(16px, 3.5vw, 24px)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              1. Delivery Destination
            </h2>

            <div className="checkout-row-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px', marginBottom: 0 }}>
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Flat / House No., Street, Landmark"
                value={shippingAddress.streetAddress}
                onChange={(e) => setShippingAddress({ ...shippingAddress, streetAddress: e.target.value })}
                required
              />
            </div>

            <div className="checkout-row-3" style={{ marginTop: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bengaluru"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Karnataka"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">PIN Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 560001"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method Selection */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            padding: 'clamp(16px, 3.5vw, 24px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                2. Choose Payment Method
              </h2>
              <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                <ShieldCheck size={12} /> Razorpay Test Mode • No Real Money
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Select your preferred payment option below. All transactions are encrypted and processed through our verified gateway.
            </p>

            {/* Payment Method Selector Cards */}
            <div className="checkout-row-2" style={{ marginBottom: '20px' }}>
              {/* Razorpay Online Gateway Option */}
              <div
                onClick={() => setPaymentMethod('RAZORPAY')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPaymentMethod('RAZORPAY'); }}
                className={`payment-card-option ${paymentMethod === 'RAZORPAY' ? 'is-active-razorpay' : ''}`}
              >
                {/* Header Row: Radio selector + Icons + Recommended Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Visual Radio Indicator */}
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: paymentMethod === 'RAZORPAY' ? '2px solid var(--accent-primary)' : '2px solid var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {paymentMethod === 'RAZORPAY' && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
                      )}
                    </div>
                    <CreditCard size={20} color={paymentMethod === 'RAZORPAY' ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                  </div>

                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: paymentMethod === 'RAZORPAY' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                    color: '#FFFFFF'
                  }}>
                    Recommended
                  </span>
                </div>

                {/* Title & Microcopy */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                    Razorpay Secure Checkout
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Credit & Debit Cards, NetBanking, Wallets
                  </div>
                </div>

                {/* Accepted Payment Network Badges Row */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px', paddingTop: '4px' }}>
                  {/* Visa Badge */}
                  <span className="payment-pill-badge" style={{ backgroundColor: '#1434CB', color: '#FFFFFF', fontStyle: 'italic', fontWeight: 900, fontSize: '9px', letterSpacing: '0.04em' }}>
                    VISA
                  </span>

                  {/* Mastercard Badge */}
                  <span className="payment-pill-badge" style={{ backgroundColor: '#1C1C1C', border: '1px solid rgba(255,255,255,0.14)', padding: '0 5px' }} title="Mastercard">
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#EB001B', display: 'inline-block' }} />
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#F79E1B', display: 'inline-block', marginLeft: '-4px' }} />
                  </span>

                  {/* RuPay Badge */}
                  <span className="payment-pill-badge" style={{ backgroundColor: '#0B2046', border: '1px solid rgba(255,255,255,0.12)', padding: '0 5px' }} title="RuPay">
                    <span style={{ color: '#00A859', fontWeight: 800, fontSize: '9px' }}>Ru</span>
                    <span style={{ color: '#F37021', fontWeight: 800, fontSize: '9px' }}>Pay</span>
                  </span>

                  {/* Top Indian Banks */}
                  <span className="payment-pill-badge" style={{ backgroundColor: '#004C8F', color: '#FFFFFF', fontWeight: 700, fontSize: '8.5px', padding: '0 5px' }} title="HDFC Bank">
                    HDFC
                  </span>
                  <span className="payment-pill-badge" style={{ backgroundColor: '#1D4F91', color: '#FFFFFF', fontWeight: 700, fontSize: '8.5px', padding: '0 5px' }} title="SBI">
                    SBI
                  </span>
                  <span className="payment-pill-badge" style={{ backgroundColor: '#BD1C24', color: '#FFFFFF', fontWeight: 700, fontSize: '8.5px', padding: '0 5px' }} title="ICICI Bank">
                    ICICI
                  </span>
                  <span className="payment-pill-badge" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '9px' }}>
                    <Building2 size={9} color="var(--text-muted)" />
                    <span>50+ Banks</span>
                  </span>

                  {/* Wallets */}
                  <span className="payment-pill-badge" style={{ backgroundColor: '#002E6E', color: '#00BAF2', fontWeight: 800, fontSize: '8.5px', padding: '0 5px' }} title="Paytm">
                    paytm
                  </span>
                  <span className="payment-pill-badge" style={{ backgroundColor: '#232F3E', color: '#FF9900', fontWeight: 700, fontSize: '8.5px', padding: '0 5px' }} title="Amazon Pay">
                    amazon<span style={{ color: '#FFFFFF' }}>pay</span>
                  </span>
                  <span className="payment-pill-badge" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '9px' }}>
                    <Wallet size={9} color="var(--text-muted)" />
                    <span>Wallets</span>
                  </span>
                </div>
              </div>

              {/* COD Option */}
              <div
                onClick={() => setPaymentMethod('COD')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPaymentMethod('COD'); }}
                className={`payment-card-option ${paymentMethod === 'COD' ? 'is-active-cod' : ''}`}
              >
                {/* Header Row: Radio selector + Icon + Doorstep Tag */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Visual Radio Indicator */}
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: paymentMethod === 'COD' ? '2px solid var(--status-success)' : '2px solid var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {paymentMethod === 'COD' && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
                      )}
                    </div>
                    <Banknote size={20} color={paymentMethod === 'COD' ? 'var(--status-success)' : 'var(--text-secondary)'} />
                  </div>

                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--status-success)'
                  }}>
                    Doorstep
                  </span>
                </div>

                {/* Title & Microcopy */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                    Cash on Delivery (COD)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Pay in cash or via UPI QR at your doorstep
                  </div>
                </div>

                {/* Features Row */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
                  <span className="payment-pill-badge" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <Banknote size={11} color="var(--status-success)" />
                    <span>Cash</span>
                  </span>
                  <span className="payment-pill-badge" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <Smartphone size={11} color="var(--status-success)" />
                    <span>Doorstep QR</span>
                  </span>
                  <span className="payment-pill-badge" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <span>Double-Box Delivery</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details Container */}
            <div style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-card, 12px)',
              padding: '20px'
            }}>
              {/* Razorpay Gateway Explanation & Method Pillars */}
              {paymentMethod === 'RAZORPAY' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '14px',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lock size={15} color="var(--accent-primary)" />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Secure Razorpay Checkout Gateway
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        color: 'var(--status-success)',
                        fontWeight: 600
                      }}>
                        <ShieldCheck size={14} /> 100% Secure Payments
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: 'var(--text-muted)'
                      }}>
                        <Lock size={11} /> 256-bit SSL encrypted
                      </span>
                    </div>
                  </div>

                  {/* 3 Pillars Breakdown */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    {/* Pillar 1: Cards */}
                    <div style={{
                      padding: '14px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <CreditCard size={14} color="var(--accent-primary)" /> Credit & Debit Cards
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        Visa, Mastercard, RuPay & Maestro with 3D Secure OTP authentication.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '4px' }}>
                        <span className="payment-pill-badge" style={{ backgroundColor: '#1434CB', color: '#FFFFFF', fontStyle: 'italic', fontWeight: 900, fontSize: '8.5px' }}>VISA</span>
                        <span className="payment-pill-badge" style={{ backgroundColor: '#1C1C1C', border: '1px solid rgba(255,255,255,0.14)', padding: '0 4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EB001B', display: 'inline-block' }} />
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F79E1B', display: 'inline-block', marginLeft: '-3px' }} />
                        </span>
                        <span className="payment-pill-badge" style={{ backgroundColor: '#0B2046', padding: '0 4px', fontSize: '8.5px' }}>
                          <span style={{ color: '#00A859', fontWeight: 800 }}>Ru</span><span style={{ color: '#F37021', fontWeight: 800 }}>Pay</span>
                        </span>
                      </div>
                    </div>

                    {/* Pillar 2: NetBanking */}
                    <div style={{
                      padding: '14px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <Building2 size={14} color="var(--accent-primary)" /> NetBanking (50+ Banks)
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        Direct bank gateway access for HDFC, SBI, ICICI, Axis, Kotak & 50+ major banks.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '4px' }}>
                        <span className="payment-pill-badge" style={{ backgroundColor: '#004C8F', color: '#FFFFFF', fontWeight: 700, fontSize: '8px', padding: '0 4px' }}>HDFC</span>
                        <span className="payment-pill-badge" style={{ backgroundColor: '#1D4F91', color: '#FFFFFF', fontWeight: 700, fontSize: '8px', padding: '0 4px' }}>SBI</span>
                        <span className="payment-pill-badge" style={{ backgroundColor: '#BD1C24', color: '#FFFFFF', fontWeight: 700, fontSize: '8px', padding: '0 4px' }}>ICICI</span>
                        <span className="payment-pill-badge" style={{ backgroundColor: '#97144D', color: '#FFFFFF', fontWeight: 700, fontSize: '8px', padding: '0 4px' }}>AXIS</span>
                      </div>
                    </div>

                    {/* Pillar 3: Wallets */}
                    <div style={{
                      padding: '14px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <Wallet size={14} color="var(--accent-primary)" /> Digital Wallets
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        Instant one-tap checkout via Paytm, Amazon Pay, MobiKwik, and partner wallets.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '4px' }}>
                        <span className="payment-pill-badge" style={{ backgroundColor: '#002E6E', color: '#00BAF2', fontWeight: 800, fontSize: '8px', padding: '0 4px' }}>paytm</span>
                        <span className="payment-pill-badge" style={{ backgroundColor: '#232F3E', color: '#FF9900', fontWeight: 700, fontSize: '8px', padding: '0 4px' }}>amazon</span>
                        <span className="payment-pill-badge" style={{ backgroundColor: '#1B3564', color: '#29B6F6', fontWeight: 700, fontSize: '8px', padding: '0 4px' }}>mobikwik</span>
                      </div>
                    </div>
                  </div>

                  {/* Confident Instruction text */}
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Clicking <strong style={{ color: 'var(--text-primary)' }}>PAY {formattedTotal} VIA RAZORPAY →</strong> opens the official 256-bit encrypted Razorpay checkout modal supporting Credit/Debit Cards, NetBanking, and Digital Wallets.
                  </p>

                  {/* Trust Footer Bar */}
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={15} color="var(--status-success)" />
                      <span>
                        <strong style={{ color: 'var(--text-primary)' }}>100% Secure Payments</strong> • 256-bit SSL encrypted • Zero card credentials stored on server
                      </span>
                    </div>
                    {/* Realistic Razorpay Badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#0C2340',
                      border: '1px solid rgba(51, 149, 255, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}>
                      <span style={{ fontSize: '10px', color: '#8898AA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Secured by
                      </span>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle' }}>
                          <path d="M14.5 2L5 13.5H12L10.5 22L19.5 9.5H13.2L14.5 2Z" fill="#3395FF" />
                        </svg>
                        <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '11px', letterSpacing: '-0.01em', fontFamily: 'system-ui, sans-serif' }}>
                          Razorpay
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* COD Payment Section */}
              {paymentMethod === 'COD' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} color="var(--status-success)" />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Cash on Delivery Selected
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--status-success)', fontWeight: 600 }}>
                      No Online Advance Required
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Keep the exact amount of <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-family-mono)' }}>{formattedTotal}</strong> ready for payment upon delivery.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px'
                  }}>
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <Banknote size={20} color="var(--status-success)" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Cash Accepted</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hand cash to delivery courier</div>
                      </div>
                    </div>

                    <div style={{
                      padding: '12px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <Smartphone size={20} color="var(--status-success)" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Doorstep UPI QR</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scan courier's QR with any app</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📦</span>
                    <span>Your deadstock pair is reserved instantly and dispatched in double-boxed packaging within 24–48 hours.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Pricing Breakdown */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: 'clamp(16px, 3.5vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Order Items ({cart.totalItems})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
            {cart.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  style={{ width: '48px', height: '48px', objectFit: 'contain', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '4px' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{item.productName}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>US {item.size} • Qty {item.quantity}</p>
                </div>
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  ₹{item.itemTotal?.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>₹{cart.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', color: cart.shipping === 0 ? 'var(--status-success)' : 'var(--text-primary)', fontWeight: 600 }}>
                {cart.shipping === 0 ? 'FREE' : `₹${cart.shipping}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <span>Final Total</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--accent-primary)' }}>{formattedTotal}</span>
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 59, 48, 0.12)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              color: 'var(--accent-primary)',
              fontSize: '13px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          {/* Processing State Indicator */}
          {processing && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(230, 255, 0, 0.1)',
              border: '1px solid rgba(230, 255, 0, 0.3)',
              color: 'var(--accent-volt, #E6FF00)',
              fontSize: '13px'
            }}>
              <Loader2 size={16} className="animate-spin" />
              <span>{processingStep}</span>
            </div>
          )}

          {/* Checkout Button */}
          <button
            type="button"
            onClick={handleProceedPayment}
            disabled={processing || !cart.items || cart.items.length === 0}
            className="btn btn-primary btn-lg touch-target"
            style={{ width: '100%', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
          >
            {processing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : paymentMethod === 'COD' ? (
              <>
                <span>Confirm COD Order ({formattedTotal})</span>
                <ChevronRight size={18} />
              </>
            ) : (
              <>
                <Lock size={16} />
                <span>PAY {formattedTotal} VIA RAZORPAY →</span>
              </>
            )}
          </button>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
            By placing this order you lock deadstock inventory with atomic transaction integrity.
          </p>
        </div>
      </div>
    </div>
  );
};
