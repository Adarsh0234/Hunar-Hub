import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import serviceRequestService from '../../services/serviceRequestService';
import { 
  Wrench, 
  Building2, 
  CalendarClock, 
  XCircle, 
  CheckCircle2, 
  AlertCircle,
  Star
} from 'lucide-react';
import { SERVICE_REQUEST_STATUSES } from '../../constants';

export const CustomerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceRequestService.getMyRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setError(err.message || 'Could not load your service requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this pending service request?')) return;

    try {
      setCancellingId(requestId);
      setError(null);
      await serviceRequestService.cancelRequest(requestId);
      setSuccess(`Request #${requestId} has been cancelled.`);
      await loadMyRequests();
    } catch (err) {
      setError(err.message || 'Failed to cancel request.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case SERVICE_REQUEST_STATUSES.PENDING:
        return 'badge-pending';
      case SERVICE_REQUEST_STATUSES.ACCEPTED:
        return 'badge-accepted';
      case SERVICE_REQUEST_STATUSES.COMPLETED:
        return 'badge-completed';
      case SERVICE_REQUEST_STATUSES.REJECTED:
      case SERVICE_REQUEST_STATUSES.CANCELLED:
        return 'badge-cancelled';
      default:
        return 'badge-pending';
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
          My Service Bookings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage service appointments, artisan responses, and completion statuses.
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
          <p>Loading your service requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <CalendarClock className="empty-state-icon" />
          <h3>No service requests booked</h3>
          <p>Need custom tailoring, shoe repair, or pottery lessons? Connect with an artisan today.</p>
          <Link to="/services" className="btn btn-teal">
            <Wrench size={16} />
            <span>Browse Services</span>
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Req #</th>
                <th>Service Name</th>
                <th>Artisan Business</th>
                <th>Est. Price</th>
                <th>Requested On</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const isPending = req.status === 'Pending';
                const isCompleted = req.status === 'Completed';
                const isCancelling = cancellingId === req.service_request_id;

                return (
                  <tr key={req.service_request_id}>
                    <td style={{ fontWeight: '700' }}>#{req.service_request_id}</td>
                    <td style={{ fontWeight: '600' }}>
                      <Link to={`/services/${req.service_id}`} style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>
                        {req.service_name}
                      </Link>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <Building2 size={14} />
                        <span>{req.business_name}</span>
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--secondary)' }}>
                      ₹{Number(req.price).toFixed(2)}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {isCompleted && (
                          <Link 
                            to={`/services/${req.service_id}`} 
                            className="btn btn-secondary btn-sm"
                            style={{ gap: '0.3rem' }}
                          >
                            <Star size={13} fill="#f59e0b" color="#f59e0b" />
                            <span>Review</span>
                          </Link>
                        )}

                        {isPending && (
                          <button
                            onClick={() => handleCancelRequest(req.service_request_id)}
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
    </div>
  );
};

export default CustomerRequests;
