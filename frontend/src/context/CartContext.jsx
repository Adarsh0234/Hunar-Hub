import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      setCartItems([]);
      return;
    }
    try {
      setLoading(true);
      const items = await cartService.getCart();
      setCartItems(Array.isArray(items) ? items : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId) => {
    try {
      const res = await cartService.addToCart(productId);
      await fetchCart();
      return res;
    } catch (err) {
      throw err;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const res = await cartService.updateCartItem(cartItemId, quantity);
      await fetchCart();
      return res;
    } catch (err) {
      throw err;
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const res = await cartService.removeCartItem(cartItemId);
      await fetchCart();
      return res;
    } catch (err) {
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartService.clearCart();
      setCartItems([]);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (Number(item.price || 0) * (item.quantity || 1)), 0);

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
