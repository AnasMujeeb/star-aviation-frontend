import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineViewGrid, HiOutlineCube, HiOutlinePlusCircle,
  HiOutlineQrcode, HiOutlineExclamationCircle, HiOutlineClipboardList,
} from 'react-icons/hi';

const navItems = [
  { section: 'Overview', items: [
    { path: '/', label: 'Dashboard', icon: HiOutlineViewGrid },
  ]},
  { section: 'Inventory', items: [
    { path: '/products', label: 'All Products', icon: HiOutlineCube },
    { path: '/products/new', label: 'Add Product', icon: HiOutlinePlusCircle },
    { path: '/scanner', label: 'Barcode Scanner', icon: HiOutlineQrcode },
  ]},
  { section: 'Alerts & Logs', items: [
    { path: '/expiry-alerts', label: 'Expiry Alerts', icon: HiOutlineExclamationCircle },
    { path: '/audit-logs', label: 'Audit Logs', icon: HiOutlineClipboardList },
  ]},
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">SA</div>
        <h1>Star Air<span>Aviation Inventory</span></h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon className="nav-icon" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
