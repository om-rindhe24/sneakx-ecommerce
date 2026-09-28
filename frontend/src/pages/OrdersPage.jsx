import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Package, Calendar, MapPin, CreditCard, ChevronRight, AlertCircle, X, CheckCircle2 } from 'lucide-react';

const CANCELLATION_REASONS = [
  'Ordered by mistake',
  'Found a better price',
  'Delivery too slow',
  'Changed my mind',
  'Other'
];

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrders();
        // Support both direct array and API response wrapped in data
        const orderList = Array.isArray(data) ? data : (data?.data || []);
        setOrders(orderList);
      } catch (err) {
        console.error('Failed to load customer orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleOpenCancelModal = (order) => {
    setSelectedOrder(order);
    setSelectedReason(CANCELLATION_REASONS[0]);
    setCancelError(null);
  };

  const handleCloseCancelModal = () => {
    if (cancelling) return;
    setSelectedOrder(null);
    setCancelError(null);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;
    try {
      setCancelling(true);
      setCancelError(null);

      const res = await orderService.cancelOrder(selectedOrder.id, selectedReason);
      const updatedOrder = res?.data || res;

      // Update in local state
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, ...updatedOrder } : o));

      setSuccessBanner(`Order #${selectedOrder.orderNumber} has been successfully cancelled.`);
      setSelectedOrder(null);

      // Auto-hide success banner after 6 seconds
      setTimeout(() => setSuccessBanner(null), 6000);
    } catch (err) {
      console.error('Cancellation failed', err);
      setCancelError(err.response?.data?.message || err.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving purchase history..." />;
  }

  const cancellableStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PLACED'];

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '960px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        My Orders
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Track shipments and historical order snapshots
      </p>

      {successBanner && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--status-success)',
          fontSize: '14px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{successBanner}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '64px 24px',
          textAlign: 'center'
        }}>
          <Package size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>No Orders Placed Yet</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            You haven't copped any pairs yet. Explore the latest drops.
          </p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map((order) => {
            const isCancelled = order.status === 'CANCELLED';
            const isCancellable = cancellableStatuses.includes(order.status?.toUpperCase());

            const statusColor = order.status === 'DELIVERED'
              ? 'badge-success'
              : isCancelled
                ? 'badge-danger'
                : 'badge-warning';

            const isCod = order.paymentMethod?.toUpperCase() === 'COD' ||
                          order.refundStatus === 'NO_REFUND_REQUIRED';

            return (
              <div key={order.id} style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  padding: '16px 24px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking ID</span>
                      <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {order.orderNumber}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    {order.couponCode && order.discountAmount > 0 && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--status-success)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {order.couponCode} (-₹{Number(order.discountAmount)?.toLocaleString('en-IN')})
                      </span>
                    )}
                    <span className={`badge ${statusColor}`}>{order.status}</span>
                    <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '16px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Cancelled Alert Box */}
                {isCancelled && (
                  <div style={{
                    margin: '16px 24px 0 24px',
                    padding: '14px 18px',
                    backgroundColor: 'rgba(255, 59, 48, 0.08)',
                    border: '1px solid rgba(255, 59, 48, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          backgroundColor: 'var(--status-danger)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Cancelled
                        </span>
                        {order.cancellationReason && (
                          <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                            Reason: "{order.cancellationReason}"
                          </span>
                        )}
                      </div>
                      {order.cancelledAt && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(order.cancelledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>

                    {/* Refund info */}
                    <div style={{
                      marginTop: '6px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 59, 48, 0.15)',
                      fontSize: '12px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '14px'
                    }}>
                      {isCod ? (
                        <span style={{ color: 'var(--text-muted)' }}>
                          Payment Method: Cash on Delivery • <strong>No payment to refund</strong>
                        </span>
                      ) : (
                        <>
                          <span>
                            <span style={{ color: 'var(--text-muted)' }}>Refund Amount: </span>
                            <strong style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--status-success)' }}>
                              ₹{(order.refundAmount ?? order.totalAmount)?.toLocaleString('en-IN')}
                            </strong>
                          </span>
                          <span>
                            <span style={{ color: 'var(--text-muted)' }}>Refund Status: </span>
                            <span style={{
                              color: order.refundStatus === 'PROCESSED' ? 'var(--status-success)' : 'var(--accent-volt)',
                              fontWeight: 700,
                              textTransform: 'uppercase'
                            }}>
                              {order.refundStatus || 'PROCESSED'}
                            </span>
                          </span>
                          {order.refundId && (
                            <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--text-muted)' }}>
                              Ref: {order.refundId}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-card)' }}>
                  {order.items?.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '68px',
                        height: '68px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '6px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.productName}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Size: UK {item.size} • Color: {item.colorway} • Qty: {item.quantity}
                        </p>
                      </div>

                      <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{item.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer / Address info & Actions */}
                <div style={{
                  padding: '14px 24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={15} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                    <span>
                      Delivering to <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.shippingAddress?.fullName}</strong> — {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                    </span>
                  </div>

                  {/* Cancel Order Button: only for cancellable orders */}
                  {isCancellable && (
                    <button
                      type="button"
                      id={`cancel-order-btn-${order.id}`}
                      onClick={() => handleOpenCancelModal(order)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 59, 48, 0.4)',
                        color: 'var(--status-danger)',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.12)';
                        e.currentTarget.style.borderColor = 'var(--status-danger)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.4)';
                      }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            padding: '28px',
            maxWidth: '460px',
            width: '100%',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 59, 48, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--status-danger)'
                }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Cancel Order?
                  </h3>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-family-mono)', color: 'var(--text-muted)' }}>
                    #{selectedOrder.orderNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseCancelModal}
                disabled={cancelling}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to cancel this order? This action cannot be undone. Reserved sneaker sizes will be immediately returned to active inventory.
            </p>

            {/* Refund note in modal */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              fontSize: '12px',
              marginBottom: '20px'
            }}>
              {selectedOrder.paymentMethod?.toUpperCase() === 'COD' ? (
                <div style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Payment: </strong>
                  Cash on Delivery (No payment was collected, so no refund is required).
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Refund: </strong>
                  Full amount of <strong style={{ color: 'var(--status-success)' }}>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</strong> will be refunded to your original payment method.
                </div>
              )}
            </div>

            {/* Cancellation Reason Dropdown */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="cancel-reason-select" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Reason for cancellation (optional)
              </label>
              <select
                id="cancel-reason-select"
                className="form-select"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                disabled={cancelling}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                {CANCELLATION_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {cancelError && (
              <div style={{
                backgroundColor: 'rgba(255, 59, 48, 0.1)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: 'var(--status-danger)',
                fontSize: '12px',
                marginBottom: '18px'
              }}>
                {cancelError}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCloseCancelModal}
                disabled={cancelling}
                style={{ minWidth: '100px' }}
              >
                Keep Order
              </button>
              <button
                type="button"
                id="confirm-cancel-order-btn"
                className="btn btn-primary btn-sm"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                style={{
                  backgroundColor: 'var(--status-danger)',
                  borderColor: 'var(--status-danger)',
                  color: '#fff',
                  minWidth: '140px'
                }}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
