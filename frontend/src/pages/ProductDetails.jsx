import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Check,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  Boxes
} from 'lucide-react';

export const ProductDetails = () => {
  const { productId } = useParams();
  const { isAuthenticated, isCustomer } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cart action
  const [isAdded, setIsAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  // Review Form
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  useEffect(() => {
    loadProductAndReviews();
  }, [productId]);

  const loadProductAndReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load products list and find this one
      const allProducts = await productService.getProducts();
      const found = allProducts.find((p) => p.product_id === parseInt(productId, 10));

      if (!found) {
        setError('Product not found.');
        setLoading(false);
        return;
      }
      setProduct(found);

      // Load reviews
      await loadReviews();
    } catch (err) {
      console.error('Error loading product details:', err);
      setError(err.message || 'Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await reviewService.getProductReviews(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      setAdding(true);
      await addToCart(product.product_id);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    if (!rating || rating < 1 || rating > 5) {
      setReviewError('Please select a star rating from 1 to 5.');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.createProductReview({
        product_id: parseInt(productId, 10),
        rating: parseInt(rating, 10),
        review: reviewText,
      });

      setReviewSuccess('Thank you! Your verified purchase review has been submitted.');
      setReviewText('');
      await loadReviews();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error || 'Product not found.'}</span>
        </div>
        <Link to="/products" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="container page-container">
      <Link
        to="/products"
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
        <span>Back to Products</span>
      </Link>

      <div className="details-grid">
        {/* Visual Box */}
        <div className="details-visual-box">
          {product.image_data ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/products/${product.product_id}/image`}
              alt={product.product_name}
              style={{
                width: '100%',
                maxWidth: '400px',
                height: '400px',
                objectFit: 'contain',
                background: '#fff',
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}
            />
          ) : (
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <Boxes size={48} />
            </div>
          )}

          <span className={`badge ${product.stock > 0 ? 'badge-delivered' : 'badge-cancelled'}`}>
            {product.stock > 0 ? `${product.stock} Units Available` : 'Currently Sold Out'}
          </span>
        </div>

        {/* Product Details & Actions */}
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            {product.product_name}
          </h1>

          {/* Rating Summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
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

          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1.5rem' }}>
            ₹{Number(product.price).toFixed(2)}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              Description & Craftsmanship
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {product.description || 'This is an authentic artisanal handcrafted item produced by a verified local entrepreneur on HunarHub.'}
            </p>
          </div>

          {/* Add to Cart Actions */}
          {(!isAuthenticated || isCustomer) && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || adding}
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
              >
                {isAdded ? (
                  <>
                    <Check size={20} />
                    <span>Added to Cart!</span>
                  </>
                ) : adding ? (
                  <>
                    <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <MessageSquare size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
              Customer Reviews ({reviews.length})
            </h2>
          </div>

          {/* Add Review Box (For Customers) */}
          {isAuthenticated && isCustomer ? (
            <div className="card" style={{ marginBottom: '2.5rem', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                Purchased this item? Write a Review
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
                Verified purchases are confirmed by the backend before review publication.
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
                  <label className="form-label" htmlFor="review">Review Details</label>
                  <textarea
                    id="review"
                    className="form-textarea"
                    rows={3}
                    placeholder="Share your thoughts on build quality, craftsmanship, and packaging..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting Review...' : 'Submit Verified Review'}
                </button>
              </form>
            </div>
          ) : !isAuthenticated ? (
            <div className="alert alert-info" style={{ marginBottom: '2.5rem' }}>
              <ShieldAlert size={18} />
              <span>
                Please <Link to="/login" style={{ textDecoration: 'underline', fontWeight: '700' }}>log in as a Customer</Link> to review items you have purchased.
              </span>
            </div>
          ) : null}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading verified reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                No reviews yet. Be the first verified customer to leave feedback!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reviews.map((rev) => (
                <div key={rev.product_review_id} className="card" style={{ padding: '1.25rem' }}>
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

export default ProductDetails;
