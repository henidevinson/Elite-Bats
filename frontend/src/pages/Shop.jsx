import { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import './Shop.css';

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWillow, setSelectedWillow] = useState('All');

  const loadProducts = () => {
    setLoading(true);
    setError(null);

    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve bats from the server');
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to connect to product server');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Null-safe search across name and brand
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      const name = (product.name || '').toLowerCase();
      const brand = (product.brand || '').toLowerCase();

      const matchesSearch = term === '' || name.includes(term) || brand.includes(term);
      const matchesWillow = selectedWillow === 'All' || product.willowType === selectedWillow;

      return matchesSearch && matchesWillow;
    });
  }, [products, searchTerm, selectedWillow]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedWillow('All');
  };

  const isFiltered = searchTerm !== '' || selectedWillow !== 'All';

  return (
    <div className="shop-page">
      <div className="shop-header">
        <span className="shop-tag">Catalogue</span>
        <h1 className="shop-title">Cricket Bat Collection</h1>
        <p className="shop-subtitle">
          Explore handcrafted English and Kashmir willow cricket bats updated live from our workshop inventory.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="shop-controls">
        <div className="search-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by bat name or brand (e.g. SS, MRF, SG, Kookaburra)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={selectedWillow}
            onChange={(e) => setSelectedWillow(e.target.value)}
            aria-label="Filter by willow type"
          >
            <option value="All">All Willow Types</option>
            <option value="English Willow">English Willow</option>
            <option value="Kashmir Willow">Kashmir Willow</option>
          </select>
        </div>

        {isFiltered && (
          <button
            type="button"
            className="btn-reset-filters"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#cda35f',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1.25rem'
          }}></div>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b0c0e' }}>
            Loading cricket bats...
          </p>
        </div>
      )}

      {/* Error State with Retry Button */}
      {!loading && error && (
        <div className="empty-state" style={{ borderColor: '#fecaca', backgroundColor: '#fff5f5' }}>
          <div className="empty-icon">⚠️</div>
          <h3 style={{ color: '#991b1b' }}>Unable to Load Catalogue</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            {error}. Please verify the backend is running.
          </p>
          <button
            type="button"
            className="btn-clear-empty"
            onClick={loadProducts}
            style={{ backgroundColor: '#0b0c0e', color: '#ffffff', borderColor: '#cda35f' }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Content Display */}
      {!loading && !error && (
        <>
          <div className="results-info">
            <span className="results-count">
              Showing <strong>{filteredProducts.length}</strong> of{' '}
              <strong>{products.length}</strong> cricket bats
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="shop-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏏</div>
              <h3>No Cricket Bats Found</h3>
              <p>
                {isFiltered
                  ? "We couldn't find any bats matching your search criteria."
                  : "There are currently no bats listed in the catalogue."}
              </p>
              {isFiltered && (
                <button
                  type="button"
                  className="btn-clear-empty"
                  onClick={handleResetFilters}
                >
                  Clear Search & Filters
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Shop;
