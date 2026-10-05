import React, { useState, useEffect } from 'react';
import businessService from '../../services/businessService';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  Save
} from 'lucide-react';

export const BusinessProfile = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [profile, setProfile] = useState({
    business_id: null,
    business_name: '',
    category_id: null,
    category_name: '',
    description: '',
    phone: '',
    address: '',
  });

  // Dynamic Categories
  const [categories, setCategories] = useState([]);
  
  // Logo
  const [logoBase64, setLogoBase64] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchProfileAndCategories();
  }, []);

  const fetchProfileAndCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch categories
      const cats = await businessService.getCategories();
      setCategories(Array.isArray(cats) ? cats : []);

      // 2. Fetch business profile
      const data = await businessService.getProfile();
      
      // Match category name
      let catName = '';
      if (Array.isArray(cats) && data.category_id) {
        const found = cats.find((c) => c.category_id === data.category_id);
        if (found) catName = found.category_name;
      }

      setProfile({
        business_id: data.business_id,
        business_name: data.business_name || '',
        category_id: data.category_id,
        category_name: catName || (cats[0]?.category_name || ''),
        description: data.description || '',
        phone: data.phone || '',
        address: data.address || '',
      });

      // 3. Fetch logo if available
      try {
        const logoData = await businessService.getLogo();
        if (logoData && logoData.logo) {
          setLogoBase64(logoData.logo);
        }
      } catch (logoErr) {
        // Logo not found or not set yet - normal for new profiles
        setLogoBase64(null);
      }
    } catch (err) {
      console.error('Error loading business profile:', err);
      setError(err.message || 'Failed to load business profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo image must be smaller than 2 MB.');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!profile.business_name.trim()) {
      setError('Business name is required.');
      return;
    }

    if (!profile.category_name) {
      setError('Please select a business category.');
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('business_name', profile.business_name);
      formData.append('category_name', profile.category_name);
      formData.append('description', profile.description || '');
      formData.append('phone', profile.phone || '');
      formData.append('address', profile.address || '');

      // Only append new logo if user selected one
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      await businessService.updateProfile(formData);
      setSuccess('Business profile updated successfully!');

      // If user uploaded a new logo, refresh the logo preview
      if (logoFile) {
        try {
          const logoData = await businessService.getLogo();
          if (logoData && logoData.logo) {
            setLogoBase64(logoData.logo);
            setLogoPreview(null);
            setLogoFile(null);
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Error updating business profile:', err);
      setError(err.message || 'Failed to update business profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your business profile...</p>
      </div>
    );
  }

  const currentLogoSrc = logoPreview 
    ? logoPreview 
    : logoBase64 
      ? `data:image/jpeg;base64,${logoBase64}` 
      : null;

  return (
    <div style={{ maxWidth: '840px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
          Business Profile Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Manage your public artisan profile, category, contact information, and business branding.
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

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          {/* Logo Branding Section */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.75rem', 
            paddingBottom: '2rem', 
            marginBottom: '2rem',
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap'
          }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-subtle)',
              border: '2px dashed var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {currentLogoSrc ? (
                <img 
                  src={currentLogoSrc} 
                  alt="Business Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                  <ImageIcon size={32} />
                </div>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                Business Logo / Avatar
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Supports JPG, PNG or WEBP up to 2 MB. If unchanged, current logo is preserved.
              </p>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} />
                <span>Choose New Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                />
              </label>
              {logoFile && (
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginLeft: '0.75rem', fontWeight: '600' }}>
                  Selected: {logoFile.name}
                </span>
              )}
            </div>
          </div>

          {/* Account Email (Read-only from /api/users/me, no business_email) */}
          <div className="form-group">
            <label className="form-label">Account Login Email</label>
            <input
              type="text"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem', display: 'block' }}>
              Your account email is verified and cannot be changed here.
            </span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="business_name">Business Name *</label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                className="form-input"
                placeholder="e.g. Master Tailors"
                value={profile.business_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category_name">Category *</label>
              <select
                id="category_name"
                name="category_name"
                className="form-select"
                value={profile.category_name}
                onChange={handleInputChange}
                required
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_name}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Contact Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={profile.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Workshop / Shop Address</label>
              <input
                id="address"
                name="address"
                type="text"
                className="form-input"
                placeholder="e.g. 45 Craft Lane, Ward 3"
                value={profile.address}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">About Your Craft / Business</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              rows={3}
              placeholder="Tell customers about your expertise, years of experience, and specialty..."
              value={profile.description}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessProfile;
