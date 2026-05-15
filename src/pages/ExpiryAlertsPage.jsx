import { useState, useEffect } from 'react';
import { getExpiringAPI } from '../api/axios';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const ExpiryAlertsPage = () => {
  const [products, setProducts] = useState([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiring();
  }, [days]);

  const fetchExpiring = async () => {
    setLoading(true);
    try {
      const res = await getExpiringAPI(days);
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

  const getDaysLeft = (d) => {
    if (!d) return 999;
    return Math.ceil((new Date(d) - new Date()) / 86400000);
  };

  const getSeverity = (daysLeft) => {
    if (daysLeft <= 0) return 'red';
    if (daysLeft <= 7) return 'red';
    if (daysLeft <= 30) return 'yellow';
    return 'green';
  };

  return (
    <div>
      {/* Controls */}
      <div className="toolbar">
        <div className="toolbar-left" style={{ gap: 8 }}>
          <HiOutlineExclamationCircle style={{ fontSize: '1.3rem', color: 'var(--warning)' }} />
          <span style={{ fontWeight: 600 }}>Products expiring within</span>
          <select className="form-select" style={{ width: 120 }} value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={180}>180 days</option>
            <option value={365}>365 days</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span className="badge blue">{products.length} items</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No Expiry Alerts</h3>
          <p>No products are expiring within {days} days.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Name</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Days Left</th>
                <th>Supplier</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const dLeft = getDaysLeft(p.expiryDate);
                return (
                  <tr key={p._id}>
                    <td>
                      <span className={`badge ${getSeverity(dLeft)}`}>
                        {dLeft <= 0 ? 'EXPIRED' : dLeft <= 7 ? 'CRITICAL' : 'WARNING'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><code style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{p.barcode}</code></td>
                    <td>{p.category}</td>
                    <td>{p.quantity} {p.unit}</td>
                    <td>{formatDate(p.expiryDate)}</td>
                    <td style={{ fontWeight: 700, color: dLeft <= 7 ? 'var(--danger)' : dLeft <= 30 ? 'var(--warning)' : 'var(--text-primary)' }}>
                      {dLeft <= 0 ? `${Math.abs(dLeft)}d overdue` : `${dLeft}d`}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.supplier?.name || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.location || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpiryAlertsPage;
