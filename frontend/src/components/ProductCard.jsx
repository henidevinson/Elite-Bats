import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [product?.image]);

  if (!product) return null;
  const isInStock = product.availability === 'In Stock';

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price || 0);

  const handleImageError = (e) => {
    if (!e.target.dataset.triedFallback && product.image && product.image.startsWith('/uploads')) {
      e.target.dataset.triedFallback = 'true';
      e.target.src = `http://localhost:5000${product.image}`;
    } else {
      setImageFailed(true);
    }
  };

  const hasValidImage = product.image && product.image.trim() !== '' && !imageFailed;

  return (
    <div className="product-card">
      <div className="card-image-wrapper">
        <span className={`card-badge ${isInStock ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
          {product.availability}
        </span>
        <span className="card-willow-badge">{product.willowType}</span>

        {hasValidImage ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-card-real-img"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder-inner">
            <span className="bat-icon">🏏</span>
            <span className="image-placeholder-text">Elite Cricket Bat</span>
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="card-meta">
          <span className="card-brand">{product.brand}</span>
          <span className="card-weight">{product.weight || 'Standard'}</span>
        </div>

        <h3 className="card-title">{product.name}</h3>
        <p className="card-description">{product.shortDescription || product.description}</p>

        <div className="card-footer">
          <div className="card-price-block">
            <span className="price-label">Price</span>
            <span className="price-amount">{formattedPrice}</span>
          </div>

          <Link
            to={`/product/${product.id}`}
            className="btn-view-product"
            title={`View details for ${product.name}`}
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
