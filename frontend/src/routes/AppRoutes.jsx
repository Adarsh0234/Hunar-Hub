import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Services from '../pages/Services';
import ServiceDetails from '../pages/ServiceDetails';

// Customer Protected Pages
import Cart from '../pages/Cart';
import CustomerOrders from '../pages/customer/CustomerOrders';
import CustomerRequests from '../pages/customer/CustomerRequests';

// Business User Protected Pages
import BusinessDashboardLayout from '../pages/business/BusinessDashboardLayout';
import BusinessProfile from '../pages/business/BusinessProfile';
import BusinessProducts from '../pages/business/BusinessProducts';
import BusinessServices from '../pages/business/BusinessServices';
import BusinessOrders from '../pages/business/BusinessOrders';
import BusinessRequests from '../pages/business/BusinessRequests';

// Guard
import ProtectedRoute from '../components/ProtectedRoute';
import { ACCOUNT_TYPES } from '../constants';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:productId" element={<ProductDetails />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:serviceId" element={<ServiceDetails />} />

      {/* Customer Protected Pages */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPES.CUSTOMER]}>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPES.CUSTOMER]}>
            <CustomerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-requests"
        element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPES.CUSTOMER]}>
            <CustomerRequests />
          </ProtectedRoute>
        }
      />

      {/* Business User Protected Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPES.BUSINESS_USER]}>
            <BusinessDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard/profile" replace />} />
        <Route path="profile" element={<BusinessProfile />} />
        <Route path="products" element={<BusinessProducts />} />
        <Route path="services" element={<BusinessServices />} />
        <Route path="orders" element={<BusinessOrders />} />
        <Route path="requests" element={<BusinessRequests />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
