import { useState, useEffect } from 'react';
import { getDashboardSummaryAPI, getRecentActivityAPI, getStockLevelsAPI } from '../api/axios';
import { HiOutlineCube, HiOutlineExclamation, HiOutlineTrendingDown, HiOutlineBan, HiOutlineBell } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

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
      setLoading(false);
    }
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
    </div>
  );
};

export default DashboardPage;
