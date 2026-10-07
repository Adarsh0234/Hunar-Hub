import React from 'react';
import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      background: 'white',
      borderTop: '1px solid var(--border-color)',
      padding: '3rem 0 2rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div className="brand-badge" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>H</div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                Hunar<span style={{ color: 'var(--primary)' }}>Hub</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Empowering local micro-entrepreneurs, craftsmen, and home-based service providers by connecting them directly to valued community customers.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Artisan Categories
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Tailors & Dressmakers<br />
              Clay & Pottery Artists<br />
              Cobblers & Leathercraft<br />
              Handmade Artisans<br />
              Small Vendors & Repairers
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Marketplace
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <li>Browse Authentic Products</li>
              <li>Book Local Services</li>
              <li>Order Tracking</li>
              <li>Verified Customer Reviews</li>
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.825rem',
          color: 'var(--text-muted)'
        }}>
          <p>© {new Date().getFullYear()} HunarHub. Built for local empowerment.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Supporting local talent with <Heart size={14} color="#ea580c" fill="#ea580c" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
