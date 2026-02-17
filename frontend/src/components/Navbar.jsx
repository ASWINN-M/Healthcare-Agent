import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userName = localStorage.getItem('user_name');

    const handleLogout = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    HealthAgent
                </Link>

                <div className="nav-links">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>Dashboard</Link>
                    <Link to="/analyze" className={`nav-link ${isActive('/analyze')}`}>Symptoms</Link>
                    <Link to="/chat" className={`nav-link ${isActive('/chat')}`}>AI Chat</Link>
                    <Link to="/doctors" className={`nav-link ${isActive('/doctors')}`}>Find Doctors</Link>
                    <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>Profile</Link>
                </div>

                <div className="nav-user">
                    <span className="user-name">Hi, {userName || 'User'}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </div>

            <style>{`
        .navbar {
          background-color: white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          font-weight: 700;
          font-size: 1.5rem;
          color: var(--primary-color);
        }
        .nav-links {
          display: flex;
          gap: 1.5rem;
        }
        .nav-link {
          color: #4b5563;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--primary-color);
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-name {
          font-weight: 500;
          color: var(--text-color);
        }
        .btn-logout {
          background-color: transparent;
          border: 1px solid #e5e7eb;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          color: #4b5563;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-logout:hover {
          background-color: #fee2e2;
          color: var(--error);
          border-color: #fee2e2;
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
