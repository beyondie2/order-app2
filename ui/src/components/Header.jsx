import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">COZY</Link>
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}
          >
            주문하기
          </Link>
          <Link 
            to="/admin" 
            className={`nav-btn ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            관리자
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;

