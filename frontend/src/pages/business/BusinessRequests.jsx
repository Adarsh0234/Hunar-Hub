import React, { useState, useEffect } from 'react';
import serviceRequestService from '../../services/serviceRequestService';
import { 
  CalendarClock, 
  Check, 
  X, 
  CheckCheck, 
  AlertCircle, 
  CheckCircle2, 
  User 
} from 'lucide-react';
import { SERVICE_REQUEST_STATUSES } from '../../constants';

export const BusinessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadBusinessRequests();
  }, []);

  const loadBusinessRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceRequestService.getBusinessRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load incoming service requests:', err);
      setError(err.message || 'Could not load service requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setActionId(requestId);
      setError(null);
      await serviceRequestService.updateStatus(requestId, status);
      setSuccess(`Request #${requestId} has been ${status.toLowerCase()}.`);
      await loadBusinessRequests();
    } catch (err) {
      setError(err.message || `Failed to update status to ${status}.`);
    } finally {
      setActionId(null);
    }
  };

  const handleMarkComplete = async (requestId) => {
    try {
      setActionId(requestId);
      setError(null);
      await serviceRequestService.completeRequest(requestId);
      setSuccess(`Request #${requestId} marked as Completed!`);
      await loadBusinessRequests();
    } catch (err) {
      setError(err.message || 'Failed to complete request.');
    } finally {
      setActionId(null);
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
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
          Incoming Service Requests
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Review customer service inquiries, accept or decline jobs, and mark completed projects.
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
          <p>Loading service requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <CalendarClock className="empty-state-icon" />
          <h3>No service requests received</h3>
          <p>When customers book your skilled services, their booking requests will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Req #</th>
                <th>Customer</th>
                <th>Service Name</th>
                <th>Price</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const isBusy = actionId === req.service_request_id;
                const isPending = req.status === 'Pending';
                const isAccepted = req.status === 'Accepted';

                return (
                  <tr key={req.service_request_id}>
                    <td style={{ fontWeight: '700' }}>#{req.service_request_id}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600' }}>
                        <User size={14} color="var(--text-light)" />
                        <span>{req.customer_name || `Customer #${req.customer_id}`}</span>
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{req.service_name}</td>
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
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(req.service_request_id, 'Accepted')}
                              disabled={isBusy}
                              className="btn btn-teal btn-sm"
                            >
                              <Check size={14} />
                              <span>Accept</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(req.service_request_id, 'Rejected')}
                              disabled={isBusy}
                              className="btn btn-outline-danger btn-sm"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <button
                            onClick={() => handleMarkComplete(req.service_request_id)}
                            disabled={isBusy}
                            className="btn btn-primary btn-sm"
                          >
                            <CheckCheck size={14} />
                            <span>Mark Completed</span>
                          </button>
                        )}

                        {!isPending && !isAccepted && (
                          <span style={{ fontSize: '0.825rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                            Archived
                          </span>
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

export default BusinessRequests;
