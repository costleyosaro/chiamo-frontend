// src/pages/NotFound.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiSearch, FiShoppingCart, FiPackage } from 'react-icons/fi';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Animated 404 */}
        <div style={styles.errorCode}>
          <span style={styles.four}>4</span>
          <span style={styles.zero}>0</span>
          <span style={styles.four}>4</span>
        </div>

        {/* Icon */}
        <div style={styles.iconWrapper}>
          <FiPackage style={styles.icon} />
        </div>

        {/* Message */}
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.subtitle}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            onClick={() => navigate(-1)}
            style={styles.secondaryBtn}
          >
            <FiArrowLeft />
            Go Back
          </button>

          <Link to="/" style={styles.primaryBtn}>
            <FiHome />
            Home Page
          </Link>

          <Link to="/all-products" style={styles.secondaryBtn}>
            <FiShoppingCart />
            Shop Products
          </Link>
        </div>

        {/* Search Suggestion */}
        <div style={styles.searchBox}>
          <p style={styles.searchText}>Looking for something specific?</p>
          <Link to="/all-products" style={styles.searchLink}>
            <FiSearch />
            Search our products
          </Link>
        </div>

        {/* Footer */}
        <p style={styles.footer}>
          © {new Date().getFullYear()} ChiamoOrder — Shop Smarter, Order Faster
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
  },
  errorCode: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  four: {
    fontSize: '80px',
    fontWeight: '800',
    color: '#1b4b8c',
    lineHeight: 1,
  },
  zero: {
    fontSize: '80px',
    fontWeight: '800',
    color: '#f5a623',
    lineHeight: 1,
    animation: 'bounce 2s infinite',
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1b4b8c, #2563eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 10px 30px rgba(27, 75, 140, 0.3)',
  },
  icon: {
    fontSize: '36px',
    color: '#fff',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 12px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 32px',
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #1b4b8c, #2563eb)',
    color: '#fff',
    borderRadius: '12px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    boxShadow: '0 4px 15px rgba(27, 75, 140, 0.3)',
    transition: 'all 0.3s ease',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#fff',
    color: '#1b4b8c',
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  searchBox: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    border: '1px solid #e0e0e0',
  },
  searchText: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 12px',
  },
  searchLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#1b4b8c',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '15px',
  },
  footer: {
    fontSize: '13px',
    color: '#999',
  },
};