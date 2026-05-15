import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsAPI, deleteProductAPI } from '../api/axios';
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const categories = ['Engine Parts','Avionics','Hydraulics','Airframe','Landing Gear','Electrical','Fuel System','Pneumatics','Safety Equipment','Consumables','Tools','General'];

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 15 };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await getProductsAPI(params);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteProductAPI(deleteId);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

  const getExpiryBadge = (expiryDate) => {
    if (!expiryDate) return <span className="badge gray">N/A</span>;
    const days = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
    if (days < 0) return <span className="badge red">Expired</span>;
    if (days <= 7) return <span className="badge red">{days}d left</span>;
    if (days <= 30) return <span className="badge yellow">{days}d left</span>;
    return <span className="badge green">{days}d left</span>;
  };

  const getStockBadge = (qty, min) => {
    if (qty === 0) return <span className="badge red">Out of Stock</span>;
    if (qty <= min) return <span className="badge yellow">Low: {qty}</span>;
    return <span className="badge green">{qty}</span>;
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <form onSubmit={handleSearch} className="search-bar" style={{ maxWidth: 320 }}>
            <HiOutlineSearch className="search-icon" />
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <select className="form-select" style={{ width: 180 }} value={category} onChange={(e) => { setCategory(e.target.value); setPagination(p => ({...p, page: 1})); }}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
            <HiOutlinePlus /> Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Products Found</h3>
          <p>Try a different search or add a new product.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Barcode</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Supplier</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><code style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{p.barcode}</code></td>
                    <td>{p.category}</td>
                    <td>{getStockBadge(p.quantity, p.minStockLevel)}</td>
                    <td>{formatDate(p.expiryDate)}</td>
                    <td>{getExpiryBadge(p.expiryDate)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.supplier?.name || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" title="Edit" onClick={() => navigate(`/products/edit/${p._id}`)}>
                          <HiOutlinePencil />
                        </button>
                        <button className="btn-icon" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(p._id)}>
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({...p, page: p.page - 1}))}>Prev</button>
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i + 1} className={pagination.page === i + 1 ? 'active' : ''} onClick={() => setPagination(p => ({...p, page: i + 1}))}>{i + 1}</button>
              ))}
              <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({...p, page: p.page + 1}))}>Next</button>
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing {products.length} of {pagination.total} products
          </p>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this product? This action cannot be undone and will be recorded in the audit log.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
