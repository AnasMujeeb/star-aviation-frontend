import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import AddEditProductPage from './pages/AddEditProductPage';
import ScannerPage from './pages/ScannerPage';
import ExpiryAlertsPage from './pages/ExpiryAlertsPage';
import AuditLogPage from './pages/AuditLogPage';

const pageTitles = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/products/new': 'Add Product',
  '/scanner': 'Barcode Scanner',
  '/expiry-alerts': 'Expiry Alerts',
  '/audit-logs': 'Audit Logs',
};

const App = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith('/products/edit')) return 'Edit Product';
    return pageTitles[location.pathname] || 'Star Air Aviation';
  };

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={
        <ProtectedRoute>
          <Layout title={getTitle()} />
        </ProtectedRoute>
      }>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<AddEditProductPage />} />
        <Route path="/products/edit/:id" element={<AddEditProductPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/expiry-alerts" element={<ExpiryAlertsPage />} />
        <Route path="/audit-logs" element={<AuditLogPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
