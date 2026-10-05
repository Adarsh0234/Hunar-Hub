import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Boxes
} from 'lucide-react';

export const BusinessProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding new

  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    stock: '',
  });

  useEffect(() => {
    loadMyProducts();
  }, []);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getMyProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ product_name: '', description: '', price: '', stock: '' });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
    });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      setError('Please enter a valid price.');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setError('Please enter a valid stock quantity.');
      return;
    }

    try {
      setActionLoading(true);
      if (editingProduct) {
        // Edit existing product
        await productService.updateProduct(editingProduct.product_id, {
          product_name: formData.product_name,
          description: formData.description,
          price: priceNum,
          stock: stockNum,
        });
        setSuccess('Product updated successfully!');
      } else {
        // Create new product
        await productService.createProduct({
          product_name: formData.product_name,
          description: formData.description,
          price: priceNum,
          stock: stockNum,
        });
        setSuccess('Product created successfully!');
      }

      handleCloseModal();
      await loadMyProducts();
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await productService.deleteProduct(productId);
      setSuccess(`Product "${name}" deleted successfully.`);
      await loadMyProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Products Inventory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            List, update pricing, manage stock, and catalog items offered by your business.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
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

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <Boxes className="empty-state-icon" />
          <h3>No products added yet</h3>
          <p>Start showcasing your artisanal handcrafted items to local buyers today.</p>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Your First Product</span>
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.product_id}>
                  <td style={{ fontWeight: '700' }}>{prod.product_name}</td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {prod.description || '—'}
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                    ₹{Number(prod.price).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${prod.stock > 0 ? 'badge-delivered' : 'badge-cancelled'}`}>
                      {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleOpenEdit(prod)} 
                        className="btn btn-secondary btn-sm"
                        title="Edit Product"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(prod.product_id, prod.product_name)} 
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Product"
                        disabled={actionLoading}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                onClick={handleCloseModal} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="prod_name">Product Name *</label>
                <input
                  id="prod_name"
                  name="product_name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Handcrafted Clay Water Jug"
                  value={formData.product_name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod_price">Price (₹) *</label>
                  <input
                    id="prod_price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="299.00"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod_stock">Stock Quantity *</label>
                  <input
                    id="prod_stock"
                    name="stock"
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="10"
                    value={formData.stock}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod_desc">Description</label>
                <textarea
                  id="prod_desc"
                  name="description"
                  className="form-textarea"
                  rows={3}
                  placeholder="Details on material, size, craftsmanship..."
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessProducts;
