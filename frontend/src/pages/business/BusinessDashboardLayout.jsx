import React from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Package, 
  Wrench, 
  ShoppingBag, 
  CalendarClock,
  Sparkles
} from 'lucide-react';
import { ACCOUNT_TYPES } from '../../constants';

export const BusinessDashboardLayout = () => {
  const { user, isBusinessUser } = useAuth();
  const location = useLocation();

  if (!isBusinessUser) {
    return <Navigate to="/" replace />;
  }

  // If directly at /dashboard, redirect to /dashboard/profile
  if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
    return <Navigate to="/dashboard/profile" replace />;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary-dark)', letterSpacing: '0.05em' }}>
              Artisan Studio
            </span>
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.2 }}>
            Business Hub
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {user?.full_name}
          </p>
        </div>

        <span className="sidebar-title">Manage Business</span>
        
        <NavLink 
          to="/dashboard/profile" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <Building2 size={18} />
          <span>Business Profile</span>
        </NavLink>

        <NavLink 
          to="/dashboard/products" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <Package size={18} />
          <span>Products</span>
        </NavLink>

        <NavLink 
          to="/dashboard/services" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <Wrench size={18} />
          <span>Services</span>
        </NavLink>

        <span className="sidebar-title sidebar-title-orders">Customer Orders</span>

        <NavLink 
          to="/dashboard/orders" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <ShoppingBag size={18} />
          <span>Received Orders</span>
        </NavLink>

        <NavLink 
          to="/dashboard/requests" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <CalendarClock size={18} />
          <span>Service Requests</span>
        </NavLink>
      </aside>

      {/* Main Panel Content */}
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default BusinessDashboardLayout;
