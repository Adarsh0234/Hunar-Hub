import React, { useState, useEffect } from 'react';
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
  Store,
  Menu,
  X
} from 'lucide-react';
import { ACCOUNT_TYPES } from '../constants';

export const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isBusinessUser, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile navigation drawer whenever route/pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-badge">H</div>
          <span>Hunar<span style={{ color: 'var(--primary)' }}>Hub</span></span>
        </Link>

        {/* Center Navigation Links (Desktop) */}
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

        {/* Right Actions (Desktop) */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              {/* Customer Cart */}
              {isCustomer && (
                <Link to="/cart" className="btn btn-secondary" style={{ position: 'relative' }}>
                  <ShoppingCart size={19} />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="cart-badge">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Profile Pill */}
              <div className="user-profile-pill">
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

        {/* Mobile Header Quick Actions & Menu Toggle */}
        <div className="nav-mobile-header-actions">
          {isAuthenticated && isCustomer && (
            <Link to="/cart" className="btn btn-secondary btn-sm nav-mobile-cart-btn" aria-label="Cart">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <button 
            className="nav-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Collapsible Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="nav-mobile-dropdown">
          <div className="container nav-mobile-dropdown-inner">
            {/* Nav links */}
            <nav className="nav-mobile-links">
              <Link 
                to="/products" 
                className={`nav-link ${isActive('/products') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingBag size={18} />
                <span>Products</span>
              </Link>

              <Link 
                to="/services" 
                className={`nav-link ${isActive('/services') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
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
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package size={18} />
                    <span>My Orders</span>
                  </Link>
                  <Link 
                    to="/service-requests" 
                    className={`nav-link ${isActive('/service-requests') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  <span>Business Hub</span>
                </Link>
              )}
            </nav>

            {/* Mobile Actions / Profile */}
            <div className="nav-mobile-actions">
              {isAuthenticated ? (
                <>
                  <div className="user-profile-pill" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isBusinessUser ? 'var(--primary)' : 'var(--secondary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: '700'
                    }}>
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                        {user?.full_name}
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: isBusinessUser ? 'var(--primary-dark)' : 'var(--secondary-hover)',
                        fontWeight: '600'
                      }}>
                        {user?.account_type}
                      </span>
                    </div>
                  </div>

                  {isCustomer && (
                    <Link 
                      to="/cart" 
                      className="btn btn-secondary" 
                      style={{ width: '100%', position: 'relative' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart size={18} />
                      <span>Shopping Cart ({cartCount})</span>
                    </Link>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="btn btn-outline-danger"
                    style={{ width: '100%' }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                  <Link 
                    to="/login" 
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
