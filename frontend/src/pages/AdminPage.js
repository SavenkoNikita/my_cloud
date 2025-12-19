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
    if (userId === user.id) {
      alert('Вы не можете удалить самого себя!');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя? Все его файлы также будут удалены!')) return;

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
        alert('Пользователь успешно удален');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка при удалении пользователя');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Ошибка при удалении пользователя');
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    if (userId === user.id) {
      alert('Вы не можете изменить свои собственные права администратора!');
      return;
    }

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
        alert(`Права администратора ${!currentStatus ? 'предоставлены' : 'отозваны'}`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка при обновлении прав');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Ошибка при обновлении прав');
    }
  };

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

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="container">
      <h2>Административная панель</h2>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="user-stats" style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Статистика системы</h3>
        <p>Всего пользователей: <strong>{users.length}</strong></p>
        <p>Администраторов: <strong>{users.filter(u => u.is_administrator).length}</strong></p>
        <p>Обычных пользователей: <strong>{users.filter(u => !u.is_administrator).length}</strong></p>
      </div>

      <h3>Управление пользователями</h3>

      <div style={{ marginTop: '20px', overflowX: 'auto' }}>
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
            {users.map(userItem => (
              <tr key={userItem.id}>
                <td>{userItem.id}</td>
                <td>
                  {userItem.username}
                  {userItem.id === user.id && ' (Вы)'}
                </td>
                <td>{userItem.email}</td>
                <td>{userItem.full_name}</td>
                <td>
                  <button
                    onClick={() => handleToggleAdmin(userItem.id, userItem.is_administrator)}
                    className={`action-btn ${userItem.is_administrator ? 'btn-success' : 'btn-primary'}`}
                    disabled={userItem.id === user.id}
                    title={userItem.id === user.id ? "Нельзя изменить свои права" : ""}
                  >
                    {userItem.is_administrator ? 'Да' : 'Нет'}
                  </button>
                </td>
                <td>{userItem.files_count || 0}</td>
                <td>{formatFileSize(userItem.total_size)}</td>
                <td>
                  <button
                    onClick={() => navigate(`/storage?user_id=${userItem.id}`)}
                    className="action-btn btn-primary"
                    title="Просмотреть файлы пользователя"
                  >
                    Файлы
                  </button>
                  <button
                    onClick={() => handleDeleteUser(userItem.id)}
                    className="action-btn btn-danger"
                    disabled={userItem.id === user.id}
                    title={userItem.id === user.id ? "Нельзя удалить себя" : "Удалить пользователя"}
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
