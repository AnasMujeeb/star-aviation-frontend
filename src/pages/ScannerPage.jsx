import { useState } from 'react';
import { scanLookupAPI, scanStockInAPI, scanStockOutAPI } from '../api/axios';
import { HiOutlineQrcode, HiOutlineSearch, HiOutlinePlus, HiOutlineMinus } from 'react-icons/hi';

const ScannerPage = () => {
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    setError('');
    setMessage('');
    setProduct(null);
    setLoading(true);
    try {
      const res = await scanLookupAPI(barcode.trim());
      setProduct(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleStockIn = async () => {
    if (!product || quantity < 1) return;
    setMessage('');
    setError('');
    try {
      const res = await scanStockInAPI({ barcode: product.barcode, quantity });
      setProduct(res.data.data);
      setMessage(`✅ Added ${quantity} units. New stock: ${res.data.data.quantity}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Stock-in failed');
    }
  };

  const handleStockOut = async () => {
    if (!product || quantity < 1) return;
    setMessage('');
    setError('');
    try {
      const res = await scanStockOutAPI({ barcode: product.barcode, quantity });
      setProduct(res.data.data);
      setMessage(`✅ Removed ${quantity} units. New stock: ${res.data.data.quantity}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Stock-out failed');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

  const getDaysLeft = (d) => {
    if (!d) return null;
    return Math.ceil((new Date(d) - new Date()) / 86400000);
  };

  return (
    <div>
      {/* Scanner Input */}
      <div className="scanner-input-area">
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <HiOutlineQrcode style={{ fontSize: '3rem', color: 'var(--accent)', opacity: 0.6 }} />
            <h3 style={{ marginTop: 8 }}>Barcode Scanner</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Enter or scan a barcode to look up product details
            </p>
          </div>
          <form onSubmit={handleLookup}>
            <div className="search-bar" style={{ marginBottom: 14 }}>
              <HiOutlineSearch className="search-icon" />
              <input
                placeholder="Enter barcode (e.g. SAA-001AXR)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Searching...' : 'Look Up Product'}
            </button>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ maxWidth: 500, margin: '16px auto' }}>{error}</div>}
      {message && <div className="alert alert-success" style={{ maxWidth: 500, margin: '16px auto' }}>{message}</div>}

      {/* Product Result */}
      {product && (
        <div className="scanner-result" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{product.name}</h3>
              <span className={`badge ${product.lifecycleStatus === 'Active' ? 'green' : product.lifecycleStatus === 'Expired' ? 'red' : 'yellow'}`}>
                {product.lifecycleStatus}
              </span>
            </div>

            <div className="product-detail-grid">
              <div className="detail-item"><label>Barcode</label><p style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{product.barcode}</p></div>
              <div className="detail-item"><label>Category</label><p>{product.category}</p></div>
              <div className="detail-item"><label>Quantity</label><p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{product.quantity} {product.unit}</p></div>
              <div className="detail-item"><label>Min Stock</label><p>{product.minStockLevel} {product.unit}</p></div>
              <div className="detail-item"><label>Expiry Date</label><p>{formatDate(product.expiryDate)}</p></div>
              <div className="detail-item">
                <label>Days Until Expiry</label>
                <p>{(() => { const d = getDaysLeft(product.expiryDate); return d !== null ? (d < 0 ? <span style={{color:'var(--danger)'}}>Expired {Math.abs(d)}d ago</span> : `${d} days`) : '—'; })()}</p>
              </div>
              <div className="detail-item"><label>Part Number</label><p>{product.partNumber || '—'}</p></div>
              <div className="detail-item"><label>Condition</label><p>{product.condition}</p></div>
              <div className="detail-item"><label>Supplier</label><p>{product.supplier?.name || '—'}</p></div>
              <div className="detail-item"><label>Location</label><p>{product.location || '—'}</p></div>
            </div>

            {/* Stock Adjustment */}
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Stock Adjustment</h4>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="number" className="form-input"
                  style={{ width: 100 }}
                  value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                />
                <button className="btn btn-success" onClick={handleStockIn}>
                  <HiOutlinePlus /> Stock In
                </button>
                <button className="btn btn-danger" onClick={handleStockOut}>
                  <HiOutlineMinus /> Stock Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
