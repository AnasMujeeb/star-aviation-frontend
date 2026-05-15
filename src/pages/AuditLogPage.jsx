import { useState, useEffect } from 'react';
import { getAuditLogsAPI } from '../api/axios';

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 20 };
      if (actionFilter) params.action = actionFilter;
      const res = await getAuditLogsAPI(params);
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleString();

  const getActionBadge = (action) => {
    const map = { CREATE: 'green', UPDATE: 'blue', DELETE: 'red', STOCK_IN: 'green', STOCK_OUT: 'yellow' };
    return <span className={`badge ${map[action] || 'gray'}`}>{action}</span>;
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-left">
          <select className="form-select" style={{ width: 180 }} value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}>
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="STOCK_IN">Stock In</option>
            <option value="STOCK_OUT">Stock Out</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span className="badge gray">{pagination.total} total entries</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Audit Logs</h3>
          <p>No actions have been recorded yet.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Details</th>
                  <th>Changes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{formatTime(log.timestamp)}</td>
                    <td>{getActionBadge(log.action)}</td>
                    <td style={{ fontWeight: 500 }}>{log.userName || '—'}</td>
                    <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.details || '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.changes && Object.keys(log.changes).length > 0
                        ? Object.entries(log.changes).map(([k, v]) => `${k}: ${v.from} → ${v.to}`).join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({...p, page: p.page - 1}))}>Prev</button>
              {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => (
                <button key={i + 1} className={pagination.page === i + 1 ? 'active' : ''} onClick={() => setPagination(p => ({...p, page: i + 1}))}>{i + 1}</button>
              ))}
              <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({...p, page: p.page + 1}))}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogPage;
