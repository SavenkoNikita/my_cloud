import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Просто вызываем синхронный logout action
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="logo-link">My Cloud</Link>
        </div>
        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/storage" className="nav-link">Мое хранилище</Link>
              {user.is_administrator && (
                <Link to="/admin" className="nav-link">Админ-панель</Link>
              )}
              <span className="user-greeting">Привет, {user.full_name || user.username}</span>
              <button onClick={handleLogout} className="logout-btn">Выйти</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Вход</Link>
              <Link to="/register" className="nav-link">Регистрация</Link>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>My Cloud Storage © 2024</p>
      </footer>
    </div>
  );
};

export default Layout;
