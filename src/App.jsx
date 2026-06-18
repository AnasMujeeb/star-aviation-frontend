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

// Naye pages ko yahan import kiya hai
import IssueToolPage from './pages/issuetool'; 
import IssuedListPage from './pages/issuedlist'; 

const pageTitles = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/products/new': 'Add Product',
  '/scanner': 'Barcode Scanner',
  '/expiry-alerts': 'Expiry Alerts',
  '/audit-logs': 'Audit Logs',
  '/tool-issue': 'Issue Tool',         // Naya Title added
  '/issued-list': 'Issued Tools List', // Naya Title added
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
      {/* Public Route */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      {/* Protected Routes (Layout ke andar) */}
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
        
        {/* Naye Routes yahan add kar diye hain */}
        <Route path="/tool-issue" element={<IssueToolPage />} />
        <Route path="/issued-list" element={<IssuedListPage />} />
      </Route>

      {/* Wildcard Route for Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
