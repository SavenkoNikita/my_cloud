import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Проверяем права администратора
    if (!user || !user.is_administrator) {
      navigate('/storage');
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users/', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 403) {
        setError('У вас нет прав администратора');
      } else if (response.status === 401) {
        // Сессия истекла
        dispatch(logout());
        navigate('/login');
      }
    } catch (error) {
      setError('Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(`/api/auth/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        alert('Ошибка при удалении пользователя');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(`/api/auth/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ is_administrator: !currentStatus }),
        credentials: 'include',
      });

      if (response.ok) {
        setUsers(users.map(user =>
          user.id === userId
            ? { ...user, is_administrator: !currentStatus }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Функция для получения CSRF токена
  const getCsrfToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  if (loading) {
    return <div className="container">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <h2>Административная панель</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Административная панель</h2>
      <h3>Управление пользователями</h3>

      <div style={{ marginTop: '20px' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Логин</th>
              <th>Email</th>
              <th>Полное имя</th>
              <th>Администратор</th>
              <th>Файлов</th>
              <th>Общий размер</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.full_name}</td>
                <td>
                  <button
                    onClick={() => handleToggleAdmin(user.id, user.is_administrator)}
                    className={user.is_administrator ? 'btn-success' : 'btn-primary'}
                  >
                    {user.is_administrator ? 'Да' : 'Нет'}
                  </button>
                </td>
                <td>{user.files_count || 0}</td>
                <td>
                  {user.total_size
                    ? user.total_size < 1024 * 1024
                      ? `${(user.total_size / 1024).toFixed(2)} KB`
                      : `${(user.total_size / (1024 * 1024)).toFixed(2)} MB`
                    : '0 KB'
                  }
                </td>
                <td>
                  <button
                    onClick={() => navigate(`/storage?user_id=${user.id}`)}
                    className="btn-primary"
                  >
                    Файлы
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="btn-danger"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;
