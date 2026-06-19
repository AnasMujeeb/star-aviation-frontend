import { useState, useEffect } from 'react';
import { getDashboardSummaryAPI, getRecentActivityAPI, getStockLevelsAPI, getToolIssuesAPI, createToolIssueAPI, returnToolIssueAPI } from '../api/axios';
import { HiOutlineCube, HiOutlineExclamation, HiOutlineTrendingDown, HiOutlineBan, HiOutlineBell, HiClipboardList, HiCheckCircle } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const CONDITION_OPTIONS = ['New', 'Good', 'Fair', 'Worn', 'Damaged', 'Needs Repair'];

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Tool Issue State ──
  const [toolIssues, setToolIssues] = useState([]);
  const [toolTab, setToolTab] = useState('Issued'); // 'Issued' | 'All'
  const getLocalDateTimeString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  const [toolForm, setToolForm] = useState({
    toolName: '',
    issuedTo: '',
    issuedAt: getLocalDateTimeString(),
    conditionOnIssue: 'Good',
    comments: '',
  });
  const [toolFormLoading, setToolFormLoading] = useState(false);
  const [toolFormSuccess, setToolFormSuccess] = useState('');
  const [toolFormError, setToolFormError] = useState('');

  // Return modal state
  const [returnModal, setReturnModal] = useState(null); // null or toolIssue object
  const [returnForm, setReturnForm] = useState({ conditionOnReturn: 'Good', returnedAt: '', comments: '' });
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchToolIssues();
  }, [toolTab]);

  const fetchDashboard = async () => {
    try {
      const [sumRes, actRes, stockRes] = await Promise.all([
        getDashboardSummaryAPI(),
        getRecentActivityAPI(10),
        getStockLevelsAPI(),
      ]);
      setSummary(sumRes.data.data);
      setActivity(actRes.data.data);
      setStockLevels(stockRes.data.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      loading && setLoading(false);
    }
  };

  const fetchToolIssues = async () => {
    try {
      const params = {};
      if (toolTab === 'Issued') params.status = 'Issued';
      const res = await getToolIssuesAPI(params);
      setToolIssues(res.data.data);
    } catch (err) {
      console.error('Tool issues fetch error:', err);
    }
  };

  const handleToolFormChange = (e) => {
    setToolForm({ ...toolForm, [e.target.name]: e.target.value });
  };

  const handleToolFormSubmit = async (e) => {
    e.preventDefault();
    setToolFormError('');
    setToolFormSuccess('');
    setToolFormLoading(true);
    try {
      // ─── TIMEZONE FIX START ───
      const [datePart, timePart] = toolForm.issuedAt.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      const localIssuedAt = new Date(year, month - 1, day, hours, minutes);

      const payload = {
        ...toolForm,
        issuedAt: localIssuedAt.toISOString(), 
      };

      await createToolIssueAPI(payload);
      // ─── TIMEZONE FIX END ───

      setToolFormSuccess('Tool issued successfully!');
      setToolForm({
        toolName: '',
        issuedTo: '',
        issuedAt: getLocalDateTimeString(),
        conditionOnIssue: 'Good',
        comments: '',
      });
      fetchToolIssues();
      setTimeout(() => setToolFormSuccess(''), 3000);
    } catch (err) {
      setToolFormError(err.response?.data?.message || 'Failed to issue tool');
    } finally {
      setToolFormLoading(false);
    }
  };

  const openReturnModal = (issue) => {
    setReturnModal(issue);
    setReturnForm({ conditionOnReturn: 'Good', returnedAt: getLocalDateTimeString(), comments: issue.comments || '' });
  };

  const handleReturn = async () => {
    if (!returnModal) return;
    setReturnLoading(true);
    try {
      // ─── TIMEZONE FIX START ───
      const [datePart, timePart] = returnForm.returnedAt.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      const localReturnedAt = new Date(year, month - 1, day, hours, minutes);

      const payload = {
        ...returnForm,
        returnedAt: localReturnedAt.toISOString(),
      };

      await returnToolIssueAPI(returnModal._id, payload);
      // ─── TIMEZONE FIX END ───

      setReturnModal(null);
      fetchToolIssues();
    } catch (err) {
      console.error('Return error:', err);
    } finally {
      setReturnLoading(false);
    }
  };

  const formatDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  const getActionDot = (action) => {
    if (action === 'CREATE') return 'create';
    if (action === 'DELETE') return 'delete';
    if (action.includes('STOCK')) return 'stock';
    return 'update';
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const ov = summary?.overview || {};

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><HiOutlineCube /></div>
          <div className="stat-info">
            <h3>{ov.totalProducts || 0}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><HiOutlineCube /></div>
          <div className="stat-info">
            <h3>{ov.totalQuantity || 0}</h3>
            <p>Total Stock Units</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><HiOutlineExclamation /></div>
          <div className="stat-info">
            <h3>{ov.expiringSoonCount || 0}</h3>
            <p>Expiring Soon</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><HiOutlineBan /></div>
          <div className="stat-info">
            <h3>{ov.expiredCount || 0}</h3>
            <p>Expired Items</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><HiOutlineTrendingDown /></div>
          <div className="stat-info">
            <h3>{ov.lowStockCount || 0}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><HiOutlineBell /></div>
          <div className="stat-info">
            <h3>{ov.unreadNotifications || 0}</h3>
            <p>Unread Alerts</p>
          </div>
        </div>
      </div>

      {/* Charts + Activity */}
      <div className="dashboard-grid">
        {/* Stock by Category Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Stock by Category</h3>
          </div>
          {stockLevels.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stockLevels}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3154" />
                <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid #2a3154', borderRadius: 8, color: '#f1f5f9' }} />
                <Bar dataKey="totalQuantity" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Qty" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No stock data</p></div>
          )}
        </div>

        {/* Category Distribution Pie */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Category Distribution</h3>
          </div>
          {summary?.categoryCounts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={summary.categoryCounts} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({ category, count }) => `${category}: ${count}`}>
                  {summary.categoryCounts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid #2a3154', borderRadius: 8, color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No category data</p></div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card full-width">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          {activity.length > 0 ? (
            <div className="activity-list">
              {activity.map((item) => (
                <div className="activity-item" key={item._id}>
                  <div className={`activity-dot ${getActionDot(item.action)}`} />
                  <span className="activity-text">
                    <strong>{item.userName}</strong> — {item.details || `${item.action} on ${item.entity}`}
                  </span>
                  <span className="activity-time">{formatTime(item.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>No recent activity</p></div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TOOL ISSUE & RETURN TRACKING SECTION
         ═══════════════════════════════════════════════════════════ */}
      <div className="tool-issue-section">
        <div className="tool-issue-section-header">
          <div className="tool-issue-section-title">
            <HiClipboardList className="tool-issue-title-icon" style={{ fontSize: '1.75rem', marginRight: '10px' }} />
            <div>
              <h2>Tool Issue & Return Tracking</h2>
              <p>Track tools issued to technicians and manage returns</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* ── Issue Form ── */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Log New Tool Issue</h3>
            </div>

            {toolFormSuccess && <div className="alert alert-success">{toolFormSuccess}</div>}
            {toolFormError && <div className="alert alert-error">{toolFormError}</div>}

            <form onSubmit={handleToolFormSubmit}>
              <div className="form-group">
                <label className="form-label">Tool Name *</label>
                <input
                  className="form-input"
                  type="text"
                  name="toolName"
                  placeholder="e.g. Torque Wrench 25Nm"
                  value={toolForm.toolName}
                  onChange={handleToolFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Issued To (Technician) *</label>
                <input
                  className="form-input"
                  type="text"
                  name="issuedTo"
                  placeholder="e.g. Ahmed Khan"
                  value={toolForm.issuedTo}
                  onChange={handleToolFormChange}
                  required
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Issue Date & Time *</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    name="issuedAt"
                    value={toolForm.issuedAt}
                    onChange={handleToolFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Condition on Issue *</label>
                  <select
                    className="form-select"
                    name="conditionOnIssue"
                    value={toolForm.conditionOnIssue}
                    onChange={handleToolFormChange}
                    required
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Comments</label>
                <textarea
                  className="form-textarea"
                  name="comments"
                  placeholder="Optional remarks..."
                  value={toolForm.comments}
                  onChange={handleToolFormChange}
                  rows={3}
                />
              </div>
              <div className="form-row">
                <button type="submit" className="btn btn-primary" disabled={toolFormLoading}>
                  <HiCheckCircle style={{ marginRight: '6px', fontSize: '1.1rem' }} />
                  {toolFormLoading ? 'Logging...' : 'Log Tool Issue'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Tracking Table ── */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Issued Tools Tracker</h3>
              <div className="tool-tab-group">
                <button
                  className={`btn btn-sm ${toolTab === 'Issued' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setToolTab('Issued')}
                >
                  Active
                </button>
                <button
                  className={`btn btn-sm ${toolTab === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setToolTab('All')}
                >
                  All Logs
                </button>
              </div>
            </div>

            {toolIssues.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Tool</th>
                      <th>Issued To</th>
                      <th>Issued At</th>
                      <th>Returned At</th>
                      <th>Condition</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toolIssues.map((issue) => (
                      <tr key={issue._id}>
                        <td style={{ fontWeight: 600 }}>{issue.toolName}</td>
                        <td>{issue.issuedTo}</td>
                        <td>{formatDateTime(issue.issuedAt)}</td>
                        <td>{formatDateTime(issue.returnedAt)}</td>
                        <td>
                          <span className="badge blue">{issue.conditionOnIssue}</span>
                          {issue.conditionOnReturn && (
                            <>
                              {' → '}
                              <span className="badge gray">{issue.conditionOnReturn}</span>
                            </>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${issue.status === 'Issued' ? 'yellow' : 'green'}`}>
                            {issue.status}
                          </span>
                        </td>
                        <td>
                          {issue.status === 'Issued' ? (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => openReturnModal(issue)}
                            >
                              Mark Returned
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🔧</div>
                <h3>No {toolTab === 'Issued' ? 'active issues' : 'records'} found</h3>
                <p>{toolTab === 'Issued' ? 'All tools have been returned.' : 'No tool issue records yet.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Return Modal ── */}
      {returnModal && (
        <div className="modal-overlay" onClick={() => setReturnModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Return Tool</h2>
              <button className="modal-close" onClick={() => setReturnModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Returning <strong>{returnModal.toolName}</strong> issued to <strong>{returnModal.issuedTo}</strong>
              </p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Return Date & Time *</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={returnForm.returnedAt}
                    onChange={(e) => setReturnForm({ ...returnForm, returnedAt: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Condition on Return *</label>
                  <select
                    className="form-select"
                    value={returnForm.conditionOnReturn}
                    onChange={(e) => setReturnForm({ ...returnForm, conditionOnReturn: e.target.value })}
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Return Comments</label>
                <textarea
                  className="form-textarea"
                  value={returnForm.comments}
                  onChange={(e) => setReturnForm({ ...returnForm, comments: e.target.value })}
                  placeholder="Any notes about the return..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setReturnModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handleReturn} disabled={returnLoading}>
                {returnLoading ? 'Processing...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
