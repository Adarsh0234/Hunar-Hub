import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import serviceService from '../services/serviceService';
import serviceRequestService from '../services/serviceRequestService';
import reviewService from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { 
  Wrench, 
  ArrowLeft, 
  Building2, 
  Star, 
  CalendarPlus, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export const ServiceDetails = () => {
  const { serviceId } = useParams();
  const { isAuthenticated, isCustomer } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Request Action
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Review Form
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  useEffect(() => {
    loadServiceAndReviews();
  }, [serviceId]);

  const loadServiceAndReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all services and find this one
      const allServices = await serviceService.getServices();
      const found = allServices.find((s) => s.service_id === parseInt(serviceId, 10));

      if (!found) {
        setError('Service not found.');
        setLoading(false);
        return;
      }
      setService(found);

      await loadReviews();
    } catch (err) {
      console.error('Error loading service:', err);
      setError(err.message || 'Failed to load service.');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await reviewService.getServiceReviews(serviceId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading service reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleRequestService = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      setRequesting(true);
      await serviceRequestService.createRequest(service.service_id);
      setRequestSuccess(true);
    } catch (err) {
      alert(err.message || 'Failed to request service.');
    } finally {
      setRequesting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    if (!rating || rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.createServiceReview({
        service_id: parseInt(serviceId, 10),
        rating: parseInt(rating, 10),
        review: reviewText,
      });

      setReviewSuccess('Your service review has been published!');
      setReviewText('');
      await loadReviews();
    } catch (err) {
      setReviewError(err.message || 'You can review a service only after it has been marked as Completed.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error || 'Service not found.'}</span>
        </div>
        <Link to="/services" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Services</span>
        </Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : null;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <Link 
        to="/services" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          color: 'var(--text-muted)', 
          fontWeight: '600',
          marginBottom: '2rem' 
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Services</span>
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3rem',
        marginBottom: '4rem'
      }}>
        {/* Service Overview Card */}
        <div style={{
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--secondary-light)',
            color: 'var(--secondary-hover)',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '1.25rem'
          }}>
            <Building2 size={16} />
            <span>{service.business_name || 'Verified Artisan Workshop'}</span>
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            {service.service_name}
          </h1>

          {/* Ratings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', color: '#f59e0b' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  fill={averageRating && star <= Math.round(averageRating) ? '#f59e0b' : 'none'}
                />
              ))}
            </div>
            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
              {averageRating ? `${averageRating} / 5` : 'No reviews yet'}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.25rem 0', margin: '1.5rem 0' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Standard Service Fee</span>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)', marginTop: '0.2rem' }}>
              ₹{Number(service.price).toFixed(2)}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              Scope & Work Description
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {service.description || 'This skilled artisan service includes customized work, personalized fitting, and dedicated consultation.'}
            </p>
          </div>
        </div>

        {/* Action / Booking Box */}
        <div>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Book Service Request
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Once you submit this request, the business owner will review the booking and update the status from <span className="badge badge-pending">Pending</span> to <span className="badge badge-accepted">Accepted</span>.
            </p>

            {requestSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Service Requested Successfully!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  The artisan has been notified of your service request.
                </p>
                <Link to="/service-requests" className="btn btn-teal">
                  Track in My Service Requests
                </Link>
              </div>
            ) : (
              <div>
                <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--text-main)', fontWeight: '700', fontSize: '0.9rem' }}>
                    <ShieldCheck size={18} color="var(--secondary)" />
                    <span>HunarHub Service Guarantee</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Direct communication with the artisan. Cancel anytime while pending.
                  </p>
                </div>

                {(!isAuthenticated || isCustomer) && (
                  <button
                    onClick={handleRequestService}
                    disabled={requesting}
                    className="btn btn-teal btn-lg"
                    style={{ width: '100%' }}
                  >
                    {requesting ? (
                      <>
                        <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <CalendarPlus size={20} />
                        <span>Confirm Service Request</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Reviews */}
      <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <MessageSquare size={24} color="var(--secondary)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
              Service Feedback & Reviews ({reviews.length})
            </h2>
          </div>

          {/* Add Review Box */}
          {isAuthenticated && isCustomer ? (
            <div className="card" style={{ marginBottom: '2.5rem', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                Had this service completed? Leave a Review
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
                Note: You can review a service once your request has been marked as Completed by the artisan.
              </p>

              {reviewError && (
                <div className="alert alert-danger">
                  <AlertCircle size={18} />
                  <span>{reviewError}</span>
                </div>
              )}

              {reviewSuccess && (
                <div className="alert alert-success">
                  <CheckCircle2 size={18} />
                  <span>{reviewSuccess}</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Star
                          size={24}
                          fill={star <= rating ? '#f59e0b' : 'none'}
                          color="#f59e0b"
                        />
                      </button>
                    ))}
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                      {rating} Star{rating > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="srv_rev">Review Comments</label>
                  <textarea
                    id="srv_rev"
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe how the service was performed, punctuality, and craftsmanship..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-teal"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting Review...' : 'Submit Completed Service Review'}
                </button>
              </form>
            </div>
          ) : !isAuthenticated ? (
            <div className="alert alert-info" style={{ marginBottom: '2.5rem' }}>
              <ShieldAlert size={18} />
              <span>
                Please <Link to="/login" style={{ textDecoration: 'underline', fontWeight: '700' }}>log in as a Customer</Link> to review completed services.
              </span>
            </div>
          ) : null}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading verified service reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                No reviews yet for this service.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reviews.map((rev) => (
                <div key={rev.service_review_id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                      {rev.customer_name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '0.65rem' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= rev.rating ? '#f59e0b' : 'none'}
                      />
                    ))}
                  </div>

                  <p style={{ color: 'var(--text-main)', fontSize: '0.925rem', lineHeight: 1.5 }}>
                    {rev.review}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ServiceDetails;
