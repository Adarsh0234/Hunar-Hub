import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import { 
  Package, 
  Eye, 
  XCircle, 
  AlertCircle, 
  CheckCircle2, 
  X,
  ShoppingBag
} from 'lucide-react';
import { ORDER_STATUSES } from '../../constants';

export const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadMyOrders();
  }, []);

  const loadMyOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Could not load your orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      const details = await orderService.getOrderDetails(orderId);
      setSelectedOrder(details);
    } catch (err) {
      alert(err.message || 'Could not load order details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this pending order?')) return;

    try {
      setCancellingId(orderId);
      setError(null);
      await orderService.cancelOrder(orderId);
      setSuccess(`Order #${orderId} has been cancelled.`);
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, order_status: 'Cancelled' }));
      }
      await loadMyOrders();
    } catch (err) {
      setError(err.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case ORDER_STATUSES.PENDING:
        return 'badge-pending';
      case ORDER_STATUSES.CONFIRMED:
        return 'badge-confirmed';
      case ORDER_STATUSES.SHIPPED:
        return 'badge-shipped';
      case ORDER_STATUSES.DELIVERED:
        return 'badge-delivered';
      case ORDER_STATUSES.CANCELLED:
        return 'badge-cancelled';
      default:
        return 'badge-pending';
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
          My Purchase Orders
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Track delivery status and view item receipts for orders placed on HunarHub.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <Package className="empty-state-icon" />
          <h3>No orders placed yet</h3>
          <p>You haven't ordered any items yet. Explore the marketplace to find unique crafts!</p>
          <Link to="/products" className="btn btn-primary">
            <ShoppingBag size={18} />
            <span>Start Shopping</span>
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date Placed</th>
                <th>Total Amount</th>
                <th>Order Status</th>
                <th>Payment</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => {
                const isPending = ord.order_status === 'Pending';
                const isCancelling = cancellingId === ord.order_id;

                return (
                  <tr key={ord.order_id}>
                    <td style={{ fontWeight: '700' }}>#{ord.order_id}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                      ₹{Number(ord.total_amount).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(ord.order_status)}`}>
                        {ord.order_status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {ord.payment_status || 'Pending'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleViewDetails(ord.order_id)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={14} />
                          <span>View Receipt</span>
                        </button>

                        {isPending && (
                          <button
                            onClick={() => handleCancelOrder(ord.order_id)}
                            disabled={isCancelling}
                            className="btn btn-outline-danger btn-sm"
                          >
                            <XCircle size={14} />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                  Order #{selectedOrder.order_id} Receipt
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Status</span>
                <span className={`badge ${getStatusBadge(selectedOrder.order_status)}`}>
                  {selectedOrder.order_status}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textAlign: 'right' }}>Payment</span>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{selectedOrder.payment_status}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Purchased Items
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {selectedOrder.items?.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.65rem 0',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: '600', display: 'block', fontSize: '0.95rem' }}>
                      {item.product_name}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} × ₹{Number(item.unit_price).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: '700' }}>
                      ₹{(item.quantity * Number(item.unit_price)).toFixed(2)}
                    </span>
                    <Link 
                      to={`/products/${item.product_id}`} 
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>Total Paid</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
                ₹{Number(selectedOrder.total_amount).toFixed(2)}
              </span>
            </div>

            {selectedOrder.order_status === 'Pending' && (
              <button
                onClick={() => handleCancelOrder(selectedOrder.order_id)}
                className="btn btn-outline-danger"
                style={{ width: '100%' }}
              >
                Cancel This Order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
