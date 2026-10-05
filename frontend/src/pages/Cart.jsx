import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';

export const Cart = () => {
  const { cartItems, cartTotal, loading, updateQuantity, removeItem, clearCart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [itemBusy, setItemBusy] = useState({});

  const handleQuantity = async (item, delta) => {
    const newQty = (item.quantity || 1) + delta;
    if (newQty <= 0) {
      handleRemove(item.cart_item_id);
      return;
    }

    try {
      setItemBusy((prev) => ({ ...prev, [item.cart_item_id]: true }));
      setError(null);
      await updateQuantity(item.cart_item_id, newQty);
    } catch (err) {
      setError(err.message || 'Could not update quantity.');
    } finally {
      setItemBusy((prev) => ({ ...prev, [item.cart_item_id]: false }));
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      setItemBusy((prev) => ({ ...prev, [cartItemId]: true }));
      setError(null);
      await removeItem(cartItemId);
    } catch (err) {
      setError(err.message || 'Could not remove item.');
    } finally {
      setItemBusy((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to empty your shopping cart?')) return;
    try {
      setError(null);
      await clearCart();
    } catch (err) {
      setError(err.message || 'Could not clear cart.');
    }
  };

  const handleCheckout = async () => {
    setError(null);
    setSuccess(null);

    try {
      setPlacingOrder(true);
      const res = await orderService.createOrder();
      setSuccess('Order placed successfully! Redirecting to your orders...');
      await fetchCart();
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to place order. Some items may be out of stock.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your shopping cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
          Your Shopping Cart
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Review items from local micro-entrepreneurs before placing your order.
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

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart className="empty-state-icon" />
          <h3>Your cart is empty</h3>
          <p>Explore handmade goods and unique local creations to fill your cart.</p>
          <Link to="/products" className="btn btn-primary">
            <ShoppingBag size={18} />
            <span>Browse Products</span>
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Cart Items List */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                Cart Items ({cartItems.length})
              </span>
              <button 
                onClick={handleClearCart} 
                className="btn btn-outline-danger btn-sm"
              >
                Clear Cart
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {cartItems.map((item) => {
                const isBusy = itemBusy[item.cart_item_id];
                const unitPrice = Number(item.price || 0);
                const subtotal = unitPrice * (item.quantity || 1);

                return (
                  <div 
                    key={item.cart_item_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      paddingBottom: '1.25rem',
                      borderBottom: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ flex: '1 1 200px' }}>
                      <Link 
                        to={`/products/${item.product_id}`}
                        style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)', display: 'block' }}
                      >
                        {item.product_name}
                      </Link>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        ₹{unitPrice.toFixed(2)} each · {item.stock} available
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleQuantity(item, -1)}
                        disabled={isBusy}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.5rem' }}
                      >
                        <Minus size={14} />
                      </button>

                      <span style={{ fontWeight: '700', minWidth: '28px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleQuantity(item, 1)}
                        disabled={isBusy || (item.quantity >= item.stock)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.5rem' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                        ₹{subtotal.toFixed(2)}
                      </span>

                      <button
                        onClick={() => handleRemove(item.cart_item_id)}
                        disabled={isBusy}
                        className="btn btn-outline-danger btn-sm"
                        style={{ padding: '0.4rem' }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span>Items Subtotal</span>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>₹{cartTotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span>Community Delivery</span>
              <span style={{ color: 'var(--success)', fontWeight: '700' }}>Free</span>
            </div>

            <div style={{ borderTop: '2px dashed var(--border-color)', margin: '1rem 0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>Total Amount</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-md)', margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>Payments are processed directly with local artisans upon confirmation.</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={placingOrder}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              {placingOrder ? (
                <>
                  <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
