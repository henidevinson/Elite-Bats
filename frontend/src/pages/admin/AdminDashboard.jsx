import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [apiHealth, setApiHealth] = useState({ status: 'loading', message: 'Checking API...' });

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    brand: '',
    price: '',
    willowType: 'English Willow',
    weight: '1180g - 1200g',
    availability: 'In Stock',
    shortDescription: '',
    description: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Helper to fetch stored authentication token
  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const handleAuthError = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const fetchProducts = () => {
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const checkHealth = () => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('API unreachable');
        return res.json();
      })
      .then((data) => {
        setApiHealth({ status: 'ok', message: data.message || 'Operational' });
      })
      .catch(() => {
        setApiHealth({ status: 'error', message: 'Offline / Unreachable' });
      });
  };

  useEffect(() => {
    fetchProducts();
    checkHealth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', headers: getAuthHeader() });
    } catch {}
    handleAuthError();
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      name: '',
      brand: '',
      price: '',
      willowType: 'English Willow',
      weight: '1180g - 1200g',
      availability: 'In Stock',
      shortDescription: '',
      description: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setPreviewError(false);
    setRemoveExistingImage(false);
    setFormError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setModalOpen(true);
  };

  const handleOpenEdit = (bat) => {
    setIsEditing(true);
    setFormData({
      id: bat.id,
      name: bat.name,
      brand: bat.brand,
      price: bat.price,
      willowType: bat.willowType,
      weight: bat.weight || '',
      availability: bat.availability || 'In Stock',
      shortDescription: bat.shortDescription || '',
      description: bat.description || ''
    });
    setSelectedFile(null);
    setPreviewUrl(bat.image || '');
    setPreviewError(false);
    setRemoveExistingImage(false);
    setFormError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPreviewError(false);
      setRemoveExistingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setPreviewError(false);
    setRemoveExistingImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Bat name is required.');
      return;
    }
    if (!formData.brand.trim()) {
      setFormError('Brand is required.');
      return;
    }
    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setFormError('Please enter a valid non-negative price.');
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('brand', formData.brand.trim());
    data.append('price', String(formData.price).trim());
    data.append('willowType', formData.willowType);
    data.append('weight', formData.weight || '');
    data.append('availability', formData.availability);
    data.append('shortDescription', formData.shortDescription || '');
    data.append('description', formData.description || '');

    if (selectedFile) {
      data.append('image', selectedFile);
    }
    if (removeExistingImage) {
      data.append('removeImage', 'true');
    }

    const url = isEditing ? `/api/products/${formData.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeader(), // Attached Bearer Token
        body: data
      });

      if (response.status === 401 || response.status === 403) {
        alert('Your admin session has expired. Please log in again.');
        handleAuthError();
        return;
      }

      const text = await response.text();
      let resJson = {};
      try {
        resJson = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Server error occurred.');
      }

      if (!response.ok) {
        throw new Error(resJson.error || 'Failed to save product.');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.message || 'Error communicating with server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader() // Attached Bearer Token
      });

      if (res.status === 401 || res.status === 403) {
        alert('Your admin session has expired. Please log in again.');
        handleAuthError();
        return;
      }

      const text = await res.text();
      let resJson = {};
      try {
        resJson = text ? JSON.parse(text) : {};
      } catch {}

      if (res.ok) {
        fetchProducts();
      } else {
        alert(resJson.error || 'Failed to delete product.');
      }
    } catch {
      alert('Network error while deleting product.');
    }
  };

  const handleTableImgError = (e, batImage) => {
    if (!e.target.dataset.triedFallback && batImage && batImage.startsWith('/uploads')) {
      e.target.dataset.triedFallback = 'true';
      e.target.src = `http://localhost:5000${batImage}`;
    } else {
      e.target.style.display = 'none';
      if (e.target.nextElementSibling) {
        e.target.nextElementSibling.style.display = 'flex';
      }
    }
  };

  const inStockCount = products.filter((p) => p.availability === 'In Stock').length;

  return (
    <div className="admin-dashboard-container">
      {/* 1. Header Bar */}
      <div className="admin-header-bar">
        <div className="admin-title-group">
          <h1>Product Management</h1>
          <p className="admin-welcome-tag">
            Store Administrator: <strong>Shreedhar</strong> &bull; Elite Bats Workshop
          </p>
        </div>

        <div className="admin-header-actions">
          <button type="button" onClick={handleOpenAdd} className="btn-add-product">
            <span>+</span> Add Cricket Bat
          </button>
          <button type="button" onClick={handleLogout} className="btn-admin-logout">
            Logout
          </button>
        </div>
      </div>

      {/* 2. Top Summary Stat Cards */}
      <div className="admin-stats-summary" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="admin-stat-item">
          <div className="admin-stat-icon-box">🏏</div>
          <div className="admin-stat-details">
            <span className="admin-stat-number">{products.length}</span>
            <span className="admin-stat-label">Total Cricket Bats</span>
          </div>
        </div>

        <div className="admin-stat-item">
          <div className="admin-stat-icon-box">✅</div>
          <div className="admin-stat-details">
            <span className="admin-stat-number">{inStockCount}</span>
            <span className="admin-stat-label">In Stock Items</span>
          </div>
        </div>

        <div className="admin-stat-item">
          <div className="admin-stat-icon-box">💾</div>
          <div className="admin-stat-details">
            <span className="admin-stat-number" style={{ fontSize: '1.15rem' }}>
              SQLite
            </span>
            <span className="admin-stat-label">Storage Engine</span>
          </div>
        </div>

        <div className="admin-stat-item">
          <div className="admin-stat-icon-box">
            {apiHealth.status === 'ok' ? '🟢' : apiHealth.status === 'error' ? '🔴' : '🟡'}
          </div>
          <div className="admin-stat-details">
            <span
              className="admin-stat-number"
              style={{
                fontSize: '1.05rem',
                color: apiHealth.status === 'ok' ? '#065f46' : '#991b1b'
              }}
            >
              {apiHealth.status === 'ok' ? 'Live & Connected' : 'Unreachable'}
            </span>
            <span className="admin-stat-label">Backend API Status</span>
          </div>
        </div>
      </div>

      {/* 3. Product Inventory Table */}
      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          {loading ? (
            <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              Loading bat catalogue...
            </p>
          ) : products.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '1rem' }}>
                No cricket bats currently in the database.
              </p>
              <button type="button" onClick={handleOpenAdd} className="btn-add-product">
                + Add Your First Bat
              </button>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="col-thumb">Image</th>
                  <th>Bat Details</th>
                  <th>Brand</th>
                  <th>Willow</th>
                  <th>Price</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((bat) => (
                  <tr key={bat.id}>
                    <td className="col-thumb">
                      {bat.image && bat.image.trim() !== '' ? (
                        <>
                          <img
                            src={bat.image}
                            alt={bat.name}
                            className="admin-thumb-img"
                            onError={(e) => handleTableImgError(e, bat.image)}
                          />
                          <div className="admin-thumb-fallback" style={{ display: 'none' }}>🏏</div>
                        </>
                      ) : (
                        <div className="admin-thumb-fallback">🏏</div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{bat.name}</div>
                      {bat.weight && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Weight: {bat.weight}
                        </div>
                      )}
                    </td>

                    <td>
                      <strong style={{ color: '#475569' }}>{bat.brand}</strong>
                    </td>

                    <td>
                      <span className="admin-willow-tag">{bat.willowType}</span>
                    </td>

                    <td className="col-price">
                      ₹{Number(bat.price).toLocaleString('en-IN')}
                    </td>

                    <td className="col-status">
                      <span
                        className={`admin-status-badge ${
                          bat.availability === 'In Stock'
                            ? 'badge-stock-in'
                            : 'badge-stock-out'
                        }`}
                      >
                        {bat.availability}
                      </span>
                    </td>

                    <td className="col-actions">
                      <div className="admin-actions-group">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(bat)}
                          className="btn-action-edit"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(bat.id, bat.name)}
                          className="btn-action-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 4. Add / Edit Product Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Cricket Bat' : 'Add New Cricket Bat'}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                padding: '0.85rem',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: '1px solid #fecaca'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Bat Name *</label>
                  <input
                    type="text"
                    required
                    maxLength="100"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. SS Master 7000"
                  />
                </div>
                <div className="form-field">
                  <label>Brand *</label>
                  <input
                    type="text"
                    required
                    maxLength="50"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. SS, MRF, SG, Kookaburra"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Price (INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="500000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 15499"
                  />
                </div>
                <div className="form-field">
                  <label>Willow Type *</label>
                  <select
                    value={formData.willowType}
                    onChange={(e) => setFormData({ ...formData, willowType: e.target.value })}
                  >
                    <option value="English Willow">English Willow</option>
                    <option value="Kashmir Willow">Kashmir Willow</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Weight</label>
                  <input
                    type="text"
                    maxLength="30"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g. 1180g - 1200g"
                  />
                </div>
                <div className="form-field">
                  <label>Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="image-upload-box">
                <span className="image-upload-header">
                  Product Image (JPG, PNG, WEBP &bull; Max 5MB)
                </span>

                {previewUrl && !previewError ? (
                  <div className="image-preview-wrapper">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="image-preview-img"
                      onError={() => setPreviewError(true)}
                    />
                    <div className="image-preview-actions">
                      <span className="image-preview-meta">
                        {selectedFile ? `Selected: ${selectedFile.name}` : 'Current Product Image'}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="btn-remove-img"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    No image uploaded. A clean bat placeholder will be shown automatically.
                  </p>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileChange}
                  className="file-input-control"
                />
              </div>

              <div className="form-field">
                <label>Short Description</label>
                <input
                  type="text"
                  maxLength="300"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Summary for product cards and previews"
                />
              </div>

              <div className="form-field">
                <label>Full Description</label>
                <textarea
                  rows="3"
                  maxLength="3000"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Grain details, spine profile, edge thickness, handle type..."
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-save"
                >
                  {submitting ? 'Saving...' : isEditing ? 'Update Bat' : 'Create Bat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
