import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('kafal_admin_token')}` },
});

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  isOutOfStock: false,
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/categories`),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setNewImages([]);
    setExistingImages([]);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category?._id || product.category || '',
      stock: product.stock,
      isOutOfStock: product.isOutOfStock,
    });
    setExistingImages(product.images || []);
    setNewImages([]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyProduct);
    setNewImages([]);
    setExistingImages([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('stock', form.stock);
      formData.append('isOutOfStock', form.isOutOfStock);

      // Add existing images (for edit)
      existingImages.forEach((url) => {
        formData.append('existingImages', url);
      });

      // Add new image files
      newImages.forEach((file) => {
        formData.append('images', file);
      });

      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct._id}`, formData, {
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post(`${API}/admin/products`, formData, {
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API}/admin/products/${productId}`, getAuthHeaders());
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product');
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">Products</h1>

      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={openAddModal} id="add-product-btn">
          <Plus size={16} />
          Add Product
        </button>
        <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
          {products.length} product{products.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div>Loading products...</div>
      ) : products.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
          No products yet. Add your first product.
        </div>
      ) : (
        <div className="admin-product-grid">
          {products.map((product) => (
            <div key={product._id} className="admin-product-card" id={`admin-product-${product._id}`}>
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} className="admin-product-card-image" />
              ) : (
                <div style={{
                  width: '100%', height: '160px', background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--muted)', fontSize: '0.8rem',
                }}>
                  No image
                </div>
              )}
              <div className="admin-product-card-body">
                <div className="admin-product-card-name">{product.name}</div>
                <div className="admin-product-card-price">₹{product.price}</div>
                <div className="admin-product-card-meta">
                  Stock: {product.stock}
                  {product.isOutOfStock && ' · Out of stock'}
                  {product.category?.name && ` · ${product.category.name}`}
                </div>
                <div className="admin-product-card-actions">
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => openEditModal(product)}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(product._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} id="product-form">
              <div className="input-group">
                <label className="input-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Product name"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  name="description"
                  className="input-field"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Product description"
                  rows="3"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    className="input-field"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    className="input-field"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Category</label>
                <select
                  name="category"
                  className="select-field"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="isOutOfStock"
                    checked={form.isOutOfStock}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '0.85rem' }}>Mark as out of stock</span>
              </div>

              {/* Image Upload */}
              <div className="input-group">
                <label className="input-label">Images</label>

                {/* Existing images (edit mode) */}
                {existingImages.length > 0 && (
                  <div className="image-previews" style={{ marginBottom: '8px' }}>
                    {existingImages.map((url, idx) => (
                      <div key={`existing-${idx}`} className="image-preview">
                        <img src={url} alt={`Existing ${idx + 1}`} />
                        <button
                          type="button"
                          className="image-preview-remove"
                          onClick={() => removeExistingImage(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New image previews */}
                {newImages.length > 0 && (
                  <div className="image-previews" style={{ marginBottom: '8px' }}>
                    {newImages.map((file, idx) => (
                      <div key={`new-${idx}`} className="image-preview">
                        <img src={URL.createObjectURL(file)} alt={`New ${idx + 1}`} />
                        <button
                          type="button"
                          className="image-preview-remove"
                          onClick={() => removeNewImage(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className="image-upload-area"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={20} color="var(--muted)" style={{ marginBottom: '4px' }} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Click to upload images (max 5)
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={saving}
              >
                {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
