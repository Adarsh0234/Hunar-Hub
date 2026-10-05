import React, { useState, useEffect } from 'react';
import serviceService from '../../services/serviceService';
import { 
  Wrench, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Briefcase
} from 'lucide-react';

export const BusinessServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    price: '',
  });

  useEffect(() => {
    loadMyServices();
  }, []);

  const loadMyServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceService.getMyServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({ service_name: '', description: '', price: '' });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name,
      description: service.description || '',
      price: service.price,
    });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Please enter a valid price.');
      return;
    }

    try {
      setActionLoading(true);
      if (editingService) {
        await serviceService.updateService(editingService.service_id, {
          service_name: formData.service_name,
          description: formData.description,
          price: priceNum,
        });
        setSuccess('Service updated successfully!');
      } else {
        await serviceService.createService({
          service_name: formData.service_name,
          description: formData.description,
          price: priceNum,
        });
        setSuccess('Service created successfully!');
      }

      handleCloseModal();
      await loadMyServices();
    } catch (err) {
      setError(err.message || 'Failed to save service.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteService = async (serviceId, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await serviceService.deleteService(serviceId);
      setSuccess(`Service "${name}" deleted successfully.`);
      await loadMyServices();
    } catch (err) {
      setError(err.message || 'Failed to delete service.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Services Offered
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Offer tailor alterations, shoe repairs, pottery workshops, and custom artisan services.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-teal">
          <Plus size={18} />
          <span>Add New Service</span>
        </button>
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
          <p>Loading your services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <Briefcase className="empty-state-icon" />
          <h3>No services created yet</h3>
          <p>Create a service package to let local customers request and book your skills.</p>
          <button onClick={handleOpenAdd} className="btn btn-teal">
            <Plus size={16} />
            <span>Create Your First Service</span>
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Description</th>
                <th>Estimated Cost</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv) => (
                <tr key={srv.service_id}>
                  <td style={{ fontWeight: '700' }}>{srv.service_name}</td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {srv.description || '—'}
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--secondary)' }}>
                    ₹{Number(srv.price).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleOpenEdit(srv)} 
                        className="btn btn-secondary btn-sm"
                        title="Edit Service"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteService(srv.service_id, srv.service_name)} 
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Service"
                        disabled={actionLoading}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button 
                onClick={handleCloseModal} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="srv_name">Service Title *</label>
                <input
                  id="srv_name"
                  name="service_name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Suit Stitching & Alterations"
                  value={formData.service_name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="srv_price">Standard Price / Fee (₹) *</label>
                <input
                  id="srv_price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="350.00"
                  value={formData.price}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="srv_desc">Service Description & Scope</label>
                <textarea
                  id="srv_desc"
                  name="description"
                  className="form-textarea"
                  rows={3}
                  placeholder="Explain turnaround time, requirements, materials included..."
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessServices;
