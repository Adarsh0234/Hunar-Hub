import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Search, 
  Star, 
  Check, 
  AlertCircle,
  PackageCheck,
  Eye
} from 'lucide-react';

export const Products = () => {
  const { isAuthenticated, isCustomer } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedIds, setAddedIds] = useState({});
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Could not load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      setAddingId(product.product_id);
      await addToCart(product.product_id);
      setAddedIds((prev) => ({ ...prev, [product.product_id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product.product_id]: false }));
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart.');
    } finally {
      setAddingId(null);
    }
  };

  const filteredProducts = products.filter((prod) => {
    const term = searchTerm.toLowerCase();
    return (
      prod.product_name?.toLowerCase().includes(term) ||
      prod.description?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      {/* Header & Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Handcrafted & Local Products
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Directly from verified local artisans, cobblers, tailors, and micro-vendors.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search products or crafts..."
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
          <p>Discovering handcrafted products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag className="empty-state-icon" />
          <h3>No products match your search</h3>
          <p>Try searching with another keyword or explore our full artisan directory.</p>
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="btn btn-secondary">
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isAdded = addedIds[product.product_id];
            const isBusy = addingId === product.product_id;

            return (
              <div 
                key={product.product_id} 
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className={`badge ${isOutOfStock ? 'badge-cancelled' : 'badge-delivered'}`}>
                      {isOutOfStock ? 'Sold Out' : `${product.stock} In Stock`}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    {product.product_name}
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
                    {product.description || 'Authentic artisan item made with care and dedication.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '0.65rem' }}>
                  <Link 
                    to={`/products/${product.product_id}`} 
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    <Eye size={16} />
                    <span>Details & Reviews</span>
                  </Link>

                  {/* Add to Cart button */}
                  {(!isAuthenticated || isCustomer) && (
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock || isBusy}
                      className={`btn ${isAdded ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ 
                        width: '46px', 
                        height: '42px', 
                        padding: 0, 
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Add to Cart"
                    >
                      {isAdded ? (
                        <Check size={20} color="var(--success)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      ) : isBusy ? (
                        <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                      ) : (
                        <ShoppingCart size={20} strokeWidth={2.2} color="white" style={{ flexShrink: 0 }} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
