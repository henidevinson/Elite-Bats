import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import logoImg from '../assets/logo.png';
import './Home.css';

function Home() {
  const [featuredBats, setFeaturedBats] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  useEffect(() => {
    setLoadingProducts(true);
    setProductError(null);

    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load featured products from the server');
        return res.json();
      })
      .then((data) => {
        setFeaturedBats(Array.isArray(data) ? data.slice(0, 3) : []);
        setLoadingProducts(false);
      })
      .catch((err) => {
        setProductError(err.message || 'Unable to connect to product server');
        setLoadingProducts(false);
      });
  }, []);

  return (
    <div className="home-container">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-wrapper">
          <div className="hero-content">
            <span className="hero-badge">Handcrafted Willow</span>
            <h1 className="hero-title">
              Master Every Stroke With <span>Precision Bats</span>
            </h1>
            <p className="hero-description">
              Engineered for power, perfect balance, and crisp stroke-play.
              Explore handpicked English and Kashmir willow cricket bats built
              for true cricketers.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn-primary">
                Shop Cricket Bats
              </Link>
              <Link to="/contact" className="btn-secondary">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="hero-visual-card">
            <div className="hero-logo-wrapper">
              <img
                src={logoImg}
                alt="Elite Bats Official Emblem"
                className="hero-logo-img"
              />
            </div>
            <h3 className="hero-visual-title">Match Ready Quality</h3>
            <p className="hero-visual-subtitle">
              Expertly shaped blades • Ergonomic cane handles • Maximum sweet spot
            </p>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PRODUCTS SECTION */}
      <section className="section-wrapper">
        <div className="section-header">
          <span className="section-tag">Top Picks</span>
          <h2 className="section-title">Featured Cricket Bats</h2>
          <p className="section-subtitle">
            Handcrafted cricket bats updated live from our workshop inventory.
          </p>
        </div>

        {loadingProducts && (
          <div className="featured-feedback-box">
            <div className="featured-spinner"></div>
            <p style={{ color: '#64748b', fontWeight: 600 }}>Loading featured cricket bats...</p>
          </div>
        )}

        {!loadingProducts && productError && (
          <div className="featured-feedback-box featured-error-card">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h3 style={{ color: '#991b1b', marginBottom: '0.4rem', fontSize: '1.2rem' }}>
              Unable to Load Featured Bats
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              {productError}. Please check that the backend server is running.
            </p>
            <Link to="/shop" className="btn-secondary" style={{ color: '#0b0c0e', borderColor: '#cbd5e1' }}>
              Visit Shop Page
            </Link>
          </div>
        )}

        {!loadingProducts && !productError && featuredBats.length === 0 && (
          <div className="featured-feedback-box">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏏</div>
            <h3 style={{ color: '#0b0c0e', marginBottom: '0.5rem' }}>No Products Available</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              There are currently no cricket bats in the inventory.
            </p>
            <Link to="/contact" className="btn-primary">
              Contact Shreedhar for Orders
            </Link>
          </div>
        )}

        {!loadingProducts && !productError && featuredBats.length > 0 && (
          <div className="products-grid">
            {featuredBats.map((bat) => (
              <ProductCard key={bat.id} product={bat} />
            ))}
          </div>
        )}
      </section>

      {/* 3. WHY CHOOSE US SECTION */}
      <section className="section-wrapper">
        <div className="section-header">
          <span className="section-tag">The Difference</span>
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">
            We focus on authentic willow quality, player comfort, and honest
            guidance for every shot you play.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">⭐</div>
            <h3 className="feature-title">Quality Cricket Bats</h3>
            <p className="feature-desc">
              Genuine English and Kashmir willow handpicked for optimal grain
              structure, punch, and balance.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">🛡️</div>
            <h3 className="feature-title">Wide Product Selection</h3>
            <p className="feature-desc">
              From entry-level club bats to professional match blades in multiple
              weights and handle styles.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">💬</div>
            <h3 className="feature-title">Easy Enquiry</h3>
            <p className="feature-desc">
              Quick questions answered directly on WhatsApp with bat photos,
              weight confirmation, and ping videos.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">🤝</div>
            <h3 className="feature-title">Direct Customer Support</h3>
            <p className="feature-desc">
              Speak directly with Shreedhar for personalized advice on choosing
              the right bat profile for your batting style.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="section-wrapper">
        <div className="cta-banner">
          <div className="cta-text">
            <h3>Ready to Upgrade Your Cricket Gear?</h3>
            <p>
              Have specific weight, ping, or grain requirements? Connect
              directly with Shreedhar on WhatsApp for immediate bat suggestions.
            </p>
          </div>
          <div className="cta-actions">
            <a
              href="https://wa.me/917339410995?text=Hi%20Shreedhar,%20I%20am%20interested%20in%20buying%20a%20cricket%20bat."
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp-large"
            >
              <span>Chat on WhatsApp</span>
            </a>
            <Link to="/shop" className="btn-secondary">
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CONTACT INFORMATION */}
      <section className="section-wrapper">
        <div className="contact-summary-card">
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <span className="section-tag">Direct Details</span>
            <h3 style={{ fontSize: '1.4rem', color: '#0b0c0e' }}>
              Store Contact Information
            </h3>
          </div>

          <div className="contact-summary-grid">
            <div className="contact-item">
              <span className="contact-label">Contact Person</span>
              <span className="contact-val">Shreedhar</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Phone Support</span>
              <span className="contact-val">
                <a href="tel:7339410995">7339410995</a>
              </span>
            </div>
            <div className="contact-item">
              <span className="contact-label">WhatsApp</span>
              <span className="contact-val">
                <a
                  href="https://wa.me/917339410995"
                  target="_blank"
                  rel="noreferrer"
                >
                  +91 7339410995
                </a>
              </span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Instagram</span>
              <span className="contact-val">
                <a
                  href="https://instagram.com/ms.shreedhar"
                  target="_blank"
                  rel="noreferrer"
                >
                  @ms.shreedhar
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
