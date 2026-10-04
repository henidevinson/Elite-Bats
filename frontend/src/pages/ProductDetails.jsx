import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  const business = {
    brand: 'Elite Bats',
    contactPerson: 'Shreedhar',
    phone: '7339410995',
    whatsapp: '7339410995',
    email: 'silvashreedhar539@gmail.com'
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    setImageFailed(false);

    fetch(`/api/products/${id}`)
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`Failed to load product details (status ${res.status})`);
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not connect to the server');
        setLoading(false);
      });
  }, [id]);

  const handleImageError = (e) => {
    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const backendBase = isProd ? 'https://elite-bats-api.onrender.com' : 'http://localhost:5000';

    if (!e.target.dataset.triedFallback && product.image && product.image.startsWith('/uploads')) {
      e.target.dataset.triedFallback = 'true';
      e.target.src = `${backendBase}${product.image}`;
    } else {
      setImageFailed(true);
    }
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="details-loading-container">
          <div className="details-spinner"></div>
          <p className="details-loading-text">Loading cricket bat details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-page">
        <div className="not-found-container" style={{ borderColor: '#fecaca' }}>
          <div className="not-found-icon">⚠️</div>
          <h2 className="not-found-title" style={{ color: '#991b1b' }}>Connection Error</h2>
          <p className="not-found-message">{error}</p>
          <Link to="/shop" className="back-to-shop-btn">
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="not-found-container">
          <div className="not-found-icon">🏏</div>
          <h2 className="not-found-title">Product Not Found</h2>
          <p className="not-found-message">
            Sorry, we could not find a cricket bat matching the ID &ldquo;{id}&rdquo;.
          </p>
          <Link to="/shop" className="back-to-shop-btn">
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const isInStock = product.availability === 'In Stock';

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price || 0);

  const whatsappMessage = `Hello ${business.brand}, I am interested in inquiring about the "${product.name}" (${formattedPrice}). Is this bat currently available?`;
  const whatsappUrl = `https://wa.me/91${business.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
  const phoneCallUrl = `tel:${business.phone}`;

  const emailSubject = `Enquiry for ${product.name} - ${business.brand}`;
  const emailBody = `Hi ${business.contactPerson},\n\nI would like to inquire about the following bat:\n\nProduct Name: ${product.name}\nBrand: ${product.brand}\nWillow Type: ${product.willowType}\nWeight: ${product.weight || 'Standard'}\nPrice: ${formattedPrice}\n\nPlease let me know about current stock, ping videos, and dispatch.\n\nThank you!`;
  const mailtoUrl = `mailto:${business.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const hasValidImage = product.image && product.image.trim() !== '' && !imageFailed;

  return (
    <div className="product-details-page">
      <div className="breadcrumb-bar">
        <Link to="/shop" className="back-to-shop-btn">
          ← Back to Shop
        </Link>
      </div>

      <div className="details-grid">
        <div className="details-image-box">
          <span
            className={`details-image-badge-left ${
              isInStock ? 'badge-in-stock' : 'badge-out-of-stock'
            }`}
          >
            {product.availability}
          </span>
          <span className="details-image-badge-right">{product.willowType}</span>

          {hasValidImage ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-real-img"
              onError={handleImageError}
            />
          ) : (
            <div className="image-placeholder-inner">
              <span className="details-bat-icon">🏏</span>
              <span className="details-image-caption">Elite Cricket Bat</span>
            </div>
          )}
        </div>

        <div className="details-info">
          <span className="details-brand">{product.brand}</span>
          <h1 className="details-title">{product.name}</h1>

          {product.shortDescription && (
            <p className="details-short-desc">{product.shortDescription}</p>
          )}

          <div className="details-price-row">
            <span className="details-price">{formattedPrice}</span>
          </div>

          <div className="details-specs-grid">
            <div className="spec-item">
              <span className="spec-label">Willow Type</span>
              <span className="spec-value">{product.willowType}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Weight</span>
              <span className="spec-value">{product.weight || 'Standard'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Availability</span>
              <span className="spec-value">{product.availability}</span>
            </div>
          </div>

          <div className="details-description-box">
            <h3 className="details-section-heading">Description & Profile</h3>
            <p className="details-description-text">
              {product.description || 'Custom crafted cricket bat tuned for punch, balance, and stroke longevity.'}
            </p>
          </div>

          <div className="enquiry-actions-box">
            <h3 className="enquiry-box-title">Interested in this bat?</h3>
            <p className="enquiry-box-desc">
              Contact <strong>{business.contactPerson}</strong> directly for video pings,
              weight confirmation, or custom knocking services.
            </p>

            <div className="enquiry-buttons">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp-enquire"
              >
                <span>💬 Enquire on WhatsApp</span>
              </a>

              <div className="enquiry-secondary-row">
                <a href={phoneCallUrl} className="btn-call-enquire">
                  <span>📞 Call {business.phone}</span>
                </a>
                <a href={mailtoUrl} className="btn-email-enquire">
                  <span>✉️ Email Enquiry</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
