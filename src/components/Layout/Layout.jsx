import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ title }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Header title={title} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
