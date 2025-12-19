import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Добро пожаловать в My Cloud Storage</h1>
        <p className="subtitle">Ваше надежное облачное хранилище для файлов</p>

        {user ? (
          <div className="cta-buttons">
            <Link to="/storage" className="cta-btn primary">Перейти в хранилище</Link>
            {user.is_administrator && (
              <Link to="/admin" className="cta-btn secondary">Админ-панель</Link>
            )}
          </div>
        ) : (
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn primary">Начать бесплатно</Link>
            <Link to="/login" className="cta-btn secondary">Войти в аккаунт</Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2 className="section-title">Возможности</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📁 Управление файлами</h3>
            <p>Загружайте, скачивайте, переименовывайте и удаляйте файлы прямо в браузере</p>
          </div>
          <div className="feature-card">
            <h3>🔗 Общие ссылки</h3>
            <p>Генерируйте безопасные ссылки для доступа к файлам без авторизации</p>
          </div>
          <div className="feature-card">
            <h3>👥 Администрирование</h3>
            <p>Для администраторов: управление пользователями и их хранилищами</p>
          </div>
          <div className="feature-card">
            <h3>🛡️ Безопасность</h3>
            <p>Ваши файлы защищены современными методами аутентификации и авторизации</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .home-container {
          padding: 2rem 0;
        }

        .hero-section {
          text-align: center;
          padding: 3rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          color: white;
          margin-bottom: 3rem;
        }

        .hero-section h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-btn {
          padding: 0.75rem 2rem;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .cta-btn.primary {
          background-color: #fff;
          color: #667eea;
        }

        .cta-btn.secondary {
          background-color: transparent;
          color: white;
          border: 2px solid white;
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .section-title {
          text-align: center;
          margin-bottom: 2rem;
          color: #2c3e50;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .feature-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        .feature-card h3 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 2rem;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .cta-btn {
            width: 100%;
            max-width: 300px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
