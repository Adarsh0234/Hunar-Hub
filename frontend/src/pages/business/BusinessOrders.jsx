import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import { 
  ShoppingBag, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Truck,
  CheckCheck
} from 'lucide-react';
import { ORDER_STATUSES } from '../../constants';

export const BusinessOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal / Details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadBusinessOrders();
  }, []);

  const loadBusinessOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getBusinessOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load business orders:', err);
      setError(err.message || 'Could not load received orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      setError(null);
      const details = await orderService.getBusinessOrderDetails(orderId);
      setSelectedOrder(details);
    } catch (err) {
      setError(err.message || 'Could not load order details.');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setError(null);
      await orderService.updateOrderStatus(orderId, newStatus);
      setSuccess(`Order #${orderId} marked as ${newStatus}.`);

      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, order_status: newStatus }));
      }

      await loadBusinessOrders();
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
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
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
          Received Customer Orders
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Process incoming product purchases, update shipping progress, and mark deliveries.
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
          <p>Loading incoming orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag className="empty-state-icon" />
          <h3>No customer orders received yet</h3>
          <p>Orders placed by customers for your listed products will show up here in real-time.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Order Date</th>
                <th>Total Value</th>
                <th>Current Status</th>
                <th>Update Status</th>
                <th style={{ textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => {
                const isUpdating = updatingId === ord.order_id;

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
                      <select
                        className="form-select"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', width: 'auto' }}
                        value={ord.order_status}
                        onChange={(e) => handleUpdateStatus(ord.order_id, e.target.value)}
                        disabled={isUpdating || ord.order_status === 'Cancelled' || ord.order_status === 'Delivered'}
                      >
                        <option value="Pending" disabled>Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleViewDetails(ord.order_id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Business Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                  Order #{selectedOrder.order_id} Breakdown
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Customer ID: {selectedOrder.customer_id} · {new Date(selectedOrder.created_at).toLocaleString()}
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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Current Status</span>
                <span className={`badge ${getStatusBadge(selectedOrder.order_status)}`}>
                  {selectedOrder.order_status}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Update Status</span>
                <select
                  className="form-select"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.825rem' }}
                  value={selectedOrder.order_status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.order_id, e.target.value)}
                  disabled={selectedOrder.order_status === 'Cancelled' || selectedOrder.order_status === 'Delivered'}
                >
                  <option value="Pending" disabled>Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Items in This Order
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

                  <span style={{ fontWeight: '700' }}>
                    ₹{(item.quantity * Number(item.unit_price)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>Total Order Value</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
                ₹{Number(selectedOrder.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessOrders;
