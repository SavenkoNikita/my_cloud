import React, { useEffect, useState } from 'react';

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="container">
      <h1>My Cloud Storage</h1>
      <p>Добро пожаловать в облачное хранилище файлов</p>

      {user ? (
        <div style={{
          background: '#e9ecef',
          padding: '20px',
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h3>Вы вошли как: {user.username}</h3>
          <p>Email: {user.email}</p>
          <p>Статус: {user.is_administrator ? 'Администратор' : 'Пользователь'}</p>
          <div style={{ marginTop: '20px' }}>
            <a
              href="/storage"
              style={{
                display: 'inline-block',
                background: '#007bff',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                textDecoration: 'none',
                marginRight: '10px'
              }}
            >
              Перейти к файлам
            </a>
            {user.is_administrator && (
              <a
                href="/admin"
                style={{
                  display: 'inline-block',
                  background: '#28a745',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  textDecoration: 'none'
                }}
              >
                Админ-панель
              </a>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h3>Для начала работы:</h3>
          <ol>
            <li>Зарегистрируйтесь или войдите в систему</li>
            <li>Загружайте файлы в свое хранилище</li>
            <li>Управляйте файлами: скачивайте, удаляйте, делитесь</li>
            <li>Если вы администратор, управляйте другими пользователями</li>
          </ol>
          <div style={{ marginTop: '20px' }}>
            <a
              href="/login"
              style={{
                display: 'inline-block',
                background: '#007bff',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                textDecoration: 'none',
                marginRight: '10px'
              }}
            >
              Войти
            </a>
            <a
              href="/register"
              style={{
                display: 'inline-block',
                background: '#28a745',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              Зарегистрироваться
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
