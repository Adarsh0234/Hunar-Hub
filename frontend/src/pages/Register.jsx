import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import businessService from '../services/businessService';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Building2, 
  Briefcase, 
  FileText, 
  MapPin, 
  KeyRound,
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import { ACCOUNT_TYPES } from '../constants';

export const Register = () => {
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Tab: 'Customer' | 'Business User'
  const [accountType, setAccountType] = useState(ACCOUNT_TYPES.CUSTOMER);
  
  // Registration form fields
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    // Business specific
    business_name: '',
    category_name: '',
    description: '',
    address: '',
  });

  // Dynamic business categories from backend
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Flow step: 1 = Register form, 2 = OTP Verification
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  // Fetch categories when switching to Business User
  useEffect(() => {
    if (accountType === ACCOUNT_TYPES.BUSINESS_USER && categories.length === 0) {
      loadCategories();
    }
  }, [accountType]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await businessService.getCategories();
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0 && !formData.category_name) {
          setFormData((prev) => ({ ...prev, category_name: data[0].category_name }));
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load business categories. Please refresh.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (accountType === ACCOUNT_TYPES.BUSINESS_USER) {
      if (!formData.business_name || !formData.category_name) {
        setError('Please provide business name and select a category.');
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirm_password,
        account_type: accountType,
      };

      if (accountType === ACCOUNT_TYPES.BUSINESS_USER) {
        payload.business_name = formData.business_name;
        payload.category_name = formData.category_name;
        payload.description = formData.description;
        payload.address = formData.address;
      }

      const res = await register(payload);
      setSuccessInfo(res.message || 'OTP sent to your email. Please check your inbox.');
      setStep(2); // Advance to OTP verification
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim()) {
      setError('Please enter the OTP code sent to your email.');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(formData.email, otp.trim());
      navigate('/login', {
        state: {
          email: formData.email,
          message: 'Account verified successfully! You can now log in.'
        }
      });
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: step === 1 && accountType === ACCOUNT_TYPES.BUSINESS_USER ? '640px' : '500px' }}>
        <div className="auth-header">
          <h2>{step === 1 ? 'Create an Account' : 'Verify Your Email'}</h2>
          <p>
            {step === 1 
              ? 'Join HunarHub to connect with local artisans & buyers' 
              : `We sent a 6-digit OTP to ${formData.email}`}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successInfo && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{successInfo}</span>
          </div>
        )}

        {step === 1 ? (
          <>
            {/* Account Type Selector Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${accountType === ACCOUNT_TYPES.CUSTOMER ? 'active' : ''}`}
                onClick={() => {
                  setAccountType(ACCOUNT_TYPES.CUSTOMER);
                  setError(null);
                }}
              >
                Customer
              </button>
              <button
                type="button"
                className={`auth-tab ${accountType === ACCOUNT_TYPES.BUSINESS_USER ? 'active' : ''}`}
                onClick={() => {
                  setAccountType(ACCOUNT_TYPES.BUSINESS_USER);
                  setError(null);
                }}
              >
                Business User / Artisan
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="full_name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="e.g. Rahul Sharma"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                  <User size={18} color="var(--text-light)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    <Phone size={18} color="var(--text-light)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label" htmlFor="password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="confirm_password">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="••••••••"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      required
                    />
                    <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              {/* Business User Specific Fields */}
              {accountType === ACCOUNT_TYPES.BUSINESS_USER && (
                <div style={{ 
                  background: 'var(--bg-subtle)', 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={18} />
                    <span>Business Profile Information</span>
                  </h4>

                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label className="form-label" htmlFor="business_name">Business / Shop Name *</label>
                      <input
                        id="business_name"
                        name="business_name"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Royal Tailors & Fabrics"
                        value={formData.business_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="category_name">Category *</label>
                      <select
                        id="category_name"
                        name="category_name"
                        className="form-select"
                        value={formData.category_name}
                        onChange={handleChange}
                        disabled={loadingCategories}
                        required
                      >
                        {loadingCategories ? (
                          <option>Loading categories...</option>
                        ) : (
                          categories.map((cat) => (
                            <option key={cat.category_id} value={cat.category_name}>
                              {cat.category_name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" htmlFor="address">Address / Location</label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Shop 12, Main Bazaar, City"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="description">About Your Craft / Business</label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-textarea"
                      placeholder="Describe what services or handcrafted goods you offer..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Register & Receive OTP</span>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="otp">Enter 6-Digit OTP</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  className="form-input"
                  style={{ 
                    paddingLeft: '2.5rem', 
                    fontSize: '1.25rem', 
                    letterSpacing: '0.2em', 
                    textAlign: 'center',
                    fontWeight: '700' 
                  }}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  autoFocus
                />
                <KeyRound size={20} color="var(--text-light)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                The OTP is valid for 1 minute. Please check your inbox and spam folder.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <span>Verify & Activate Account</span>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '0.75rem' }}
              onClick={() => {
                setStep(1);
                setError(null);
                setSuccessInfo(null);
              }}
              disabled={loading}
            >
              Back to Registration Form
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
