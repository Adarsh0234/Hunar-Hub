import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import serviceService from '../services/serviceService';
import serviceRequestService from '../services/serviceRequestService';
import { useAuth } from '../context/AuthContext';
import { 
  Wrench, 
  Search, 
  Building2, 
  ArrowRight, 
  CalendarPlus, 
  CheckCircle2, 
  AlertCircle,
  Eye
} from 'lucide-react';

export const Services = () => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bookingId, setBookingId] = useState(null);
  const [bookSuccessId, setBookSuccessId] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceService.getServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load services:', err);
      setError(err.message || 'Could not load services.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRequest = async (service) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      setBookingId(service.service_id);
      await serviceRequestService.createRequest(service.service_id);
      setBookSuccessId(service.service_id);
      setTimeout(() => setBookSuccessId(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to submit service request.');
    } finally {
      setBookingId(null);
    }
  };

  const filteredServices = services.filter((srv) => {
    const term = searchTerm.toLowerCase();
    return (
      srv.service_name?.toLowerCase().includes(term) ||
      srv.description?.toLowerCase().includes(term) ||
      srv.business_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container page-container">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            Skilled Artisan Services
          </h1>
          <p className="page-subtitle">
            Book custom tailoring, restoration, pottery, repair work, and specialized local craft.
          </p>
        </div>

        <div className="search-box-wrapper">
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search services or providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search 
            size={18} 
            color="var(--text-light)" 
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} 
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container" style={{ minHeight: '40vh' }}>
          <div className="spinner"></div>
          <p>Finding local service providers...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="empty-state">
          <Wrench className="empty-state-icon" />
          <h3>No services found</h3>
          <p>Try searching for a different skill or clear your search query.</p>
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="btn btn-secondary">
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filteredServices.map((service) => {
            const isBooking = bookingId === service.service_id;
            const isSuccess = bookSuccessId === service.service_id;

            return (
              <div 
                key={service.service_id} 
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.825rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    <Building2 size={15} />
                    <span>{service.business_name || 'Verified Artisan'}</span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    {service.service_name}
                  </h3>

                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {service.description || 'Reliable service provided by an experienced local craftsperson.'}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Estimated Cost</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--secondary)' }}>
                      ₹{Number(service.price).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <Link 
                      to={`/services/${service.service_id}`} 
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                    >
                      <Eye size={16} />
                      <span>Details</span>
                    </Link>

                    {(!isAuthenticated || isCustomer) && (
                      <button
                        onClick={() => handleQuickRequest(service)}
                        disabled={isBooking || isSuccess}
                        className={`btn ${isSuccess ? 'btn-secondary' : 'btn-teal'}`}
                      >
                        {isSuccess ? (
                          <>
                            <CheckCircle2 size={16} color="var(--success)" />
                            <span>Requested!</span>
                          </>
                        ) : isBooking ? (
                          <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                        ) : (
                          <>
                            <CalendarPlus size={16} />
                            <span>Request</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Services;
