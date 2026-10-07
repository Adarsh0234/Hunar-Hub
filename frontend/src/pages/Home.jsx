import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import businessService from '../services/businessService';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Store 
} from 'lucide-react';
import { ACCOUNT_TYPES } from '../constants';

export const Home = () => {
  const { isAuthenticated, isBusinessUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const data = await businessService.getCategories();
        if (Array.isArray(data)) setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              border: '1px solid #fde68a',
              padding: '0.4rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: 'var(--primary-dark)',
              marginBottom: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
              maxWidth: '100%',
              flexWrap: 'wrap'
            }}>
              <Sparkles size={16} color="var(--primary)" />
              <span>Connecting Local Talent with Everyday Customers</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.85rem, 5vw, 3.4rem)',
              fontWeight: '800',
              color: 'var(--text-main)',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem'
            }}>
              Support Local Entrepreneurs & Book Skilled Services with <span style={{ color: 'var(--primary)' }}>HunarHub</span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              Discover authentic handmade crafts, tailor alterations, clay pottery, repair services, and more — directly from hardworking micro-entrepreneurs in your community.
            </p>

            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                <ShoppingBag size={20} />
                <span>Shop Products</span>
              </Link>

              <Link to="/services" className="btn btn-secondary btn-lg">
                <Wrench size={20} />
                <span>Book Services</span>
              </Link>

              {(!isAuthenticated || isBusinessUser) && (
                <Link 
                  to={isAuthenticated ? "/dashboard" : "/register"} 
                  className="btn btn-teal btn-lg"
                >
                  <Store size={20} />
                  <span>{isAuthenticated ? "My Business Hub" : "Join as an Artisan"}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Explore Local Craft & Trades
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Dynamically powered by verified artisan businesses on HunarHub
            </p>
          </div>

          <div className="grid-3">
            {categories.map((cat) => (
              <div 
                key={cat.category_id} 
                className="card card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.5rem',
                  borderLeft: '4px solid var(--primary)'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.25rem'
                }}>
                  {cat.category_name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                    {cat.category_name}
                  </h3>
                  <Link 
                    to={`/products?category=${cat.category_id}`}
                    style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <span>View Artisans</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section style={{ background: 'white', padding: '4.5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="grid-3">
            <div style={{ textAlign: 'left' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                100% Verified Community Artisans
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Every business profile is tied to real verified phone & email credentials to ensure genuine service delivery.
              </p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--secondary-light)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Direct Economic Empowerment
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                By purchasing or booking through HunarHub, 100% of your patronage supports local craftspeople and neighborhood entrepreneurs.
              </p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Authentic Customer Reviews
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Only verified buyers who completed a service or purchased a product can submit transparent ratings and feedback.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
