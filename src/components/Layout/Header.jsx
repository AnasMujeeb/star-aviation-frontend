import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLogout } from 'react-icons/hi';

const Header = ({ title }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="page-title">{title}</h2>
      </div>
      <div className="header-right">
        <button className="btn-logout" onClick={handleLogout}>
          <HiOutlineLogout style={{ marginRight: 4 }} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
