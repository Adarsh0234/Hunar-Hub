import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Wrench, 
  ShoppingCart, 
  Package, 
  Calendar, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon,
  Store
} from 'lucide-react';
import { ACCOUNT_TYPES } from '../constants';

export const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isBusinessUser, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <Link to="/" className="brand-logo">
          <div className="brand-badge">H</div>
          <span>Hunar<span style={{ color: 'var(--primary)' }}>Hub</span></span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="nav-links">
          <Link 
            to="/products" 
            className={`nav-link ${isActive('/products') ? 'active' : ''}`}
          >
            <ShoppingBag size={18} />
            <span>Products</span>
          </Link>

          <Link 
            to="/services" 
            className={`nav-link ${isActive('/services') ? 'active' : ''}`}
          >
            <Wrench size={18} />
            <span>Services</span>
          </Link>

          {/* Customer specific navigation */}
          {isAuthenticated && isCustomer && (
            <>
              <Link 
                to="/orders" 
                className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
              >
                <Package size={18} />
                <span>My Orders</span>
              </Link>
              <Link 
                to="/service-requests" 
                className={`nav-link ${isActive('/service-requests') ? 'active' : ''}`}
              >
                <Calendar size={18} />
                <span>My Requests</span>
              </Link>
            </>
          )}

          {/* Business User specific navigation */}
          {isAuthenticated && isBusinessUser && (
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Business Hub</span>
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              {/* Customer Cart */}
              {isCustomer && (
                <Link to="/cart" className="btn btn-secondary" style={{ position: 'relative' }}>
                  <ShoppingCart size={19} />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      fontSize: '0.72rem',
                      fontWeight: '800'
                    }}>
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Profile Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.4rem 0.85rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isBusinessUser ? 'var(--primary)' : 'var(--secondary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                    {user?.full_name}
                  </span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    color: isBusinessUser ? 'var(--primary-dark)' : 'var(--secondary-hover)',
                    fontWeight: '600'
                  }}>
                    {user?.account_type}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
