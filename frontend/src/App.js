import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import StoragePage from './pages/StoragePage';
import AdminPage from './pages/AdminPage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <div>
        <nav style={{
          padding: '20px',
          background: '#333',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Link to="/" style={{ color: 'white', marginRight: '20px' }}>Главная</Link>
            {user && (
              <Link to="/storage" style={{ color: 'white', marginRight: '20px' }}>
                Мое хранилище
              </Link>
            )}
            {user && user.is_administrator && (
              <Link to="/admin" style={{ color: 'white', marginRight: '20px' }}>
                Админ-панель
              </Link>
            )}
          </div>
          <div>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '15px' }}>Привет, {user.username}!</span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '5px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div>
                <Link to="/login" style={{ color: 'white', marginRight: '20px' }}>Вход</Link>
                <Link to="/register" style={{ color: 'white' }}>Регистрация</Link>
              </div>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/storage" element={user ? <StoragePage /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && user.is_administrator ? <AdminPage /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
