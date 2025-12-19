import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const response = await fetch('/api/auth/users/', {
        credentials: 'include',
      });

      if (response.ok) {
        const users = await response.json();
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
          const updatedUser = users.find(u => u.id === currentUser.id);
          if (updatedUser) {
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      }
    } catch (error) {
      console.log('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return { user, loading, login, logout, checkAuth };
}
