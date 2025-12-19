import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

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
      const response = await fetch(`/api/auth/users/${userId}/`, {
        method: 'DELETE',
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
      const response = await fetch(`/api/auth/users/${userId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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

  if (loading) {
    return <div className="container">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <h2>Административная панель</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Административная панель</h2>
      <h3>Управление пользователями</h3>

      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#343a40', color: 'white' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Логин</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Полное имя</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Администратор</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Файлов</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Общий размер</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '10px' }}>{user.id}</td>
                <td style={{ padding: '10px' }}>{user.username}</td>
                <td style={{ padding: '10px' }}>{user.email}</td>
                <td style={{ padding: '10px' }}>{user.full_name}</td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => handleToggleAdmin(user.id, user.is_administrator)}
                    style={{
                      background: user.is_administrator ? '#28a745' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    {user.is_administrator ? 'Да' : 'Нет'}
                  </button>
                </td>
                <td style={{ padding: '10px' }}>{user.files_count || 0}</td>
                <td style={{ padding: '10px' }}>
                  {user.total_size
                    ? user.total_size < 1024 * 1024
                      ? `${(user.total_size / 1024).toFixed(2)} KB`
                      : `${(user.total_size / (1024 * 1024)).toFixed(2)} MB`
                    : '0 KB'
                  }
                </td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => navigate(`/storage?user_id=${user.id}`)}
                    style={{
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      marginRight: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Файлы
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
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
