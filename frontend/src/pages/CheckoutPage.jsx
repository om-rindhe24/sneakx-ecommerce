import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { addressService } from '../services/addressService';
import { couponService } from '../services/couponService';
import { ErrorBoundary } from '../components/ErrorBoundary';
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
  Wallet,
  MapPin,
  Plus,
  Tag,
  X
} from 'lucide-react';

export const CheckoutContent = () => {
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
    isDefault: false
  });

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Fetch saved addresses on mount for authenticated users
  useEffect(() => {
    let isMounted = true;
    const fetchAddresses = async () => {
      if (!user) {
        setIsAddingNewAddress(true);
        setSelectedAddressId('NEW');
        return;
      }

      try {
        setLoadingAddresses(true);
        const addresses = await addressService.getAddresses();
        if (isMounted) {
          const rawList = Array.isArray(addresses)
            ? addresses
            : (Array.isArray(addresses?.data) ? addresses.data : []);

          // Guarantee only one true default address exists (most recently added/top default)
          let foundDefault = false;
          const list = rawList.filter(Boolean).map((addr) => {
            if (addr?.isDefault && !foundDefault) {
              foundDefault = true;
              return { ...addr, isDefault: true };
            }
            return { ...addr, isDefault: false };
          });
          if (!foundDefault && list.length > 0) {
            list[0] = { ...list[0], isDefault: true };
          }

          setSavedAddresses(list);
          if (list.length > 0) {
            const defaultAddr = list.find((a) => a?.isDefault) || list[0];
            setSelectedAddressId(defaultAddr?.id || null);
            setIsAddingNewAddress(false);
          } else {
            setIsAddingNewAddress(true);
            setSelectedAddressId('NEW');
          }
        }
      } catch (err) {
        console.warn('[CHECKOUT-ADDRESS-FETCH-ERROR]', err);
        if (isMounted) {
          setSavedAddresses([]);
          setIsAddingNewAddress(true);
          setSelectedAddressId('NEW');
        }
      } finally {
        if (isMounted) {
          setLoadingAddresses(false);
        }
      }
    };

    fetchAddresses();
    return () => {
      isMounted = false;
    };
  }, [user]);

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

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);

  // Pricing Calculations with Coupon Discount
  const subtotal = Number(cart?.subtotal) || 0;
  const discountAmount = Number(appliedCoupon?.discountAmount) || 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shipping = cart?.shipping !== undefined ? Number(cart.shipping) : (subtotal >= 5000 ? 0 : 250);
  const finalTotal = Math.max(0, discountedSubtotal + shipping);

  const formattedFinalTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(finalTotal);
  const formattedTotal = formattedFinalTotal;

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await couponService.validateCoupon(code, subtotal);
      const couponData = res?.data || res;
      if (!couponData || !couponData.code) {
        throw new Error('Invalid coupon response received from server.');
      }
      setAppliedCoupon(couponData);
      setCouponSuccess(`✓ Coupon '${couponData.code}' applied successfully!`);
      setCouponCodeInput('');
    } catch (err) {
      console.error('[COUPON-ERROR]', err);
      const msg = err.response?.data?.message || err.message || 'Invalid coupon code';
      setCouponError(msg);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
    setCouponCodeInput('');
  };

  const validateInputs = () => {
    // If a saved address is chosen, no form inputs need validation
    if (!isAddingNewAddress && selectedAddressId && selectedAddressId !== 'NEW') {
      const selected = savedAddresses.find((a) => a.id === selectedAddressId);
      if (selected) {
        return true;
      }
    }

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

    // Resolve destination address payload
    const selectedSavedAddress = savedAddresses.find((a) => a.id === selectedAddressId);
    const isUsingSaved = !isAddingNewAddress && Boolean(selectedSavedAddress);
    const recipientName = (isUsingSaved ? selectedSavedAddress.fullName : shippingAddress.fullName) || user?.fullName || '';
    const recipientPhone = ((isUsingSaved ? (selectedSavedAddress.phone || selectedSavedAddress.phoneNumber) : shippingAddress.phone) || user?.phone || '').replace(/\D/g, '').slice(-10) || '9876543210';

    const checkoutAddressPayload = isUsingSaved
      ? { addressId: selectedSavedAddress.id }
      : {
          newAddress: {
            ...shippingAddress,
            saveAddress: saveAddressForFuture
          },
          saveAddress: saveAddressForFuture
        };

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
        // Step 1: Create Razorpay Order on Backend with Discounted Amount
        const paymentOrder = await paymentService.createOrder(finalTotal, appliedCoupon?.code);

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
          description: `SneakX Order - ${cart?.totalItems || cart?.items?.length || 0} Deadstock Sneaker Item(s)`,
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
                couponCode: appliedCoupon?.code,
                ...checkoutAddressPayload
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
            name: recipientName,
            email: user?.email || '',
            contact: recipientPhone
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
            customer_name: recipientName
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
          paymentMethod: 'COD',
          paymentReference: 'COD_VERIFIED',
          couponCode: appliedCoupon?.code,
          ...checkoutAddressPayload
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  1. Delivery Destination
                </h2>
                {user && savedAddresses.length > 0 && (
                  <span className="badge badge-info" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} /> {savedAddresses.length} Saved {savedAddresses.length === 1 ? 'Address' : 'Addresses'}
                  </span>
                )}
              </div>

              {/* Cancel add-new button to return to saved address list */}
              {isAddingNewAddress && savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewAddress(false);
                    const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
                    setSelectedAddressId(defaultAddr?.id || null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  Cancel & choose saved address
                </button>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              {isAddingNewAddress
                ? 'Fill out the delivery destination fields below.'
                : 'Select an address from your saved addresses, or add a new delivery location.'}
            </p>

            {loadingAddresses ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Loader2 size={18} className="spin-animation" />
                <span>Loading saved addresses...</span>
              </div>
            ) : !isAddingNewAddress && savedAddresses.length > 0 ? (
              /* Saved Address Cards Grid */
              <div className="checkout-row-2" style={{ gap: '14px' }}>
                {savedAddresses.filter(Boolean).map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedAddressId(addr.id); }}
                      className={`payment-card-option ${isSelected ? 'is-active-razorpay' : ''}`}
                      style={{
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {/* Top Header: Radio + Full Name + Default Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid var(--accent-primary)' : '2px solid var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isSelected && (
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
                            )}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {addr.fullName}
                          </span>
                        </div>

                        {addr.isDefault && (
                          <span style={{
                            fontSize: '9.5px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                            color: '#FFFFFF',
                            flexShrink: 0
                          }}>
                            Default
                          </span>
                        )}
                      </div>

                      {/* Address Details */}
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {addr.streetAddress}
                        </div>
                        <div>
                          {addr.city}, {addr.state} {addr.postalCode || addr.pinCode ? `- ${addr.postalCode || addr.pinCode}` : ''}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                          Phone: {addr.phone || addr.phoneNumber}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* + Add New Address Card */}
                <div
                  onClick={() => {
                    setIsAddingNewAddress(true);
                    setSelectedAddressId('NEW');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setIsAddingNewAddress(true); setSelectedAddressId('NEW'); } }}
                  className="payment-card-option"
                  style={{
                    padding: '20px 16px',
                    border: '1.5px dashed var(--border-medium)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    minHeight: '130px',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 59, 48, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Plus size={18} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                      + Add New Address
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Deliver to a new location
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Inline Address Form (for new users, guest users, or when "+ Add New Address" is active) */
              <div>
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

                {user && (
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="saveAddressCheckbox"
                      checked={saveAddressForFuture}
                      onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                      style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="saveAddressCheckbox" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Save this address to my profile for faster checkout next time
                    </label>
                  </div>
                )}
              </div>
            )}
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
            Order Items ({cart?.totalItems || cart?.items?.length || 0})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
            {cart?.items?.map((item) => (
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
                  ₹{(item.itemTotal != null ? Number(item.itemTotal) : 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon Input Section */}
          <div style={{
            padding: '14px 16px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              <Tag size={15} color="var(--accent-primary)" />
              <span>Apply Coupon</span>
            </div>

            {!appliedCoupon ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => {
                    setCouponCodeInput(e.target.value.toUpperCase());
                    if (couponError) setCouponError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  placeholder="Enter coupon code"
                  className="form-input coupon-input"
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontFamily: couponCodeInput ? 'var(--font-family-mono)' : 'inherit',
                    textTransform: couponCodeInput ? 'uppercase' : 'none',
                    letterSpacing: couponCodeInput ? '0.05em' : 'normal',
                    height: '38px',
                    flex: 1
                  }}
                  disabled={couponLoading}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCodeInput.trim()}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    height: '38px',
                    minWidth: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={15} color="var(--status-success)" />
                  <div>
                    <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 800, fontSize: '13px', color: 'var(--status-success)' }}>
                      {appliedCoupon.code}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                      (-₹{(Number(appliedCoupon.discountAmount) || 0).toLocaleString('en-IN')})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title="Remove coupon"
                >
                  <X size={13} /> Remove
                </button>
              </div>
            )}

            {/* Coupon Inline Error Message */}
            {couponError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-primary)', marginTop: '2px' }}>
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                <span>{couponError}</span>
              </div>
            )}

            {/* Coupon Inline Success Message */}
            {couponSuccess && !couponError && (
              <div style={{ fontSize: '12px', color: 'var(--status-success)', marginTop: '2px' }}>
                {couponSuccess}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
                ₹{(cart?.subtotal != null ? Number(cart.subtotal) : subtotal).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Discount Row (Visible only when valid coupon applied) */}
            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>Discount ({appliedCoupon.code})</span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    Remove
                  </button>
                </div>
                <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--status-success)', fontWeight: 700 }}>
                  -₹{(Number(appliedCoupon.discountAmount) || 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Tax:</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Included in price (18% GST)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', color: shipping === 0 ? 'var(--status-success)' : 'var(--text-primary)', fontWeight: 600 }}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <span>Final Total</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--accent-primary)' }}>{formattedFinalTotal}</span>
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
            disabled={processing || !cart?.items || cart.items.length === 0}
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

export const CheckoutPage = (props) => (
  <ErrorBoundary
    title="Checkout Temporarily Unavailable"
    message="We encountered an issue preparing your checkout session. Your cart items are completely safe."
  >
    <CheckoutContent {...props} />
  </ErrorBoundary>
);
